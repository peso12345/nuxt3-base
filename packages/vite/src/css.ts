import { fileURLToPath, pathToFileURL } from 'node:url'
import { requireModule, resolveAlias, tryResolveModule } from '@nuxt/kit'
import type { Nuxt, NuxtOptions } from '@nuxt/schema'
import type { InlineConfig as ViteConfig } from 'vite'
import { interopDefault } from 'mlly'
import type { Plugin } from 'postcss'
import { isAbsolute, resolve } from 'pathe'

function sortPlugins ({ plugins, order }: NuxtOptions['postcss']): string[] {
  const names = Object.keys(plugins)
  return typeof order === 'function' ? order(names) : (order || names)
}

export async function resolveCSSOptions (nuxt: Nuxt): Promise<ViteConfig['css']> {
  const css: ViteConfig['css'] & { postcss: NonNullable<Exclude<NonNullable<ViteConfig['css']>['postcss'], string>> } = {
    postcss: {
      plugins: [],
    },
  }

  css.postcss.plugins = []

  const postcssOptions = nuxt.options.postcss

  const cwd = fileURLToPath(new URL('.', import.meta.url))
  for (const pluginName of sortPlugins(postcssOptions)) {
    const pluginOptions = postcssOptions.plugins[pluginName]
    if (!pluginOptions) { continue }

    let pluginPath: string | undefined = resolveAlias(pluginName, nuxt.options.alias)
    let pluginFn: (opts: Record<string, any>) => Plugin

    if (pluginPath[0] === '.') {
      pluginPath = resolve(nuxt.options.rootDir, pluginPath)
    }

    const path = await tryResolveModule(pluginPath, nuxt.options.modulesDir)

    // TODO: use jiti v2
    if (path) {
      pluginFn = await import(pathToFileURL(path).href).then(interopDefault)
    } else {
      // warn for libraries, not for local plugins
      if (!isAbsolute(pluginPath)) {
        console.warn(`[nuxt] could not import postcss plugin \`${pluginName}\` with ESM. Please report this as a bug.`)
      }
      // fall back to cjs
      pluginFn = requireModule(pluginPath, { paths: [cwd] })
    }
    if (typeof pluginFn === 'function') {
      css.postcss.plugins.push(pluginFn(pluginOptions))
    }
  }

  return css
}
