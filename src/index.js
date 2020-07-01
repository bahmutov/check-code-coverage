// @ts-check

const path = require('path')
const fs = require('fs')
const debug = require('debug')('check-code-coverage')

/**
 * Reads coverage JSON file produced with NYC reporter "json-summary"
 * and returns total statements percentage.
 * @param {string} filename File to read, by default "coverage/coverage-summary.json"
 * @returns {number} Percentage from 0 to 100
 */
function readCoverage(filename) {
  debug('reading coverage from %o', { filename })
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

const availableColors = ['red', 'yellow', 'green', 'brightgreen']

const availableColorsReStr = '(:?' + availableColors.join('|') + ')'

function getCoverageRe() {
  // note, Shields.io escaped '-' with '--'
  const coverageRe = new RegExp(
    `https://img\\.shields\\.io/badge/code--coverage-\\d+%25-${availableColorsReStr}`
  )
  return coverageRe
}

function getColor(coveredPercent) {
  if (coveredPercent < 60) {
    return 'red'
  }
  if (coveredPercent < 80) {
    return 'yellow'
  }
  if (coveredPercent < 90) {
    return 'green'
  }
  return 'brightgreen'
}

function getCoverageBadge(pct) {
  const color = getColor(pct) || 'lightgrey'
  debug('for coverage %d% badge color "%s"', pct, color)

  const coverageBadge = `https://img.shields.io/badge/code--coverage-${pct}%25-${color}`
  return coverageBadge
}

function getCoverageFromReadme(
  readmeFilename = path.join(__dirname, 'README.md')
) {
  const readmeText = fs.readFileSync(readmeFilename, 'utf8')

  const coverageRe = new RegExp(
    `https://img\\.shields\\.io/badge/code--coverage-(\\d+)%25-${availableColorsReStr}`
  )
  const matches = coverageRe.exec(readmeText)

  if (!matches) {
    console.log('Could not find coverage badge in README')
    return
  }
  debug('coverage badge "%s" percentage "%s"', matches[0], matches[1])
  const pct = toPercent(parseFloat(matches[1]))
  debug('parsed percentage: %d', pct)
  return pct
}

module.exports = {
  toPercent,
  readCoverage,
  badge: {
    availableColors,
    availableColorsReStr,
    getCoverageFromReadme,
    getCoverageRe,
    getCoverageBadge,
  },
}
