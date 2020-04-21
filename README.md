# check-code-coverage [![ci status][ci image]][ci url]
> Utilities for checking the coverage produced by NYC against extra or missing files

## Use

```shell
npm i -D check-code-coverage
# check if .nyc_output/out.json has 100% code coverage for main.js
npx check-coverage main.js
# check if .nyc_output/out.json has files foo.js and bar.js covered and nothing else
npx only-covered foo.js bar.js
```

## only-covered

By default `only-covered` script reads `.nyc_output/out.json` file from the current working directory. You can specify a different file using `--from` parameter

```shell
only-covered --from examples/exclude-files/coverage/coverage-final.json main.js
check-coverage --from examples/exclude-files/coverage/coverage-final.json main.js
```

[ci image]: https://github.com/bahmutov/check-code-coverage/workflows/ci/badge.svg?branch=master
[ci url]: https://github.com/bahmutov/check-code-coverage/actions
