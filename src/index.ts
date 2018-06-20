#!/usr/local/bin/node

'use strict'

import * as os from 'os'
import { join, parse, ParsedPath } from 'path'
import execa from 'execa'
import decompress from 'decompress'
import decompressTargz from 'decompress-targz'

import rimraf from './rimraf'
import mkdirp from './mkdirp'
import {
  isLockfile,
  isConfig,
  isTest,
  isIgnore,
  isException,
  isMarkdown,
} from './is'

interface Violation {
  path: ParsedPath
  message: string
}

let targz: string
let dist: string
let exitCode: number = 0

async function npmPack(): Promise<string> {
  return execa('npm', ['pack', '--silent'])
    .then(({ code, stdout }) => {
      if (code === 0) {
        let output = stdout.split('\n')
        return output[output.length - 1]
      }
      throw new Error('Something went wrong')
    })
    .catch(({ message }) => {
      throw new Error(message)
    })
}

function unpackPath(file: string): string {
  let { name } = parse(file)
  return join(os.tmpdir(), name)
}

async function cleanup(): Promise<void> {
  targz && (await rimraf(targz))
  dist && (await rimraf(dist))
}

function determineViolation(path: ParsedPath): Violation | undefined {
  if (isLockfile(path)) {
    return { path, message: 'Lockfiles are not necessary to ship' }
  }
  if (isConfig(path)) {
    return { path, message: 'Configuration files are not necessary to ship' }
  }
  if (isTest(path)) {
    return { path, message: 'Test files are not necessary to ship' }
  }
  if (isIgnore(path)) {
    return { path, message: 'Ignore files are not necessary to ship' }
  }
  if (isMarkdown(path)) {
    return { path, message: 'Markdown files are not necessary to ship' }
  }
  return void 0
}

function formatViolation({ path, message }: Violation): string {
  return `* [${join(path.dir, path.base)}]: ${message}`
}

async function main(): Promise<void> {
  targz = await npmPack()
  dist = unpackPath(targz)
  await mkdirp(dist)

  let violations = (await decompress(targz, dist, {
    plugins: [decompressTargz()],
  }))
    .map(({ path }) => parse(path.replace(/^package\//, '')))
    .filter(path => !isException(path))
    .reduce(
      (violations, path) => {
        let violation = determineViolation(path)
        return violation ? [...violations, violation] : violations
      },
      [] as Violation[]
    )

  if (violations.length) {
    console.log('Violations found:\n')
    console.log(violations.map(formatViolation).join('\n'))
    exitCode = Math.min(violations.length, 255)
  } else {
    console.log('🎉 No violations!')
    exitCode = 0
  }
}

main()
  .then(cleanup)
  .then(() => {
    process.exit(exitCode)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
