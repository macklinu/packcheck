import { ParsedPath } from 'path'

const blacklist: { [key: string]: boolean } = {
  '.editorconfig': true,
  'tsconfig.json': true,
}

export function isBlacklisted({ base }: ParsedPath): boolean {
  return blacklist[base] === true
}

export function isRc({ base }: ParsedPath): boolean {
  return /^\..*rc(.json|.js|.yml|.yaml)?$/.test(base)
}

export function isJsConfig({ dir, base }: ParsedPath): boolean {
  return !dir && /^.*\.config.js$/.test(base)
}

export function isTest({ dir, base }: ParsedPath): boolean {
  return (
    /^.*__tests__.*$/.test(dir) ||
    dir === 'tests' ||
    /^.*\.(spec|test)\.(ts|js)x?$/.test(base)
  )
}

export function isLockfile({ base }: ParsedPath): boolean {
  return base === 'yarn.lock' || base === 'package-lock.json'
}
