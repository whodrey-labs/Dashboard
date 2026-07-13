import { computed, ref } from "vue";

export function useFieldSavedState() {
  const isEditing = ref(false);

  function handleFocus() {
    isEditing.value = true;
  }

  function handleBlur() {
    isEditing.value = false;
  }

  const icon = computed(() => (isEditing.value ? "mdi-pencil" : "mdi-check"));
  const color = computed(() => (isEditing.value ? "warning" : "success"));

  return {
    isEditing,
    handleFocus,
    handleBlur,
    icon,
    color,
  };
}
