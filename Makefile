# platform-specificity
ifdef ComSpec
	/ := $(strip \)
else
	/ := /
endif

build: # builds the production version
	@node_modules$/.bin$/tsc -p tsconfig-build.json

clean:  # removes all build artifacts
	@rm -rf dist

coverage: build  # measures test coverage
	node_modules/.bin/nyc node_modules/.bin/mocha --require source-map-support/register test/*-test.ts
	node_modules/.bin/nyc report --reporter=text-lcov | node_modules/.bin/coveralls

fix:  # runs the fixers
	tslint --project . --fix
	node_modules/.bin/prettier --write .

help:   # prints all make targets
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint: # runs the linters
	node_modules/.bin/tslint --project .
	node_modules/.bin/prettier -l .

setup:   # sets up the installation on this machine
	node_modules/o-tools/bin/check-paths
	yarn install

test: build lint unit   # runs all tests

unit:  # runs the unit tests
	@node_modules/.bin/mocha test/*-test.ts --reporter dot

update:  # updates the dependencies
	yarn upgrade --latest
