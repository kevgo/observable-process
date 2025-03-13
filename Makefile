build: # builds the production version
	${CURDIR}/node_modules/.bin/tsc -p tsconfig-build.json

clean:  # removes all build artifacts
	rm -rf dist

coverage: build  # measures test coverage
	${CURDIR}/node_modules/.bin/nyc node_modules/.bin/mocha --require source-map-support/register src/*.test.ts
	${CURDIR}/node_modules/.bin/nyc report --reporter=text-lcov | node_modules/.bin/coveralls

fix:  # runs the fixers
	${CURDIR}/node_modules/.bin/eslint . --fix --ext .ts --ignore-path .eslintignore
	${CURDIR}/node_modules/.bin/prettier --write .
	${CURDIR}/node_modules/.bin/sort-package-json

help:   # prints all make targets
	cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v '.SILENT:' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint: # runs the linters
	${CURDIR}/node_modules/.bin/eslint . --ext .ts --ignore-path .eslintignore
	${CURDIR}/node_modules/.bin/prettier -l .
	${CURDIR}/node_modules/.bin/sort-package-json --check

setup:   # sets up the installation on this machine
	npm install
	make build

test: build lint unit   # runs all tests

unit:  # runs the unit tests
	${CURDIR}/node_modules/.bin/mocha src/*.test.ts --reporter dot

update:  # updates the dependencies
	npm-check-updates -u && npm install

.SILENT:
.DEFAULT_GOAL := help
