<template>
  <div>
    <v-list class="flex">
      <v-list-item v-for="route in routers">
        <NuxtLink :to="route.path"><v-btn>{{ route.name }}</v-btn></NuxtLink>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()
console.log(router.getRoutes())
const routers = router.getRoutes()
</script>

<style scoped></style>