#!/usr/bin/env node
// @ts-check

const debug = require('debug')('check-code-coverage')
const path = require('path')
const fs = require('fs')
const os = require('os')
const arg = require('arg')

const args = arg({
  '--from': String, // input json-summary filename, by default "coverage/coverage-summary.json"
  '--set': String // so we can convert "78%" into numbers ourselves
})
debug('args: %o', args)

const availableColors = ['red', 'yellow', 'green', 'brightgreen']

const availableColorsReStr = '(:?' + availableColors.join('|') + ')'

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

function readCoverage(filename) {
  if (!filename) {
    filename = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
  }
  debug('reading coverage summary from: %s', filename)
  const coverage = require(filename)
  return coverage.total.statements.pct
}

function updateBadge(args) {
  let pct = 0
  if (args['--set']) {
    // make sure we can handle "--set 70" and "--set 70%"
    pct = parseFloat(args['--set'])
    debug('using coverage number: %d', pct)
  } else {
    pct = readCoverage(args['--from'])
  }
  if (pct < 0) {
    pct = 0
  } else if (pct > 100) {
    pct = 100
  }
  debug('clamped coverage: %d', pct)

  const readmeFilename = path.join(process.cwd(), 'README.md')
  const readmeText = fs.readFileSync(readmeFilename, 'utf8')

  function replaceShield() {
    const color = getColor(pct)
    debug('for coverage %d% badge color "%s"', pct, color)
    if (!availableColors.includes(color)) {
      console.error('cannot pick code coverage color for %d%', pct)
      console.error('color "%s" is invalid', color)
      return readmeText
    }

    // note, Shields.io escaped '-' with '--'
    const coverageRe = new RegExp(
      `https://img\\.shields\\.io/badge/code--coverage-\\d+%25-${availableColorsReStr}`,
    )
    const coverageBadge = `https://img.shields.io/badge/code--coverage-${pct}%25-${color}`
    debug('coverage regex: "%s"', coverageRe)
    debug('new coverage badge: "%s"', coverageBadge)

    let found
    let updatedReadmeText = readmeText.replace(
      coverageRe,
      (match) => {
        found = true
        debug('match: %o', match)
        return coverageBadge
      },
    )

    if (!found) {
      console.log('⚠️ Could not find code coverage badge in file %s', readmeFilename)
      console.log('Insert new badge on the first line')
      // use NPM package name as label to flag where this badge is coming from
      const badge = `![check-code-coverage](${coverageBadge})`
      debug('inserting new badge: %s', badge)

      const lines = readmeText.split(os.EOL)
      if (lines.length < 1) {
        console.error('File %s has no lines, cannot insert code coverage badge', readmeFilename)
        return readmeText
      }
      lines[0] += ' ' + badge
      updatedReadmeText = lines.join(os.EOL)
    }
    return updatedReadmeText
  }

  const maybeChangedText = replaceShield()
  if (maybeChangedText !== readmeText) {
    console.log('saving updated readme with coverage %d%%', pct)
    fs.writeFileSync(readmeFilename, maybeChangedText, 'utf8')
  } else {
    debug('no code coverage badge change')
  }
}

updateBadge(args)
