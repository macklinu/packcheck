'use strict'

const os = require('os')
const path = require('path')
const { promisify } = require('util')
const execa = require('execa')
const decompress = require('decompress')
const decompressTargz = require('decompress-targz')
const rimraf = promisify(require('rimraf'))
const mkdirp = promisify(require('mkdirp'))

const blacklist = {
  '.editorconfig': true,
}

async function npmPack() {
  return execa('npm', ['pack', '--silent'])
    .then(({ code, stdout }) => {
      if (code === 0) {
        const output = stdout.split('\n')
        return output[output.length - 1]
      }
      throw new Error('Something went wrong')
    })
    .catch(({ message }) => {
      throw new Error(message)
    })
}

function unpackPath(file) {
  const { name } = path.parse(file)
  return path.join(os.tmpdir(), name)
}

async function setup() {
  const targz = await npmPack()
  const dist = unpackPath(targz)
  await mkdirp(dist)
  return { targz, dist }
}

async function lint({ targz, dist }) {
  const files = (await decompress(targz, dist, {
    plugins: [decompressTargz()],
  })).map(({ path }) => path.replace(/^package\//, ''))

  const violations = files.filter(file => {
    const { dir, base } = path.parse(file)

    return (
      isBlacklisted(base) ||
      isLockfile(base) ||
      isRc(base) ||
      isJsConfig({ dir, base }) ||
      isTest({ dir, base })
    )
  })

  return { violations, targz, dist }
}

function isBlacklisted(base) {
  return blacklist[base] === true
}

function isRc(base) {
  return /^\..*rc(.json|.js|.yml|.yaml)?$/.test(base)
}

function isJsConfig({ dir, base }) {
  return !dir && /^.*\.config.js$/.test(base)
}

function isTest({ dir, base }) {
  return (
    /^.*__tests__.*$/.test(dir) ||
    dir === 'tests' ||
    /^.*\.(spec|test)\.(ts|js)x?$/.test(base)
  )
}

function isLockfile(base) {
  return base === 'yarn.lock' || base === 'package-lock.json'
}

async function log({ violations, targz, dist }) {
  console.log(violations)

  return { violations, targz, dist }
}

async function cleanup({ targz, dist }) {
  await rimraf(targz)
  await rimraf(dist)
}

setup()
  .then(lint)
  .then(log)
  .then(cleanup)
  .catch(console.error)
