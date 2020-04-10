# check-code-coverage
> Utilities for checking the coverage produced by NYC against extra or missing files

## Use

```shell
npm i -D check-code-coverage
# check if .nyc_output/out.json has 100% code coverage for main.js
npx check-coverage main.js
# check if .nyc_output/out.json has files foo.js and bar.js covered and nothing else
npx only-covered foo.js bar.js
```
