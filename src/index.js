// @ts-check

const path = require('path')
const debug = require('debug')('check-code-coverage')

/**
 * Reads coverage JSON file produced with NYC reporter "json-summary"
 * and returns total statements percentage.
 * @param {string} filename File to read, by default "coverage/coverage-summary.json"
 * @returns {number} Percentage from 0 to 100
 */
function readCoverage(filename) {
  if (!filename) {
    filename = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
  }
  debug('reading coverage summary from: %s', filename)
  const coverage = require(filename)
  return coverage.total.statements.pct
}

function toPercent(x) {
  if (typeof x !== 'number') {
    throw new Error(`Expected ${x} to be a number, not ${typeof x}`)
  }
  if (x < 0) {
    return 0
  }
  if (x > 100) {
    return 100
  }
  return x
}

module.exports = {
  toPercent,
  readCoverage
}
