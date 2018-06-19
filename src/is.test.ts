import { parse, ParsedPath } from 'path'
import { isConfig, isLockfile, isTest, isIgnore } from './is'

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
