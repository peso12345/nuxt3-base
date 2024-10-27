import { useTimestamp } from "@vueuse/core";
import styles from "./memory-currTime.module.css";
const memory = useMemory().memory;
const dayjs = useDayjs();
const timestamp = useTimestamp({ offset: 0 });

export const memoryComponent = () => {
  return (
    <div class={styles["memory"]}>
      <div class={styles["memory-item"]}>
        <div> 使用：</div>
        <div>总大小：</div>
        <div>堆大小限制：</div>
      </div>
      <div>
        <div>
          {(memory.value?.usedJSHeapSize / 1024 / 1024).toFixed(2)}
          MB
        </div>
        <div>{(memory.value?.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
        <div>{(memory.value?.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</div>
      </div>
    </div>
  );
};

export const currTimeComponent = () => {
  return (
    <time datetime={dayjs().toString()}>
      {dayjs(timestamp.value).format("YYYY年MM月DD日 HH: mm: ss")}
    </time>
  );
};
