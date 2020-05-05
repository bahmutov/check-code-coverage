#!/usr/bin/env node
// @ts-check

const debug = require('debug')('check-code-coverage')
const path = require('path')
const fs = require('fs')
const os = require('os')
const arg = require('arg')
const {readCoverage, toPercent, badge} = require('..')

const args = arg({
  '--from': String, // input json-summary filename, by default "coverage/coverage-summary.json"
  '--set': String // so we can convert "78%" into numbers ourselves
})
debug('args: %o', args)

function updateBadge(args) {
  let pct = 0
  if (args['--set']) {
    // make sure we can handle "--set 70" and "--set 70%"
    pct = parseFloat(args['--set'])
    debug('using coverage number: %d', pct)
  } else {
    pct = readCoverage(args['--from'])
  }
  pct = toPercent(pct)
  debug('clamped coverage: %d', pct)

  const readmeFilename = path.join(process.cwd(), 'README.md')
  const readmeText = fs.readFileSync(readmeFilename, 'utf8')

  function replaceShield() {
    const coverageRe = badge.getCoverageRe()
    debug('coverage regex: "%s"', coverageRe)

    const coverageBadge = badge.getCoverageBadge(pct)
    debug('new coverage badge: "%s"', coverageBadge)
    if (!coverageBadge) {
      console.error('cannot form new badge for %d%', pct)
      return readmeText
    }

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
