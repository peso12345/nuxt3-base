<template>
  <!-- <v-defaults-provider :defaults="{ 'VBtn': { 'color': 'primary', 'size': 'large', 'variant': 'tonal' } }"> -->
  <v-responsive class="border rounded">
    <NuxtLoadingIndicator :throttle="0" />
    <v-app :theme="theme">
      <v-app-bar class="px-3">
        <NuxtLink to="/">
          <v-avatar>
            <v-img :width="236" aspect-ratio="16/9" cover
              src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"></v-img>
          </v-avatar>
        </NuxtLink>

        <NavigationBar></NavigationBar>
        <v-spacer></v-spacer>

        <v-text-field append-inner-icon="mdi-magnify" density="compact" label="搜索" variant="solo"
          hide-details single-line @click:append-inner="onClickSearch" v-model="textSeach" @keyup.enter="onClickSearch"></v-text-field>

        <v-btn :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'" text="切换主题" slim
          @click="onClick"></v-btn>
      </v-app-bar>

      <v-main>
        <v-container>
          <slot>默认展示内容</slot>
        </v-container>
      </v-main>

      <v-footer class="bg-grey-lighten-1">
        <v-row justify="center" no-gutters>
          <v-btn v-for="link in links" :key="link" class="mx-2" color="white" rounded="xl" variant="text">
            {{ link }}
          </v-btn>
          <v-col class="text-center mt-4" cols="12">
            {{ new Date().getFullYear() }} — <strong>Vuetify</strong>
          </v-col>
        </v-row>
      </v-footer>
    </v-app>
  </v-responsive>
  <!-- </v-defaults-provider> -->
</template>

<script lang="ts" setup>
const theme = ref('light')
const textSeach = ref()
const links = [
  'Home',
  'About Us',
  'Team',
  'Services',
  'Blog',
  'Contact Us',
]

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

function onClickSearch(data) {
  console.log('onClickSearch', data, textSeach);
}

</script>

<style>
</style>