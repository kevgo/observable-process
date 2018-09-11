# platform-specificity
ifdef ComSpec
	/ := $(strip \)
else
	/ := /
endif

build: clean  # builds the production version
	@mkdir dist
	@node_modules$/.bin$/tsc -p .

clean:  # removes all build artifacts
	@rm -rf dist

features: build  # runs the feature specs
	@node_modules/cucumber/bin/cucumber-js

fix:  # runs the fixers
	tslint --project tsconfig.json --fix
	prettier --write src/*.ts
	prettier --write **/*.md

help:   # prints all make targets
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint: build  # runs the linters
	node_modules$/.bin$/tsc --noEmit
	node_modules/.bin/prettier -l "src/**/*.ts"
	node_modules/.bin/prettier -l "**/*.md"

setup:   # sets up the installation on this machine
	node_modules/o-tools/bin/check-paths
	yarn install

spec: lint features   # runs all tests

update:  # updates the dependencies
	yarn upgrade --latest
