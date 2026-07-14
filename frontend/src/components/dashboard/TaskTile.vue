<script setup>
defineProps({
  task: {
    type: Object,
    required: true,
  },
  showDragHandle: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["toggle"]);
</script>

<template>
  <v-card
    class="mb-2 task-tile"
    :class="{ 'task-tile--completed': task.completed }"
    :color="task.completed ? 'success' : 'tertiary'"
    variant="tonal"
    @click="emit('toggle', task.id)"
  >
    <v-card-text class="d-flex align-center pa-3">
      <div class="task-tile__content">
        <div
          class="font-weight-medium"
          :class="{ 'text-decoration-line-through': task.completed }"
        >
          {{ task.title }}
        </div>

        <div v-if="task.description" class="text-body-2 mt-1">
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

.task-tile__content {
  min-width: 0;
}

.drag-handle {
  cursor: grab;
}
</style>
