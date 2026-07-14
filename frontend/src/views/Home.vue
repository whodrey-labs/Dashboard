<script setup>
import { computed, onMounted } from "vue";
import TodayJournal from "@/components/dashboard/TodayJournal.vue";
import JournalSummary from "@/components/dashboard/JournalSummary.vue";
import TaskTile from "@/components/dashboard/TaskTile.vue";
import WorkObjectives from "@/components/dashboard/WorkObjectives.vue";
import { usePersonalTasksStore } from "@/stores/personalTasksStore";

const personalTasksStore = usePersonalTasksStore();

const todayTasks = computed(function () {
  return personalTasksStore.getTasksForDate(
    personalTasksStore.formatDate(new Date()),
  );
});

function toggleTask(taskId) {
  personalTasksStore.toggleTask(taskId);
}

onMounted(function () {
  personalTasksStore.generateWeek(new Date());
});
</script>

<template>
  <v-container fluid>
    <h2 class="text-primary mb-2">
      <v-icon color="tertiary" icon="mdi-calendar-today" size="small" />
      Aujourd'hui
    </h2>
    <v-row>
      <v-col cols="12" lg="6">
        <h2 class="text-primary mb-4">
          <v-icon color="tertiary" icon="mdi-briefcase-outline" size="small" />
          Travail
        </h2>

        <v-row>
          <v-col cols="12" md="6">
            <TodayJournal />
          </v-col>

          <v-col cols="12" md="6">
            <JournalSummary />
          </v-col>
        </v-row>

        <WorkObjectives class="mt-4" />
      </v-col>

      <v-col cols="12" lg="6">
        <h2 class="text-primary mb-4">
          <v-icon color="tertiary" icon="mdi-account-outline" size="small" />
          Personnel
        </h2>

        <v-row>
          <v-col cols="12" md="6">
            <v-card class="bg-surface">
              <div class="dashboard-card-title text-primary">Today's tasks</div>

              <v-card-text>
                <TaskTile
                  v-for="task in todayTasks"
                  :key="task.id"
                  :show-drag-handle="false"
                  :task="task"
                  @toggle="toggleTask"
                />

                <div
                  v-if="todayTasks.length === 0"
                  class="text-body-2 text-medium-emphasis"
                >
                  No tasks for today.
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.dashboard-card-title {
  background-color: rgba(var(--v-theme-secondary), 0.22);
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  padding: 16px;
}
</style>
