'use strict'

import { join } from 'path'
import { Violation } from '.'

export default function formatter(violations: Violation[]): string {
  if (violations.length) {
    return (
      'Violations found:\n' +
      violations
        .map(({ path, message }) => {
          return `* [${join(path.dir, path.base)}]: ${message}`
        })
        .join('\n')
    )
  } else {
    return '🎉 No violations!'
  }
}
