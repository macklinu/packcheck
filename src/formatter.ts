'use strict'

import { format } from 'path'
import { Violation } from '.'

export default function formatter(violations: Violation[]): string {
  if (violations.length) {
    return (
      'Violations found:\n' +
      violations
        .map(({ path, message }) => {
          return `* [${format(path)}]: ${message}`
        })
        .join('\n')
    )
  } else {
    return '🎉 No violations!'
  }
}
