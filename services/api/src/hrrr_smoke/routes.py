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
    forecast = request.args["forecast"]

    # Start and end points of the path for the cross-section (latitude,
    # longitude)
    start = (float(request.args["startLat"]), float(request.args["startLng"]))
    end = (float(request.args["endLat"]), float(request.args["endLng"]))

    # Number of steps taken along the path
    steps = 1200

    dataset = xr.open_zarr(current_app.config.forecasts_array, group=forecast)
    dataset = dataset.metpy.assign_crs(CF_ATTRS).metpy.parse_cf().squeeze()

    cross = cross_section(dataset, start, end, steps).set_coords(
        ("latitude", "longitude")
    )
    plevs = np.arange(1000.0, 100, -20.0, dtype=np.float32) * units.hPa
    temperature = units.Quantity(cross["t"].values, "degK")
    pressure = units.Quantity(cross["pres"].values, "Pa")
    potential_temperature = metpy.calc.potential_temperature(pressure, temperature)

    potential_temperature, massden, temperature = log_interpolate_1d(
        plevs,
        pressure,
        potential_temperature,
        cross["massden"].values,
        temperature,
        axis=0,
    )

    rows, columns = massden.shape

    return jsonify(
        columns=columns,
        distance=distance(start, end),
        isobaricPressure=sanitize([quantity.magnitude for quantity in plevs]).tolist(),
        massden=np.ravel(sanitize(massden)).tolist(),
        potentialTemperature=sanitize(
            [quantity.magnitude for quantity in np.ravel(potential_temperature)]
        ).tolist(),
        rows=rows,
    )
