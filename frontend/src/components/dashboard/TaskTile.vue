<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  showDragHandle: {
    type: Boolean,
    default: true,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  deleteMode: {
    type: Boolean,
    default: false,
  },
  selectedForDelete: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle", "edit", "select"]);

function handleClick() {
  if (props.deleteMode) {
    emit("select", props.task.id);

    return;
  }

  if (props.editMode) {
    emit("edit", props.task);

    return;
  }

  emit("toggle", props.task.id);
}
</script>

<template>
  <v-card
    class="mb-2 task-tile"
    :class="{
      'task-tile--completed': task.completed,
      'task-tile--selected': selectedForDelete,
    }"
    :color="deleteMode && selectedForDelete ? 'error' : task.completed ? 'success' : 'tertiary'"
    variant="tonal"
    @click="handleClick"
  >
    <v-card-text class="d-flex align-center pa-3">
      <div class="task-tile__content">
        <div
          class="task-tile__title"
          :class="{ 'text-decoration-line-through': task.completed }"
        >
          {{ task.title }}
        </div>

        <div v-if="task.description" class="task-tile__description mt-1">
          {{ task.description }}
        </div>
      </div>

      <v-icon
        v-if="showDragHandle"
        class="ml-auto drag-handle"
        icon="mdi-drag"
        size="small"
        @click.stop
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.task-tile {
  cursor: pointer;
}

.task-tile--completed {
  opacity: 0.78;
}

.task-tile--selected {
  opacity: 1;
}

.task-tile__content {
  min-width: 0;
}

.task-tile__title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.25rem;
}

.task-tile__description {
  font-size: 0.75rem;
  line-height: 1rem;
}

.drag-handle {
  cursor: grab;
}
</style>
