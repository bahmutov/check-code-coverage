#!/usr/bin/env node
// @ts-check

const got = require('got')
const debug = require('debug')('check-code-coverage')
const {readCoverage, toPercent} = require('..')

const arg = require('arg')

const args = arg({
  '--from': String // input json-summary filename, by default "coverage/coverage-summary.json"
})
debug('args: %o', args)

async function setGitHubCommitStatus(options, envOptions) {
  const pct = toPercent(readCoverage(options.filename))
  debug('setting commit coverage: %d', pct)
  debug('with options %o', {
    repository: envOptions.repository,
    sha: envOptions.sha
  })

  // REST call to GitHub API
  // https://developer.github.com/v3/repos/statuses/
  // https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#example-calling-the-rest-api
  const url = `https://api.github.com/repos/${envOptions.repository}/statuses/${envOptions.sha}`
  // @ts-ignore
  const res = await got.post(url, {
    headers: {
      authorization: `Bearer ${envOptions.token}`
    },
    json: {
      context: 'code-coverage',
      state: 'success',
      description: `${pct}% of statements`
    }
  })
  console.log('response status: %d %s', res.statusCode, res.statusMessage)
}

function checkEnvVariables(env) {
  if (!env.GITHUB_TOKEN) {
    console.error('Cannot find environment variable GITHUB_TOKEN')
    process.exit(1)
  }

  if (!env.GITHUB_REPOSITORY) {
    console.error('Cannot find environment variable GITHUB_REPOSITORY')
    process.exit(1)
  }

  if (!env.GITHUB_SHA) {
    console.error('Cannot find environment variable GITHUB_SHA')
    process.exit(1)
  }
}

checkEnvVariables(process.env)

const options = {
  filename: args['--file']
}
const envOptions = {
  token: process.env.GITHUB_TOKEN,
  repository: process.env.GITHUB_REPOSITORY,
  sha: process.env.GITHUB_SHA
}
setGitHubCommitStatus(options, envOptions).catch(e => {
  console.error(e)
  process.exit(1)
})
