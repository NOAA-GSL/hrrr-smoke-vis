from datetime import datetime, timedelta
from itertools import groupby
import os

from flask import Blueprint, current_app, jsonify, request
from metpy.interpolate import cross_section, log_interpolate_1d
from metpy.units import units
from pyproj import Geod
import metpy.calc
import numpy as np
import xarray as xr
import zarr

bp = Blueprint("api", __name__, url_prefix="/api")

# Projection information
CF_ATTRS = {
    "grid_mapping_name": "lambert_conformal_conic",
    "standard_parallel": 38.5,
    "longitude_of_central_meridian": -97.5,
    "latitude_of_projection_origin": 38.5,
}

# Radius of the Earth at the equator in meters. Used to calculate the length of
# the path.
EARTH_EQUATORIAL_RADIUS_M = 6371229.0


def sanitize(arr):
    """Return a sanitized np.array with NaN values replaced by None"""
    return np.where(np.isnan(arr), None, arr)


def distance(start, end):
    """Return the distance in kilometers between start and end on a globe"""
    geod = Geod(ellps="sphere", a=EARTH_EQUATORIAL_RADIUS_M)
    distance = geod.line_length((start[1], end[1]), (start[0], end[0]))

    return distance


@bp.route("/forecasts/")
def forecasts():
    current_app.logger.debug("GET /forecasts/")

    forecast_format = "%Y%j%H%M%S"
    z = zarr.open(current_app.config.forecasts_array)
    forecast_list = [
        (datetime.strptime(run_hour, forecast_format), list(map(int, forecast.valid_time)))
        for run_hour, forecast in z.groups()
    ]

    current_app.logger.debug(
        f"Loaded {len(forecast_list)} runs from {current_app.config.forecasts_array}"
    )

    forecast_list.sort(key=lambda t: t[0])

    response = [
            {
                "run_hour": run_hour.isoformat(),
                "valid_times": valid_times,
            }
            for run_hour, valid_times in forecast_list
        ]

    try:
        return jsonify(response)
    except Exception as e:
        current_app.logger.exception("Unable to serialize response")
        raise e



@bp.route("/xsection/")
def xsection():
    current_app.logger.debug("GET /xsection/")

    run_hour = datetime.strptime(request.args["runHour"], "%Y-%m-%dT%H:%M:%S")
    valid_time = int(request.args["validTime"])

    current_app.logger.debug(f"runHour: {run_hour}")
    current_app.logger.debug(f"validTime: {valid_time}")

    # Start and end points of the path for the cross-section (latitude,
    # longitude)
    start = (float(request.args["startLat"]), float(request.args["startLng"]))
    end = (float(request.args["endLat"]), float(request.args["endLng"]))

    current_app.logger.debug(f"start: {start}")
    current_app.logger.debug(f"end: {end}")

    # Number of steps taken along the path
    steps = 1200

    dataset = xr.open_zarr(
        f"{current_app.config.forecasts_array}/{run_hour.strftime('%Y%j%H%M%S')}"
    )
    dataset = dataset.isel(valid_time=valid_time).metpy.assign_crs(CF_ATTRS).metpy.parse_cf().squeeze()

    current_app.logger.debug(f"dataset: {dataset}")

    cross = cross_section(dataset, start, end, steps).set_coords(
        ("latitude", "longitude")
    )

    rows, columns = cross.massden_isobaric.shape

    return jsonify(
        columns=columns,
        distance=distance(start, end),
        isobaricPressure=sanitize(cross.isobaric).tolist(),
        massden=np.ravel(sanitize(cross.massden_isobaric)).tolist(),
        rows=rows,
    )
