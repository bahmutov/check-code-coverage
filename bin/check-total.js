#!/usr/bin/env node
// @ts-check
const { join, resolve } = require('path')
const arg = require('arg')

const args = arg({
  '--from': String, // input json-summary filename, by default "coverage/coverage-summary.json"
  '--min': Number
})

const minStatementPercentage = args['--min'] || 80
const fromFilename = args['--from'] || join('coverage', 'coverage-summary.json')
const coverageFilename = resolve(fromFilename)

const coverage = require(coverageFilename)
const total = coverage.total
if (!total) {
  console.error('Could not find "total" object in %s', fromFilename)
  process.exit(1)
}

// total should have objects for lines, statements, functions and branches
// each object should have total, covered, skipped and pct numbers
const statements = total.statements
if (!statements) {
  console.error('Could not find statements in total %o', total)
  process.exit(1)
}

if (statements.pct < minStatementPercentage) {
  console.log('🚨 Statement coverage %d is below minimum %d%%', statements.pct, minStatementPercentage)
  console.log('file %s', coverageFilename)
  process.exit(1)
}

console.log(
  '✅ Total statement coverage %d%% is >= minimum %d%%',
  statements.pct, minStatementPercentage
)
