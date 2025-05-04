import xarray as xr
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import matplotlib.pyplot as plt
import numpy as np

import metpy.calc as mpcalc
from metpy.cbook import get_test_data
from metpy.interpolate import cross_section
from metpy.units import DimensionalityError, units
from metpy.plots import USCOUNTIES
from timeit import default_timer as timer
from metpy.interpolate import log_interpolate_1d

import argparse

def geodesic(crs, start, end, steps):
    r"""Construct a geodesic path between two points.

    This function acts as a wrapper for the geodesic construction available in `pyproj`.

    Parameters
    ----------
    crs: `cartopy.crs`
        Cartopy Coordinate Reference System to use for the output
    start: (2, ) array_like
        A latitude-longitude pair designating the start point of the geodesic (units are
        degrees north and degrees east).
    end: (2, ) array_like
        A latitude-longitude pair designating the end point of the geodesic (units are degrees
        north and degrees east).
    steps: int, optional
        The number of points along the geodesic between the start and the end point
        (including the end points).

    Returns
    -------
    `numpy.ndarray`
        The list of x, y points in the given CRS of length `steps` along the geodesic.

    See Also
    --------
    cross_section

    """
    import cartopy.crs as ccrs
    from pyproj import Geod

    g = Geod(crs.proj4_init)
    # g = pyproj.Geod(ellps='WGS84')
    geodesic = np.concatenate([
        np.array(start[::-1])[None],
        np.array(g.npts(start[1], start[0], end[1], end[0], steps - 2)),
        np.array(end[::-1])[None]
    ]).transpose()
    points = crs.transform_points(ccrs.Geodetic(), *geodesic)[:, :2]

    return points

def fastXSection(ds, start, end, projection, steps=1200):
    points = geodesic(projection, start, end, steps)

    target_x = xr.DataArray(points[:,0], dims="index")
    target_y = xr.DataArray(points[:,1], dims="index")

    data_sliced = ds.interp({'x':target_x, 'y':target_y}, method='linear')
    data_sliced.coords['index'] = range(len(points))

    return data_sliced


def slowXSection(ds, start, end, steps=1200):
    return cross_section(ds, start, end, steps=steps).set_coords(('latitude', 'longitude'))


