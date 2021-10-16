import os

from cartopy.crs import Globe, Geodetic
from metpy.interpolate import cross_section, log_interpolate_1d
from metpy.units import units
from s3fs import S3FileSystem, S3Map
import metpy.calc
import numpy as np
import xarray as xr

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
    globe = Globe(ellipse="sphere", semimajor_axis=EARTH_EQUATORIAL_RADIUS_M)
    geod = Geodetic(globe).get_geod()
    _, _, distance = geod.inv(start[1], start[0], end[1], end[0])

    return distance


def handler(event, context):
    # Start and end points of the path for the cross-section (latitude,
    # longitude)
    start = (32.55, -117.03)
    end = (41.95, -122.87)

    # Number of steps taken along the path
    steps = 1200

    region = os.environ.get("AWS_REGION", "us-east-1")
    s3 = S3FileSystem(anon=True, client_kwargs={"region_name": region})

    bucket = os.environ["HRRR_SMOKE_BUCKET"]
    file_path = "sample.zarr"

    store = S3Map(root=f"{bucket}/{file_path}", s3=s3, check=False)

    dataset = xr.open_zarr(store)
    dataset = dataset.metpy.assign_crs(CF_ATTRS).metpy.parse_cf().squeeze()

    cross = cross_section(dataset, start, end, steps).set_coords(
        ("latitude", "longitude")
    )
    plevs = np.arange(1000.0, 100, -20.0, dtype=np.float32) * units.hPa
    temperature = units.Quantity(cross["t_hybrid"].values, "degK")
    pressure = units.Quantity(cross["pres_hybrid"].values, "Pa")
    potential_temperature = metpy.calc.potential_temperature(pressure, temperature)

    potential_temperature, massden, temperature = log_interpolate_1d(
        plevs,
        pressure,
        potential_temperature,
        cross["massden_hybrid"].values,
        temperature,
        axis=0,
    )

    rows, columns = massden.shape

    return {
        "columns": columns,
        "distance": distance(start, end),
        "isobaricPressure": sanitize(
            [quantity.magnitude for quantity in plevs]
        ).tolist(),
        "massden": np.ravel(sanitize(massden)).tolist(),
        "potentialTemperature": sanitize(
            [quantity.magnitude for quantity in np.ravel(potential_temperature)]
        ).tolist(),
        "rows": rows,
    }
