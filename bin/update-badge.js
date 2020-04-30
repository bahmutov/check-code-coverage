#!/usr/bin/env node
// @ts-check

const debug = require('debug')('check-code-coverage')
const path = require('path')
const fs = require('fs')

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

function updateBadge() {
  const coverageFilename = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
  const coverage = require(coverageFilename)
  const pct = coverage.total.statements.pct

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
      `https://img\\.shields\\.io/badge/code--coverage-\\d+%-${availableColorsReStr}`,
    )
    const coverageBadge = `https://img.shields.io/badge/code--coverage-${pct}%-${color}`
    debug('coverage regex: "%s"', coverageRe)
    debug('new coverage badge: "%s"', coverageBadge)

    const updatedReadmeText = readmeText.replace(
      coverageRe,
      (match) => {
        debug('match: %o', match)
        return coverageBadge
      },
    )
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

updateBadge()
