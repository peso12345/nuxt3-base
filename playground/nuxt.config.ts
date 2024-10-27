import { extendRouteRules } from "@nuxt/kit";

export default defineNuxtConfig({
  compatibilityDate: '2024-06-28',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'dayjs-nuxt',
    '@vueuse/nuxt',
    '@formkit/auto-animate',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@nuxtjs/device',
    'vuetify-nuxt-module',
    '@nuxtjs/tailwindcss',
  ],
})