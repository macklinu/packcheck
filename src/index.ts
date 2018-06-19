'use strict'

import * as os from 'os'
import * as path from 'path'
import execa from 'execa'
import decompress from 'decompress'
import decompressTargz from 'decompress-targz'
import rimraf from './rimraf'
import mkdirp from './mkdirp'

import { isBlacklisted, isJsConfig, isLockfile, isRc, isTest } from './is'

async function npmPack(): Promise<string> {
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

function unpackPath(file: string): string {
  const { name } = path.parse(file)
  return path.join(os.tmpdir(), name)
}

async function setup(): Promise<{ targz: string; dist: string }> {
  const targz = await npmPack()
  const dist = unpackPath(targz)
  await mkdirp(dist)
  return { targz, dist }
}

async function lint({
  targz,
  dist,
}: {
  targz: string
  dist: string
}): Promise<{
  targz: string
  dist: string
  violations: string[]
}> {
  const files = (await decompress(targz, dist, {
    plugins: [decompressTargz()],
  })).map(({ path }) => path.replace(/^package\//, ''))

  const violations = files.filter(file => {
    const parsedPath = path.parse(file)

    return (
      isBlacklisted(parsedPath) ||
      isLockfile(parsedPath) ||
      isRc(parsedPath) ||
      isJsConfig(parsedPath) ||
      isTest(parsedPath)
    )
  })

  return { violations, targz, dist }
}

async function log({
  violations,
  targz,
  dist,
}: {
  targz: string
  dist: string
  violations: string[]
}): Promise<{
  targz: string
  dist: string
  violations: string[]
}> {
  console.log(violations)

  return { violations, targz, dist }
}

async function cleanup({
  targz,
  dist,
}: {
  targz: string
  dist: string
}): Promise<void> {
  await rimraf(targz)
  await rimraf(dist)
}

setup()
  .then(lint)
  .then(log)
  .then(cleanup)
  .catch(console.error)
