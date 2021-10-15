import os

from s3fs import S3FileSystem, S3Map
import xarray as xr


def handler(event, context):
    region = os.environ.get("AWS_REGION", "us-east-1")
    s3 = S3FileSystem(anon=True, client_kwargs={"region_name": region})

    bucket = os.environ["HRRR_SMOKE_BUCKET"]
    file_path = "sample.zarr"

    store = S3Map(root=f"{bucket}/{file_path}", s3=s3, check=False)

    dataset = xr.open_zarr(store)

    return dataset.massden.shape
