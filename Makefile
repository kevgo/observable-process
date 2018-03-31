build:
	rm -rf dist
	mkdir dist
	(cd src ; ../node_modules/.bin/flow-remove-types -d ../dist/ -q observable-process.js)
	node_modules/o-tools/bin/copy-flow-files

features: build
	node_modules/cucumber/bin/cucumber-js

fix:
	node_modules/.bin/standard --fix

lint: build
	node_modules/.bin/flow
	node_modules/.bin/standard -v
	node_modules/.bin/standard-markdown
	node_modules/.bin/dependency-lint

setup:
	node_modules/o-tools/bin/check-paths
	yarn install

spec: features lint
