FROM jupyter/scipy-notebook

RUN conda install --yes \
        gdal \
        metpy \
        pygrib \
        pyproj \
        rasterio \
        xarray \
        zarr && \
    conda clean --all --force --yes && \
    fix-permissions "${CONDA_DIR}" && \
    fix-permissions "/home/${NB_USER}"
