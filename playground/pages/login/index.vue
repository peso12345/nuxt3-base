<template>
  <div>
    登录页
    <!-- <img src="../../public/dog.png" /> -->
    <div>
      <!-- <img src="https://nuxt.com.cn/assets/ads/maomu-ads.png" /> -->
      <!-- <NuxtImg src="https://nuxt.com.cn/assets/ads/maomu-ads.png" /> -->
      <NuxtImg style="width: 100px;" src="../../dog.png" />
      <div class=" flex">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
      <h1 class="text-3xl font-bold underline">
        Hello world!
      </h1>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useGlobStore } from '~/store';

const store = useGlobStore()
// console.log(store.getCount());
// console.log(store.setCount(5));
// console.log(store.getCount());



</script>

<style scoped></style>