import { parse, ParsedPath } from 'path'
import {
  isConfig,
  isLockfile,
  isTest,
  isIgnore,
  isException,
  isMarkdown,
} from './is'

function generateTests(
  fn: (path: ParsedPath) => boolean,
  cases: [string, boolean][]
): void {
  test.each(cases)(
    `${fn.name}(%s) === %s`,
    (path: string, expected: boolean) => {
      expect(fn(parse(path))).toBe(expected)
    }
  )
}

generateTests(isConfig, [
  ['jest.config.js', true],
  ['lint-staged.config.js', true],
  ['.eslintrc', true],
  ['.eslintrc.js', true],
  ['.eslintrc.json', true],
  ['.eslintrc.yaml', true],
  ['.editorconfig', true],
  ['tsconfig.json', true],
])

generateTests(isTest, [
  ['tests/index.js', true],
  ['some/nested/directory/file.test.js', true],
])

generateTests(isLockfile, [
  ['yarn.lock', true],
  ['package-lock.json', true],
  ['nested/directory/yarn.lock', true],
])

generateTests(isIgnore, [
  ['.eslintignore', true],
  ['.prettierignore', true],
  ['.gitignore', true],
  ['ignore.js', false],
])

generateTests(isException, [
  ['package.json', true],
  ['README', true],
  ['README.txt', true],
  ['README.md', true],
  ['readme.md', true],
  ['CHANGES', true],
  ['CHANGES.txt', true],
  ['CHANGES.md', true],
  ['changes.md', true],
  ['CHANGELOG', true],
  ['CHANGELOG.txt', true],
  ['CHANGELOG.md', true],
  ['changelog.md', true],
  ['HISTORY', true],
  ['HISTORY.txt', true],
  ['HISTORY.md', true],
  ['history.md', true],
  ['LICENSE', true],
  ['LICENSE.txt', true],
  ['LICENSE.md', true],
  ['license.md', true],
  ['LICENCE', true],
  ['LICENCE.txt', true],
  ['LICENCE.md', true],
  ['licence.md', true],
  ['NOTICE', true],
  ['NOTICE.txt', true],
  ['NOTICE.md', true],
  ['notice.md', true],
  ['LICENCE', true],
  ['LICENCE.txt', true],
  ['LICENCE.md', true],
  ['licence.md', true],
  ['some/nested/CHANGELOG', false],
])

generateTests(isMarkdown, [
  ['CONTRIBUTING.md', true],
  ['README.MARKDOWN', true],
  ['some/nested/file/README.mdown', true],
  ['markdown.js', false],
])
