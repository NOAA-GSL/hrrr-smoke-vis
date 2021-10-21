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

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY entrypoint.sh /
COPY app.py ${FUNCTION_DIR}

ENTRYPOINT ["/entrypoint.sh"]
CMD ["app.handler"]
