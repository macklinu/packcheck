'use strict'

import * as os from 'os'
import * as path from 'path'
import execa from 'execa'
import decompress from 'decompress'
import decompressTargz from 'decompress-targz'
import rimraf from './rimraf'
import mkdirp from './mkdirp'

import { isBlacklisted, isJsConfig, isLockfile, isRc, isTest } from './is'

let targz: string
let dist: string

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

async function cleanup(): Promise<void> {
  targz && (await rimraf(targz))
  dist && (await rimraf(dist))
}

async function main(): Promise<void> {
  const targz = await npmPack()
  const dist = unpackPath(targz)
  await mkdirp(dist)

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

  console.log(violations)
}

main()
  .then(cleanup)
  .catch(console.error)
