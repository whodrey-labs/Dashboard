<script setup>
import { ref } from "vue";
import draggable from "vuedraggable";

import TaskTile from "@/components/dashboard/TaskTile.vue";
import { usePersonalTasksStore } from "@/stores/personalTasksStore";

const personalTasksStore = usePersonalTasksStore();
const isAddTaskDialogOpen = ref(false);
const newTaskTitle = ref("");
const newTaskDescription = ref("");
const newTaskDate = ref(null);
const isNewTaskRecurring = ref(false);
const newTaskRecurringDays = ref([]);
const isModifyMode = ref(false);
const isDeleteMode = ref(false);
const selectedTaskIds = ref([]);
const isEditTaskDialogOpen = ref(false);
const editingTask = ref(null);
const editedTaskTitle = ref("");
const editedTaskDescription = ref("");
const editedTaskDate = ref(null);
const editedTaskRecurringDays = ref([]);

personalTasksStore.loadWeek();

const weekDayOptions = [
  { title: "Monday", value: 1 },
  { title: "Tuesday", value: 2 },
  { title: "Wednesday", value: 3 },
  { title: "Thursday", value: 4 },
  { title: "Friday", value: 5 },
  { title: "Saturday", value: 6 },
  { title: "Sunday", value: 7 },
];

function toggleTask(taskId) {
  personalTasksStore.toggleTask(taskId);
}

function toggleModifyMode() {
  isModifyMode.value = !isModifyMode.value;

  if (isModifyMode.value) {
    isDeleteMode.value = false;
    selectedTaskIds.value = [];
  }
}

function toggleDeleteMode() {
  isDeleteMode.value = !isDeleteMode.value;
  selectedTaskIds.value = [];

  if (isDeleteMode.value) {
    isModifyMode.value = false;
  }
}

function toggleTaskSelection(taskId) {
  if (selectedTaskIds.value.includes(taskId)) {
    selectedTaskIds.value = selectedTaskIds.value.filter(function (id) {
      return id !== taskId;
    });

    return;
  }

  selectedTaskIds.value.push(taskId);
}

function deleteSelectedTasks() {
  personalTasksStore.deleteTasks(selectedTaskIds.value);
  personalTasksStore.loadWeek();
  selectedTaskIds.value = [];
}

function openAddTaskDialog() {
  newTaskTitle.value = "";
  newTaskDescription.value = "";
  newTaskDate.value = new Date();
  isNewTaskRecurring.value = false;
  newTaskRecurringDays.value = [];
  isAddTaskDialogOpen.value = true;
}

function addTask() {
  if (!newTaskTitle.value.trim()) {
    return;
  }

  if (isNewTaskRecurring.value) {
    if (newTaskRecurringDays.value.length === 0) {
      return;
    }

    personalTasksStore.addRecurringTask(
      newTaskTitle.value,
      newTaskDescription.value,
      newTaskRecurringDays.value,
    );
  } else {
    personalTasksStore.addTask(
      newTaskTitle.value,
      newTaskDescription.value,
      newTaskDate.value,
    );
  }

  personalTasksStore.loadWeek(newTaskDate.value);
  isAddTaskDialogOpen.value = false;
}

function openEditTaskDialog(task) {
  editingTask.value = task;
  editedTaskTitle.value = task.title;
  editedTaskDescription.value = task.description;
  editedTaskDate.value = new Date(`${task.date}T00:00:00`);

  const recurringTask = personalTasksStore.recurringTasks.find(function (
    item,
  ) {
    return item.id === task.taskId;
  });

  editedTaskRecurringDays.value = recurringTask?.daysOfWeek?.length
    ? [...recurringTask.daysOfWeek]
    : recurringTask?.defaultDay
      ? [recurringTask.defaultDay]
      : [];
  isEditTaskDialogOpen.value = true;
}

function saveTaskChanges() {
  if (!editedTaskTitle.value.trim()) {
    return;
  }

  if (editingTask.value.taskId && editedTaskRecurringDays.value.length === 0) {
    return;
  }

  personalTasksStore.updateTask(
    editingTask.value.id,
    editedTaskTitle.value,
    editedTaskDescription.value,
    editedTaskDate.value,
    editedTaskRecurringDays.value,
  );
  personalTasksStore.loadWeek();
  isEditTaskDialogOpen.value = false;
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

      <v-btn
        :color="isModifyMode ? 'primary' : undefined"
        :variant="isModifyMode ? 'flat' : 'tonal'"
        prepend-icon="mdi-pencil"
        size="small"
        @click="toggleModifyMode"
      >
        {{ isModifyMode ? "Finish editing" : "Modify tasks" }}
      </v-btn>

      <v-btn
        :color="isDeleteMode ? 'error' : undefined"
        :variant="isDeleteMode ? 'flat' : 'tonal'"
        prepend-icon="mdi-delete"
        size="small"
        @click="toggleDeleteMode"
      >
        {{ isDeleteMode ? "Finish deleting" : "Delete tasks" }}
      </v-btn>

      <v-btn
        v-if="isDeleteMode"
        color="error"
        :disabled="selectedTaskIds.length === 0"
        prepend-icon="mdi-delete-sweep"
        size="small"
        @click="deleteSelectedTasks"
      >
        Delete selected ({{ selectedTaskIds.length }})
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
            :disabled="isModifyMode || isDeleteMode"
            class="task-drop-zone"
            @change="personalTasksStore.saveMovedTasks"
          >
            <template #item="{ element }">
              <TaskTile
                :edit-mode="isModifyMode"
                :delete-mode="isDeleteMode"
                :selected-for-delete="selectedTaskIds.includes(element.id)"
                :show-drag-handle="!isModifyMode && !isDeleteMode"
                :task="element"
                @edit="openEditTaskDialog"
                @select="toggleTaskSelection"
                @toggle="toggleTask"
              />
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

          <v-date-input
            v-model="newTaskDate"
            label="Date"
            prepend-icon="mdi-calendar"
          />

          <v-switch
            v-model="isNewTaskRecurring"
            color="primary"
            hide-details
            label="Recurring task"
          />

          <v-select
            v-if="isNewTaskRecurring"
            v-model="newTaskRecurringDays"
            :items="weekDayOptions"
            chips
            closable-chips
            label="Repeats on"
            multiple
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="isAddTaskDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" @click="addTask">Add task</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isEditTaskDialogOpen" max-width="520">
      <v-card class="bg-surface">
        <div class="task-dialog-title text-primary">Modify task</div>

        <v-card-text>
          <v-text-field v-model="editedTaskTitle" autofocus label="Task" required />

          <v-textarea
            v-model="editedTaskDescription"
            label="Description"
            rows="3"
          />

          <v-select
            v-if="editingTask?.taskId"
            v-model="editedTaskRecurringDays"
            :items="weekDayOptions"
            chips
            closable-chips
            label="Repeats on"
            multiple
          />

          <v-date-input
            v-else
            v-model="editedTaskDate"
            label="Date"
            prepend-icon="mdi-calendar"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="isEditTaskDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveTaskChanges">Save</v-btn>
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
