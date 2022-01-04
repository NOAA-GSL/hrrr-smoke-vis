import os

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
@click.argument(
    "grib_filename",
    nargs=-1,
    type=click.Path(exists=True, readable=True, dir_okay=False, resolve_path=True),
)
@click.argument("zarr_filename", click.Path(resolve_path=True))
def convert(grib_filename, zarr_filename):
    """Convert a GRIB2 file into a compressed Zarr array"""

    # Map the valid dates to the analysis dates so that we can determine which
    # forecasts have more recent model runs and should be updated in our Zarr.
    extant_forecasts = {}
    if os.path.exists(zarr_filename):
        z_array = zarr.convenience.open(zarr_filename, "r")

        for (_, group) in z_array.groups():
            analysis_date = group.attrs["analysis_date"]
            valid_date = group.attrs["valid_date"]

            # Data is grouped in the zarr by the valid date, so there should
            # only ever be one analysis available for any given valid date.
            assert (
                valid_date not in extant_forecasts
            ), f"Found multiple forecasts for same valid date: {valid_date}"

            extant_forecasts[valid_date] = analysis_date

    print(f"Reading {grib_filename}")
    with pygrib.open(grib_filename) as grib:
        dataset = hrrr.read_grib(
            grib.select(typeOfLevel="hybrid"),
            ["pres", "gh", "massden", "t"],
            {"Mass density": "massden"},
        )
    print("done")

    group = f"/{dataset.attrs['valid_date']}"
    print(f"Writing to {zarr_filename}{group}")
    dataset.to_zarr(zarr_filename, group=group, mode="w")
    print("done")
