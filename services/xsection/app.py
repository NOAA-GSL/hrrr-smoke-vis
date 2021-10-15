from urllib.request import urlopen
import os


def handler(event, context):
    region = os.environ.get("AWS_REGION", "us-east-1")

    bucket = os.environ["HRRR_SMOKE_BUCKET"]
    file_path = "smoke/hello.json"

    bucket_url = f"https://s3.{region}.amazonaws.com/{bucket}/{file_path}"
    print(bucket_url)

    with urlopen(bucket_url) as response:
        data = response.read()

    return data
