"""Utilities for working with HRRR output"""

from collections import namedtuple
from datetime import datetime, timedelta

import cartopy.crs as ccrs
import numpy as np
import xarray as xr


__all__ = ["read_grib"]


EARTH_EQUATORIAL_RADIUS_M = 6371229.0


ForecastDate = namedtuple("ForecastDate", ["analysis_date", "valid_date"])


def parse_grib_filename(filename):
    """Return the analysis and valid dates encoded in GRIB2 filenames."""

    analysis_date = filename[:-2]
    forecast_hour = int(filename[-2:])

    analysis_date = datetime.strptime(analysis_date, "%y%j%H%M%S")
    valid_date = analysis_date + timedelta(hours=forecast_hour)

    return ForecastDate(analysis_date, valid_date)


def grid(grib_msg):
    central_latitude = grib_msg.LaDInDegrees
    central_longitude = grib_msg.LoVInDegrees
    standard_parallels = (
        grib_msg.Latin1InDegrees,
        grib_msg.Latin2InDegrees,
    )

    globe = ccrs.Globe(ellipse="sphere", semimajor_axis=EARTH_EQUATORIAL_RADIUS_M)
    lambert = ccrs.LambertConformal(
        central_latitude=central_latitude,
        central_longitude=central_longitude,
        standard_parallels=standard_parallels,
        globe=globe,
    )

    start = [
        grib_msg.longitudeOfFirstGridPointInDegrees,
        grib_msg.latitudeOfFirstGridPointInDegrees,
    ]

    if start[0] > 180:
        start[0] -= 360

    dx = grib_msg.DxInMetres
    dy = grib_msg.DyInMetres

    nx = grib_msg.Nx
    ny = grib_msg.Ny

    x0, y0 = lambert.transform_point(start[0], start[1], ccrs.Geodetic())

    return (
        np.arange(nx) * dx + x0,
        np.arange(ny) * dy + y0,
    )


def to_data_array(grib_msg):
    x, y = grid(grib_msg)
    lats, lons = grib_msg.latlons()

    data_array = xr.DataArray(
        np.array([grib_msg.values]),
        coords={
            "latitude": (["y", "x"], lats),
            "longitude": (["y", "x"], lons),
            "level": [grib_msg.level],
            "x": x,
            "y": y,
        },
        dims=["level", "y", "x"],
        attrs={
            "analysis_date": grib_msg.analDate.strftime("%Y%j%H%M%S"),
            "forecast_time": grib_msg.forecastTime,
            "valid_date": grib_msg.validDate.strftime("%Y%j%H%M%S"),
        },
    )

    return data_array


def read_grib(grib_msgs, variable_names=[], short_names={}):
    """Return an xarray.DataSet created from grib_msgs

    The dataset contains the variables massden (smoke concentration), t
    (temperature in K), pres (pressure), and gh (geopotential height).
    """
    variables = {}
    analysis_date = None
    valid_date = None

    for msg in grib_msgs:
        name = (
            short_names.get(msg.parameterName, "unknown")
            if msg.shortName == "unknown"
            else msg.shortName
        )

        if len(variable_names) and name not in variable_names:
            continue

        data_array = to_data_array(msg)
        analysis_date = data_array.attrs["analysis_date"]
        valid_date = data_array.attrs["valid_date"]

        if name not in variables:
            variables[name] = data_array
        else:
            variables[name] = xr.combine_by_coords([variables[name], data_array])

    return xr.Dataset(
        variables,
        attrs={
            "analysis_date": analysis_date,
            "valid_date": valid_date,
        },
    )
