#!/usr/local/bin/node

'use strict'

import packcheck, { cleanup } from '.'
import formatter from './formatter'
import yargs from 'yargs'

packcheck(yargs.argv)
  .then(async ({ violations, exitCode }) => {
    console.log(formatter(violations))
    await cleanup()
    process.exit(exitCode)
  })
  .catch(async err => {
    console.error(err)
    await cleanup()
    process.exit(1)
  })
