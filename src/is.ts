import { ParsedPath } from 'path'

const blacklistedConfigs: { [key: string]: boolean } = {
  '.editorconfig': true,
  'tsconfig.json': true,
}

function isRc({ base }: ParsedPath): boolean {
  return /^\..*rc(.json|.js|.yml|.yaml)?$/.test(base)
}

function isJsConfig({ dir, base }: ParsedPath): boolean {
  return !dir && /^.*\.config.js$/.test(base)
}

export function isConfig(path: ParsedPath): boolean {
  return (
    isJsConfig(path) || isRc(path) || blacklistedConfigs[path.base] === true
  )
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
