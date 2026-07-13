import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useSettingsStore = defineStore(
  "settings",
  () => {
    const username = ref("");
    const birthday = ref("");

    return {
      username,
      birthday,
    };
  },
  {
    persist: true,
  },
);
