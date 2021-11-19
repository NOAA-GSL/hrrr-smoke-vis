FROM python:3.7

WORKDIR /usr/src/app

RUN pip3 install \
        gunicorn \
        inotify \
        poetry \
    && poetry config virtualenvs.create false

COPY . .
RUN poetry install --no-interaction --no-ansi

EXPOSE 8000
CMD ["gunicorn", "hrrr_smoke.wsgi:app", "--bind=0.0.0.0:8000", "--reload", "--timeout", "600"]
