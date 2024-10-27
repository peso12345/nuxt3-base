export const useGlobStore = defineStore("glob", () => {
  const count = ref(0);

  function getCount() {
    return unref(count);
  }
  function setCount(num: number) {
    count.value = num;
  }

  return { count, getCount, setCount };
});
