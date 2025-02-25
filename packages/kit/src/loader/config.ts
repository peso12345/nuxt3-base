import { existsSync } from 'node:fs'
import type { JSValue } from 'untyped'
import { applyDefaults } from 'untyped'
import type { ConfigLayer, ConfigLayerMeta, LoadConfigOptions } from 'c12'
import { loadConfig } from 'c12'
import type { NuxtConfig, NuxtOptions } from '@nuxt/schema'
import { NuxtConfigSchema } from '@nuxt/schema'
import { globby } from 'globby'
import defu from 'defu'
import { join } from 'pathe'

export interface LoadNuxtConfigOptions extends Omit<LoadConfigOptions<NuxtConfig>, 'overrides'> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  overrides?: Exclude<LoadConfigOptions<NuxtConfig>['overrides'], Promise<any> | Function>
}

const layerSchemaKeys = ['future', 'srcDir', 'rootDir', 'serverDir', 'dir']
const layerSchema = Object.create(null)
for (const key of layerSchemaKeys) {
  if (key in NuxtConfigSchema) {
    layerSchema[key] = NuxtConfigSchema[key]
  }
}

export async function loadNuxtConfig (opts: LoadNuxtConfigOptions): Promise<NuxtOptions> {
  // Automatically detect and import layers from `~~/layers/` directory
  opts.overrides = defu(opts.overrides, {
    _extends: await globby('layers/*', {
      onlyDirectories: true,
      cwd: opts.cwd || process.cwd(),
    }),
  });
  (globalThis as any).defineNuxtConfig = (c: any) => c
  const result = await loadConfig<NuxtConfig>({
    name: 'nuxt',
    configFile: 'nuxt.config',
    rcFile: '.nuxtrc',
    extend: { extendKey: ['theme', 'extends', '_extends'] },
    dotenv: true,
    globalRc: true,
    ...opts,
  })
  delete (globalThis as any).defineNuxtConfig
  const { configFile, layers = [], cwd } = result
  const nuxtConfig = result.config!

  // Fill config
  nuxtConfig.rootDir = nuxtConfig.rootDir || cwd
  nuxtConfig._nuxtConfigFile = configFile
  nuxtConfig._nuxtConfigFiles = [configFile]

  const defaultBuildDir = join(nuxtConfig.rootDir!, '.nuxt')
  if (!opts.overrides?._prepare && !nuxtConfig.dev && !nuxtConfig.buildDir && nuxtConfig.future?.compatibilityVersion === 4 && existsSync(defaultBuildDir)) {
    nuxtConfig.buildDir = join(nuxtConfig.rootDir!, 'node_modules/.cache/nuxt/.nuxt')
  }

  const _layers: ConfigLayer<NuxtConfig, ConfigLayerMeta>[] = []
  const processedLayers = new Set<string>()
  for (const layer of layers) {
    // Resolve `rootDir` & `srcDir` of layers
    layer.config = layer.config || {}
    layer.config.rootDir = layer.config.rootDir ?? layer.cwd!

    // Only process/resolve layers once
    if (processedLayers.has(layer.config.rootDir)) { continue }
    processedLayers.add(layer.config.rootDir)

    // Normalise layer directories
    layer.config = await applyDefaults(layerSchema, layer.config as NuxtConfig & Record<string, JSValue>) as unknown as NuxtConfig

    // Filter layers
    if (!layer.configFile || layer.configFile.endsWith('.nuxtrc')) { continue }
    _layers.push(layer)
  }

  ;(nuxtConfig as any)._layers = _layers

  // Ensure at least one layer remains (without nuxt.config)
  if (!_layers.length) {
    _layers.push({
      cwd,
      config: {
        rootDir: cwd,
        srcDir: cwd,
      },
    })
  }

  // Resolve and apply defaults
  return await applyDefaults(NuxtConfigSchema, nuxtConfig as NuxtConfig & Record<string, JSValue>) as unknown as NuxtOptions
}
