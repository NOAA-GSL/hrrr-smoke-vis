BIN := ./node_modules/.bin

geo2topo := $(BIN)/geo2topo
ndjson-filter := $(BIN)/ndjson-filter
shp2json := $(BIN)/shp2json

CONUS_FILTER := '+d.properties.STATEFP <= 56 && !["02", "15"].includes(d.properties.STATEFP)'

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

tmp/geo/states.ndjson: tmp/geo/tl_2020_us_state/tl_2020_us_state.shp
	$(shp2json) -n $^ | $(ndjson-filter) $(CONUS_FILTER) > $@

tmp/geo/counties.ndjson: tmp/geo/tl_2020_us_county/tl_2020_us_county.shp
	$(shp2json) -n $^ | $(ndjson-filter) $(CONUS_FILTER) > $@

src/static/data/us.json: src/data/ tmp/geo/states.ndjson tmp/geo/counties.ndjson
	$(geo2topo) -q 1e5 -n states=tmp/geo/states.ndjson counties=tmp/geo/counties.ndjson > $@

clean:
	rm -rf tmp/geo/ src/data/us.json
