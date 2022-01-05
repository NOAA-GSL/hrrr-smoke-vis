from datetime import datetime, timedelta
import os

from flask import current_app
from flask.cli import FlaskGroup
import click
import pygrib
import xarray as xr
import zarr

from . import hrrr
import hrrr_smoke


@click.group(cls=FlaskGroup, create_app=hrrr_smoke.create_app)
def cli():
    """Commands for the HRRR Smoke cross-section API"""
    pass


@cli.command()
@click.option("--skip-old-forecasts/--no-skip-old-forecasts", default=True)
@click.argument(
    "grib_paths",
    nargs=-1,
    type=click.Path(exists=True, readable=True, dir_okay=False, resolve_path=True),
)
@click.argument("zarr_path", type=click.Path(resolve_path=True))
def convert(skip_old_forecasts, grib_paths, zarr_path):
    """Convert a GRIB2 file into a compressed Zarr array"""

    grib_queue = {}
    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)

    for grib_path in grib_paths:
        _, filename = os.path.split(grib_path)
        forecast_date = hrrr.parse_grib_filename(filename)
        group_name = forecast_date.valid_date.strftime("%Y%j%H%M%S")

        # Skip old forecasts
        if skip_old_forecasts and forecast_date.valid_date < now:
            current_app.logger.debug(f"{filename} is in the past, skipping")
            continue

        grib_queue[group_name] = max(grib_path, grib_queue.get(group_name, ""))

    if len(grib_queue) < 1:
        current_app.logger.info("No forecasts to update, exiting")
        return 0

    z_array = None
    if os.path.exists(zarr_path):
        current_app.logger.info(f"Updating Zarr file {zarr_path}")
        z_array = zarr.convenience.open(zarr_path, mode="r")
    else:
        current_app.logger.info(f"Creating new Zarr file {zarr_path}")

    for group_name, grib_path in grib_queue.items():
        _, filename = os.path.split(grib_path)

        group_exists = z_array and group_name in z_array
        if group_exists and z_array[group_name].attrs["source_filename"] >= filename:
            current_app.logger.debug(
                f"Forecast for {group_name} exists, skipping {filename}"
            )
            continue

        current_app.logger.info(f"Parsing {grib_path}")
        with pygrib.open(grib_path) as grib:
            dataset = hrrr.read_grib(
                grib.select(typeOfLevel="hybrid"),
                ["pres", "gh", "massden", "t"],
                {"Mass density": "massden"},
            )

        current_app.logger.info(f"Writing to {zarr_path}/{group_name}")

        group = f"/{group_name}"
        dataset.attrs["source_filename"] = filename
        dataset.to_zarr(zarr_path, group=group, mode="w")
