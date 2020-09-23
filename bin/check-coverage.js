#!/usr/bin/env node
// @ts-check
const { join, resolve } = require('path')
const arg = require('arg')

const args = arg({
  '--from': String, // input filename, by default ".nyc_output/out.json"
})

const filenames = args._
if (!filenames.length) {
  console.error(
    'Usage: node %s <file name one> <file name two> ...',
    __filename,
  )
  process.exit(1)
}

const fromFilename = args['--from'] || join('.nyc_output', 'out.json')
const coverageFilename = resolve(fromFilename)
const coverage = require(coverageFilename)

filenames.forEach((filename) => {
  const fileCoverageKey = Object.keys(coverage).find((name) => {
    const fileCover = coverage[name]
    if (fileCover.path.endsWith(filename)) {
      return fileCover
    }
  })

  if (!fileCoverageKey) {
    console.error(
      'Could not find file %s in coverage in file %s',
      filename,
      coverageFilename,
    )
    process.exit(1)
  }

  const fileCoverage = coverage[fileCoverageKey]
  const statementCounters = fileCoverage.s
  const isThereUncoveredStatement = Object.keys(statementCounters).some(
    (k, key) => {
      return statementCounters[key] === 0
    },
  )
  if (isThereUncoveredStatement) {
    console.error(
      'file %s has statements that were not covered by tests',
      fileCoverage.path,
    )
    console.log('statement counters %o', statementCounters)

    process.exit(1)
  }

  console.log(
    '✅ All statements in file %s (found for %s) were covered',
    fileCoverage.path,
    filename,
  )
})
