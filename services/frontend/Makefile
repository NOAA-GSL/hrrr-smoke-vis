all: src/static/data/us.json

src/static/data/:
	mkdir -p $@

tmp/geo/:
	mkdir -p $@

tmp/geo/tl_2020_us_state/:
	mkdir -p $@

tmp/geo/tl_2020_us_county/:
	mkdir -p $@

tmp/geo/tl_2020_us_state.zip: tmp/geo/
	curl -o $@ 'https://www2.census.gov/geo/tiger/TIGER2020/STATE/tl_2020_us_state.zip'

tmp/geo/tl_2020_us_county.zip: tmp/geo/
	curl -o $@ 'https://www2.census.gov/geo/tiger/TIGER2020/COUNTY/tl_2020_us_county.zip'

tmp/geo/tl_2020_us_state/tl_2020_us_state.shp: tmp/geo/tl_2020_us_state.zip tmp/geo/tl_2020_us_state/
	unzip $< -d tmp/geo/tl_2020_us_state/

tmp/geo/tl_2020_us_county/tl_2020_us_county.shp: tmp/geo/tl_2020_us_county.zip tmp/geo/tl_2020_us_county/
	unzip $< -d tmp/geo/tl_2020_us_county/

tmp/geo/states.json: tmp/geo/tl_2020_us_state/tl_2020_us_state.shp
	./node_modules/.bin/shp2json $^ > $@

tmp/geo/counties.json: tmp/geo/tl_2020_us_county/tl_2020_us_county.shp
	./node_modules/.bin/shp2json $^ > $@

src/static/data/us.json: src/data/ tmp/geo/states.json tmp/geo/counties.json
	./node_modules/.bin/geo2topo states=tmp/geo/states.json counties=tmp/geo/counties.json > $@

clean:
	rm -rf tmp/geo/ src/data/us.json
