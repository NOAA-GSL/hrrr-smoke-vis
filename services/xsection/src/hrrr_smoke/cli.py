import os

from flask.cli import FlaskGroup
import click
import pygrib
import xarray as xr

from . import hrrr
import hrrr_smoke


@click.group(cls=FlaskGroup, create_app=hrrr_smoke.create_app)
def cli():
    """Commands for the HRRR Smoke cross-section API"""
    pass


@cli.command()
@click.argument("grib_filename")
@click.argument("zarr_filename")
def convert(grib_filename, zarr_filename):
    """Convert a GRIB2 file into a compressed Zarr array"""

    print(f"Reading {grib_filename}")
    with pygrib.open(grib_filename) as grib:
        dataset = hrrr.read_grib(
            grib.select(typeOfLevel="hybrid"),
            ["pres", "gh", "massden", "t"],
            {"Mass density": "massden"},
        )
    print("done")

    group = f"/{dataset.attrs['analysis_date']}"
    if os.path.exists(f"{zarr_filename}{group}"):
        print(f"Writing to {zarr_filename}: {group}")
        dataset.to_zarr(zarr_filename, group=group, append_dim="forecast_time")
    else:
        print(f"Creating {zarr_filename}: {group}")
        dataset.to_zarr(zarr_filename, group=group)
    print("done")
