import { relative, resolve } from 'pathe'
import escapeRE from 'escape-string-regexp'
import type { NuxtOptions } from 'nuxt/schema'

interface ImportProtectionOptions {
  rootDir: string
  modulesDir: string[]
  patterns: [importPattern: string | RegExp, warning?: string][]
  exclude?: Array<RegExp | string>
}

export const nuxtImportProtections = (nuxt: { options: NuxtOptions }, options: { isNitro?: boolean } = {}) => {
  const patterns: ImportProtectionOptions['patterns'] = []

  patterns.push([
    /^(nuxt|nuxt3|nuxt-nightly)$/,
    '`nuxt`, `nuxt3` or `nuxt-nightly` cannot be imported directly.' + (options.isNitro ? '' : ' Instead, import runtime Nuxt composables from `#app` or `#imports`.'),
  ])

  patterns.push([
    /^((~|~~|@|@@)?\/)?nuxt\.config(\.|$)/,
    'Importing directly from a `nuxt.config` file is not allowed. Instead, use runtime config or a module.',
  ])

  patterns.push([/(^|node_modules\/)@vue\/composition-api/])

  for (const mod of nuxt.options.modules.filter(m => typeof m === 'string')) {
    patterns.push([
      new RegExp(`^${escapeRE(mod as string)}$`),
      'Importing directly from module entry-points is not allowed.',
    ])
  }

  for (const i of [/(^|node_modules\/)@nuxt\/(kit|test-utils)/, /(^|node_modules\/)nuxi/, /(^|node_modules\/)nuxt\/(config|kit|schema)/, 'nitropack']) {
    patterns.push([i, 'This module cannot be imported' + (options.isNitro ? ' in server runtime.' : ' in the Vue part of your app.')])
  }

  if (options.isNitro) {
    for (const i of ['#app', /^#build(\/|$)/]) {
      patterns.push([i, 'Vue app aliases are not allowed in server runtime.'])
    }
  }

  if (!options.isNitro) {
    patterns.push([
      new RegExp(escapeRE(relative(nuxt.options.srcDir, resolve(nuxt.options.srcDir, nuxt.options.serverDir || 'server'))) + '\\/(api|routes|middleware|plugins)\\/'),
      'Importing from server is not allowed in the Vue part of your app.',
    ])
  }

  return patterns
}
