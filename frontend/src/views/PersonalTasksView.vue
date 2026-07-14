<script setup>
import { computed, ref } from "vue";
import draggable from "vuedraggable";

import TaskTile from "@/components/dashboard/TaskTile.vue";
import { usePersonalTasksStore } from "@/stores/personalTasksStore";

const personalTasksStore = usePersonalTasksStore();
const isAddTaskDialogOpen = ref(false);
const newTaskTitle = ref("");
const newTaskDescription = ref("");
const newTaskDate = ref("");

personalTasksStore.loadWeek();

const taskDateOptions = computed(function () {
  return personalTasksStore.weekDays.map(function (day) {
    return {
      title: `${day.name} (${day.dateLabel})`,
      value: day.date,
    };
  });
});

function toggleTask(taskId) {
  personalTasksStore.toggleTask(taskId);
}

function openAddTaskDialog() {
  newTaskTitle.value = "";
  newTaskDescription.value = "";
  newTaskDate.value = personalTasksStore.weekDays[0].date;
  isAddTaskDialogOpen.value = true;
}

function addTask() {
  if (!newTaskTitle.value.trim()) {
    return;
  }

  personalTasksStore.addTask(
    newTaskTitle.value,
    newTaskDescription.value,
    newTaskDate.value,
  );
  personalTasksStore.loadWeek();
  isAddTaskDialogOpen.value = false;
}

</script>

<template>
  <v-container class="personal-tasks-view" fluid>
    <v-row align="center" class="mb-4">
      <v-col cols="auto">
        <v-btn
          icon="mdi-chevron-left"
          variant="text"
          @click="personalTasksStore.previousWeek"
        />
      </v-col>

      <v-col class="text-center">
        <h1 class="text-h5">Personal tasks</h1>
        <div class="text-body-2 text-medium-emphasis">
          {{ personalTasksStore.weekTitle }}
        </div>
      </v-col>

      <v-col cols="auto">
        <v-btn
          icon="mdi-chevron-right"
          variant="text"
          @click="personalTasksStore.nextWeek"
        />
      </v-col>
    </v-row>

    <div class="d-flex justify-center ga-2 mb-5">
      <v-btn
        prepend-icon="mdi-calendar-today"
        size="small"
        variant="tonal"
        @click="personalTasksStore.goToCurrentWeek"
      >
        Current week
      </v-btn>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="openAddTaskDialog"
      >
        Add task
      </v-btn>
    </div>

    <div class="task-board">
      <v-card
        v-for="day in personalTasksStore.weekDays"
        :key="day.date"
        class="task-column"
        variant="outlined"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="text-subtitle-1 font-weight-medium">{{ day.name }}</span>
            <span class="text-body-2 text-medium-emphasis">{{ day.dateLabel }}</span>
          </div>

          <draggable
            v-model="personalTasksStore.tasksByDay[day.date]"
            group="personal-tasks"
            item-key="id"
            handle=".drag-handle"
            class="task-drop-zone"
            @change="personalTasksStore.saveMovedTasks"
          >
            <template #item="{ element }">
              <TaskTile :task="element" @toggle="toggleTask" />
            </template>
          </draggable>

          <div
            v-if="personalTasksStore.tasksByDay[day.date]?.length === 0"
            class="text-body-2 text-medium-emphasis text-center pa-4"
          >
            No tasks
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-dialog v-model="isAddTaskDialogOpen" max-width="520">
      <v-card class="bg-surface">
        <div class="task-dialog-title text-primary">Add a task</div>

        <v-card-text>
          <v-text-field
            v-model="newTaskTitle"
            autofocus
            label="Task"
            required
          />

          <v-textarea
            v-model="newTaskDescription"
            label="Description"
            rows="3"
          />

          <v-select
            v-model="newTaskDate"
            :items="taskDateOptions"
            label="Day"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="isAddTaskDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" @click="addTask">Add task</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.task-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.task-column {
  min-height: 180px;
}

.task-drop-zone {
  min-height: 76px;
}

.task-dialog-title {
  background-color: rgba(var(--v-theme-secondary), 0.22);
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  padding: 16px;
}
</style>
