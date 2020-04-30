#!/usr/bin/env node
// @ts-check

const path = require('path')
const fs = require('fs')

function updateBadge() {
  const coverageFilename = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
  const coverage = require(coverageFilename)
  const pct = coverage.total.statements.pct

  const readmeFilename = path.join(process.cwd(), 'README.md')
  const readmeText = fs.readFileSync(readmeFilename, 'utf8')

  function replaceShield() {
    // note, Shields.io escaped '-' with '--'
    const coverageRe = new RegExp(
      'https://img\\.shields\\.io/badge/code--coverage-(\\d+)%-brightgreen',
    )
    const coverageBadge = `https://img.shields.io/badge/code--coverage-${pct}%-brightgreen`

    const updatedReadmeText = readmeText.replace(
      coverageRe,
      coverageBadge,
    )
    return updatedReadmeText
  }

  const maybeChangedText = replaceShield()
  if (maybeChangedText !== readmeText) {
    console.log('saving updated readme with coverage %d%%', pct)
    fs.writeFileSync(readmeFilename, maybeChangedText, 'utf8')
  }
}

updateBadge()
