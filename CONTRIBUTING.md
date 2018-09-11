# Exosphere Command Sender for JS Developer Guidelines

## Install

- add `./node_modules/.bin` to your PATH
- make sure you have [make](https://www.gnu.org/software/make) installed
- run `make setup`

## Testing

- run all tests: `make spec`
- run linters: `make lint`
- run feature specs: `make features`

## Update

```
$ yarn upgrade --latest
```

## Deploy a new version

```
$ yarn version
$ git push
$ git push --tags // CI will publish to NPM
```
