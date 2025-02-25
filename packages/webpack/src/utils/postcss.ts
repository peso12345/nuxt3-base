import { fileURLToPath, pathToFileURL } from 'node:url'
import createResolver from 'postcss-import-resolver'
import { interopDefault } from 'mlly'
import { requireModule, resolveAlias, tryResolveModule } from '@nuxt/kit'
import type { Nuxt, NuxtOptions } from '@nuxt/schema'
import { defu } from 'defu'
import type { Plugin } from 'postcss'
import { isAbsolute, resolve } from 'pathe'

const isPureObject = (obj: unknown): obj is object => obj !== null && !Array.isArray(obj) && typeof obj === 'object'

function sortPlugins ({ plugins, order }: NuxtOptions['postcss']): string[] {
  const names = Object.keys(plugins)
  return typeof order === 'function' ? order(names) : (order || names)
}

export async function getPostcssConfig (nuxt: Nuxt) {
  if (!nuxt.options.webpack.postcss || !nuxt.options.postcss) {
    return false
  }

  const postcssOptions = defu({}, nuxt.options.postcss, {
    plugins: {
      /**
       * https://github.com/postcss/postcss-import
       */
      'postcss-import': {
        resolve: createResolver({
          alias: { ...nuxt.options.alias },
          modules: nuxt.options.modulesDir,
        }),
      },

      /**
       * https://github.com/postcss/postcss-url
       */
      'postcss-url': {},
    },
    sourceMap: nuxt.options.webpack.cssSourceMap,
  })

  // Keep the order of default plugins
  if (!Array.isArray(postcssOptions.plugins) && isPureObject(postcssOptions.plugins)) {
    // Map postcss plugins into instances on object mode once
    const cwd = fileURLToPath(new URL('.', import.meta.url))
    const plugins: Plugin[] = []
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
        plugins.push(pluginFn(pluginOptions))
      }
    }

    // @ts-expect-error we are mutating type here from object to array
    postcssOptions.plugins = plugins
  }

  return {
    sourceMap: nuxt.options.webpack.cssSourceMap,
    ...nuxt.options.webpack.postcss,
    postcssOptions,
  }
}
