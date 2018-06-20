import { ParsedPath } from 'path'

const blacklistedConfigs: { [key: string]: boolean } = {
  '.editorconfig': true,
  'tsconfig.json': true,
}

const fileExceptions: { [key: string]: boolean } = {
  readme: true,
  changes: true,
  license: true,
  licence: true,
  notice: true,
  changelog: true,
  history: true,
}

const markdownExtensions: { [key: string]: boolean } = {
  md: true,
  markdown: true,
  mdown: true,
  mkdn: true,
  mkd: true,
  mdwn: true,
  mkdown: true,
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

export function isIgnore(path: ParsedPath): boolean {
  return /^.*ignore$/.test(path.base)
}

export function isException(path: ParsedPath): boolean {
  return (
    path.base === 'package.json' ||
    (!path.dir && fileExceptions[path.name.toLowerCase()])
  )
}

export function isMarkdown(path: ParsedPath): boolean {
  return markdownExtensions[path.ext.slice(1).toLowerCase()] === true
}
