# HRRR Smoke Vis

This is an **experimental** project to create a web application capable of generating a visualization of smoke concentration in a vertical cross-section along user-defined paths in the United States using the forecasts from NOAA’s HRRR model.

## Getting Started

It's easiest to run all of the services for the application using [Docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/).

First create a `.env` file defining a `UID` and `GID` variable that match the user ID and group ID of your user. This is just to ensure that any files created by the Docker containers have the correct ownership values when written to the local directories that are mounted into the container for development.

```
echo "UID: $(id -u)" >> .env
echo "GID: $(id -g)" >> .env
```

Next, you'll need to install the Node dependencies for the frontend.

```
docker-compose run --rm frontend install
```

Finally, you can start all of the services.

```
docker-compse up
```

The frontend will be available in your browser at https://localhost:5000

## Disclaimer

This repository is a scientific product and is not official communication of the National Oceanic and Atmospheric Administration, or the United States Department of Commerce. All NOAA GitHub project code is provided on an “as is” basis and the user assumes responsibility for its use. Any claims against the Department of Commerce or Department of Commerce bureaus stemming from the use of this GitHub project will be governed by all applicable Federal law. Any reference to specific commercia products, processes, or services by service mark, trademark, manufacturer, or otherwise, does not constitute or imply their endorsement, recommendation or favoring by the Department of Commerce. The Department of Commerce seal and logo, or the seal and logo of a DOC bureau, shall not be used in any manner to imply endorsement of any commercial product or activity by DOC or the United States Government.