if __name__ == '__main__':

    file = "/data/2021-09-22/HRRR_NAT/20210922_0000.zarr"
    timestep = 2
    startPoint = (32.55, -117.03)
    endPoint = (41.95, -122.87)
    steps = 1200
      
    start = timer()
    ds = xr.open_zarr(file, consolidated=True)
    print ("open {}".format(timer()-start))

    # add projection information
    cf_attrs = {
        'grid_mapping_name': 'lambert_conformal_conic',
        'standard_parallel': 38.5,
        'longitude_of_central_meridian': -97.5,
        'latitude_of_projection_origin': 38.5
    }

    globe = ccrs.Globe(ellipse='sphere', semimajor_axis=6371229.0)
    projection = ccrs.LambertConformal(central_longitude=-97.5, central_latitude=38.5, 
                                standard_parallels=(38.5,38.5), globe=globe)

    # calculate native x,y in projection space
    lat = ds['latitude'][0,0].values
    lon = ds['longitude'][0,0].values

    first = projection.transform_points(ccrs.Geodetic(), lon, lat)[:, :2]

    dx = 3000.0
    dy = 3000.0
    x0 = first[0][0]
    y0 = first[0][1]
    nx = 1799
    ny = 1059

    x, y = np.arange(nx) * dx + x0, np.arange(ny) * dy + y0
   
    ds['x'] = x
    ds['y'] = y
    ds = ds.metpy.assign_crs(cf_attrs).metpy.parse_cf().squeeze()

    print ("proj setup {}".format(timer()-start))
 
    # to reduce time, only grab variables needed
    start = timer()
    drop_vars = []

    for v in ds.data_vars:
    	if v not in ['massden', 't_hybrid', 'q_hybrid', 'massden_hybrid', 'gh_hybrid', 'pres_hybrid', 'latitude', 'longitude']:
    		drop_vars.append(v)

    ds = ds.drop_vars(drop_vars)
    print ("drop {}".format(timer()-start))
    start = timer()

    ds = ds.isel(valid_time=timestep)
    print ("select time {}".format(timer()-start))

    # cross = slowXSection(ds, startPoint, endPoint, steps=steps)
    cross = fastXSection(ds, startPoint, endPoint, projection, steps=steps)

    print ("cross: {}".format(timer()-start))

    data_crs = ds['t_hybrid'].metpy.cartopy_crs

    # test data plot on hybrid level 
    if False:
    	fig = plt.figure(1, figsize=(16., 9.))
    	ax = plt.gca() 

    	cross['t_hybrid'].isel(valid_time=2).plot.contourf(levels=20)

    	# Define the CRS and inset axes
    	data_crs = ds['t_hybrid'].metpy.cartopy_crs
    	ax_inset = fig.add_axes([0.125, 0.665, 0.25, 0.25], projection=data_crs)

    	# Plot geopotential height at 500 hPa using xarray's contour wrapper
    	ax_inset.contourf(ds['x'][::10], ds['y'][::10], ds['t_hybrid'].isel(valid_time=2, hybrid=10)[::10,::10],
    	                levels=20, cmap='inferno')

    	# Plot the path of the cross section
    	endpoints = data_crs.transform_points(ccrs.Geodetic(),
    	                                      *np.vstack([startPoint, endPoint]).transpose()[::-1])
    	ax_inset.scatter(endpoints[:, 0], endpoints[:, 1], c='k', zorder=2)
    	ax_inset.plot(cross['x'], cross['y'], c='k', zorder=2)

    	# Add geographic features
    	ax_inset.coastlines()
    	ax_inset.add_feature(cfeature.STATES.with_scale('50m'), edgecolor='k', alpha=0.2, zorder=0)

    	plt.show()

    start = timer()
    plevs = np.arange(1000.0,100,-20.0, dtype=np.float32) * units.hPa
    print ("plevs: {}".format(timer()-start))

    # calculate derived fields
    temperature = units.Quantity(cross['t_hybrid'].values, 'degK')
    pressure = units.Quantity(cross['pres_hybrid'].values, 'Pa')
    specific_humidty =   units.Quantity(cross['q_hybrid'].values, 'kg/kg')

    # calculate potential temperature
    start = timer()
    pot_temp = mpcalc.potential_temperature(
        pressure,
        temperature
        #cross['pres_hybrid'],#pressure,
        #cross['t_hybrid']#temperature
    )
    print ("pot_temp: {}".format(timer()-start))

    if False:
        # calculate relative humidity
        rh = mpcalc.relative_humidity_from_specific_humidity(
            pressure,
            temperature,
            specific_humidty
        )

    start = timer()

    massden = cross['massden_hybrid'].values
 
    # convert from hybrid to isobaric levels
    pot_temp, massden, temp = log_interpolate_1d(plevs, pressure, pot_temp, massden, temperature, axis=0)
    print ("interp: {}".format(timer()-start))

    # create isobaric dataset
    startT = timer()
    cross['isobaric'] = plevs

    temp_da = xr.DataArray(temp, dims=['isobaric', 'index'])

    pt_da = xr.DataArray(pot_temp, dims=['isobaric', 'index'])
    massden_da = xr.DataArray(massden, dims=['isobaric', 'index'])

    cross['t_isobaric'] = temp_da
    cross['pot_temp_isobaric'] = pt_da 
    cross['massden_isobaric'] = massden_da 

    cross = cross.drop_vars(['gh_hybrid', 'massden_hybrid', 'q_hybrid', 'pres_hybrid', 't_hybrid', 'hybrid'])
    print(cross)
    # cross.to_dataframe().to_csv("cross.csv")
    print ("da_create: {}".format(timer()-start))

    # plot xsection
    fig = plt.figure(1, figsize=(16., 9.))
    ax = plt.gca() 

    # custom color levels and values for smoke
    clevels = [ 0,1,2,4,6,8,12,16,20,25,30,40,60,100,200, 210 ]
    # clevels = [ 2,5,8,11,15,20,25,30,40,50,75,150,250,500 ]
    ccolors = [ 
                    [ 252, 254, 255, 255  ],  # 2
                    [ 202, 235, 251, 255 ],  # 21
                    [ 150, 212, 243, 255 ],  # 40
                    [ 106, 173, 220, 255 ],  # 59
                    [  72, 147, 184, 255 ],  # 78
                    [  73, 167, 116, 255 ],  # 97
                    [ 106, 191,  74, 255 ],  # 116
                    [ 197, 217,  85, 255 ],  # 135
                    [ 249, 205,  81, 255 ],  # 154
                    [ 246, 140,  55, 255 ],  # 173
                    [ 236,  86,  41, 255 ],  # 192
                    [ 218,  47,  40, 255 ],  # 211
                    [ 190,  28,  35, 255 ],  # 230
                    [ 158,  23,  28, 255 ],  # 249
                    [ 140,  35,  204, 255 ],  # 255
                 ]

    newc = []
    for x in ccolors:
         tmpr = []
         for y in x:
            tmpr.append(y/255.0)
         newc.append(tmpr)

    ccolors = newc   

    contour = ax.contourf(cross['index'], cross['isobaric'], massden, 
    	levels=clevels, colors=ccolors, extend='both')
    contour.cmap.set_under('k')
    contour.cmap.set_bad('black',1.)
    colorbar = fig.colorbar(contour)
    #vmax=210, 

    # Plot potential temperature using contour, with some custom labeling
    theta_contour = ax.contour(cross['index'], cross['isobaric'], pot_temp,
                               levels=np.arange(250, 450, 5), colors='k', linewidths=2)
    theta_contour.clabel(theta_contour.levels[1::2], fontsize=8, colors='k', inline=1,
                         inline_spacing=8, fmt='%i', rightside_up=True, use_clabeltext=True)

    # Adjust the y-axis to be logarithmic
    # ax.set_yscale('symlog')
    ax.set_yticklabels(np.arange(1000, 277, -100))
    ax.set_ylim(1000, 277)
    ax.set_yticks(np.arange(1000, 277, -100))

    # create inset showing x to y subplot
    ax_inset = fig.add_axes([0.125, 0.665, 0.25, 0.25], projection=data_crs)

    # Plot geopotential height at 500 hPa using xarray's contour wrapper
    inset_ds = ds
    ax_inset.contourf(inset_ds['x'][::10], inset_ds['y'][::10], inset_ds['massden'][::10,::10],
                    colors=ccolors, levels=clevels, vmin=0, vmax=200)

    # Plot the path of the cross section
    endpoints = data_crs.transform_points(ccrs.Geodetic(),
                                          *np.vstack([startPoint, endPoint]).transpose()[::-1])
    ax_inset.scatter(endpoints[:, 0], endpoints[:, 1], c='k', zorder=2)
    ax_inset.plot(cross['x'], cross['y'], c='k', zorder=2)

    # Add geographic features
    ax_inset.coastlines()
    ax_inset.add_feature(cfeature.STATES.with_scale('50m'), edgecolor='k', alpha=0.2, zorder=0)
    # ax_inset.add_feature(USCOUNTIES.with_scale('20m'), edgecolor='k', alpha=0.2, zorder=0)

    plt.show()
