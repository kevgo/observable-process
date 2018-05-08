build:  # builds the production version
	rm -rf dist
	mkdir dist
	(cd src ; ../node_modules/.bin/flow-remove-types -d ../dist/ -q observable-process.js)
	node_modules/o-tools/bin/copy-flow-files

features: build  # runs the feature specs
	node_modules/cucumber/bin/cucumber-js

fix:  # runs the fixers
	node_modules/.bin/standard --fix

help:   # prints all make targets
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint: build  # runs the linters
	node_modules/.bin/flow
	node_modules/.bin/standard -v
	node_modules/.bin/standard-markdown
	node_modules/.bin/dependency-lint

setup:   # sets up the installation on this machine
	node_modules/o-tools/bin/check-paths
	yarn install

spec: features lint  # runs all tests

update:  # updates the dependencies
	yarn upgrade --latest
