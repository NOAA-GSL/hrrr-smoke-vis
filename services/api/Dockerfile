FROM python:3.7

WORKDIR /usr/src/app

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
    && cd /usr/src/app \
    && pip3 install \
        gunicorn \
        inotify \
        poetry \
    && poetry config virtualenvs.create false

COPY . .
RUN poetry install --no-interaction --no-ansi

EXPOSE 8000
CMD ["gunicorn", "hrrr_smoke.wsgi:app", "--bind=0.0.0.0:8000", "--reload", "--timeout", "600"]
