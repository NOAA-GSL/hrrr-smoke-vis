FROM python:3.9.7

ARG FUNCTION_DIR="/var/task"
WORKDIR ${FUNCTION_DIR}

# For now, we have to build Proj from source because none of the Python Docker
# images have version 8 in their respective package managers. Proj 8.1.1 is in
# the edge branch of Alpine currently. So perhaps sometime after November 2021
# we may be able to use python:3.9.7-alpine and just apk add proj.
ENV LD_LIBRARY_PATH=/lib:/usr/lib:/usr/local/lib
RUN apt-get update -y \
    && apt-get install --no-install-recommends -y \
        libgeos-dev \
        sqlite3 \
    && cd /tmp \
    && curl -Lo proj-8.1.1.tar.gz https://download.osgeo.org/proj/proj-8.1.1.tar.gz \
    && tar xvzf proj-8.1.1.tar.gz \
    && cd proj-8.1.1 \
    && ./configure \
    && make \
    && make install \
    && rm -rf proj-8.1.1.tar.gz proj-8.1.1 \
    && cd ${FUNCTION_DIR} \
    && pip install --upgrade pip \
    && pip install awslambdaric \
    && curl -Lo /usr/local/bin/aws-lambda-rie \
        https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie \
    && chmod +x /usr/local/bin/aws-lambda-rie

# Install dependencies manually instead of using the requirements.txt file as a
# way of avoiding installing matplotlib, which is currently a dependency of
# MetPy.
# https://github.com/Unidata/MetPy/issues/2163#issuecomment-947944293
RUN pip install \
        Cartopy==0.20.1 \
        numpy==1.21.2 \
        Pint==0.17 \
        pooch==1.5.2 \
        pyproj==3.2.1 \
        scipy==1.7.1 \
        s3fs==2021.10.1 \
        traitlets==5.1.0 \
        xarray==0.19.0 \
        zarr==2.10.1 \
    && pip install --no-deps MetPy==1.1.0

COPY entrypoint.sh /
COPY app.py ${FUNCTION_DIR}

ENTRYPOINT ["/entrypoint.sh"]
CMD ["app.handler"]
