import { parse, ParsedPath } from 'path'
import { isBlacklisted, isJsConfig, isLockfile, isRc, isTest } from './is'

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

generateTests(isBlacklisted, [['.editorconfig', true], ['tsconfig.json', true]])

generateTests(isRc, [
  ['.eslintrc', true],
  ['.eslintrc.js', true],
  ['.eslintrc.json', true],
  ['.eslintrc.yaml', true],
])

generateTests(isJsConfig, [
  ['jest.config.js', true],
  ['lint-staged.config.js', true],
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
