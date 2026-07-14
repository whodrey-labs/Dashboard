<script setup>
import { storeToRefs } from "pinia";
import { useWorkObjectivesStore } from "@/stores/workObjectivesStore";

const workObjectivesStore = useWorkObjectivesStore();

const { selectedWeek, weeks } = storeToRefs(workObjectivesStore);

workObjectivesStore.initializeWeeks();

const currentDate = new Date().toISOString().slice(0, 10);
const currentWeekStartDate = weeks.value[selectedWeek.value]?.startDate;

function isCurrentWeek(week) {
  return week.startDate === currentWeekStartDate;
}

function isCurrentDay(objective) {
  return objective.date === currentDate;
}
</script>

<template>
  <v-card class="bg-surface">
    <div class="week-header d-flex align-center pa-4">
      <v-btn
        color="secondary"
        icon="mdi-chevron-left"
        variant="text"
        :disabled="selectedWeek === 0"
        @click="workObjectivesStore.goToPreviousWeek"
      />

      <div
        v-if="weeks[selectedWeek]"
        class="week-title flex-grow-1 text-center"
      >
        <div class="week-card-title text-primary">
          Objectifs de la semaine
        </div>

        <div
          class="text-body-2 font-weight-regular"
          :class="isCurrentWeek(weeks[selectedWeek]) ? 'text-tertiary' : 'text-secondary'"
        >
          {{ workObjectivesStore.formatWeekTitle(weeks[selectedWeek]) }}
        </div>
      </div>

      <v-btn
        color="secondary"
        icon="mdi-chevron-right"
        variant="text"
        @click="workObjectivesStore.goToNextWeek"
      />
    </div>

    <v-card-text>
      <v-window v-model="selectedWeek">
        <v-window-item
          v-for="(week, weekIndex) in weeks"
          :key="week.startDate"
          :value="weekIndex"
        >
          <v-text-field
            v-for="objective in week.objectives"
            :key="objective.date"
            v-model="objective.title"
            :class="{
              'objective-field--current-day': isCurrentDay(objective),
            }"
            :label="workObjectivesStore.formatObjectiveLabel(objective.date)"
            clearable
            density="comfortable"
          >
            <template #prepend-inner>
              <v-icon
                :color="objective.exported ? 'success' : 'tertiary'"
                :icon="
                  objective.exported
                    ? 'mdi-check-circle-outline'
                    : 'mdi-circle-outline'
                "
                :title="objective.exported ? 'Exported' : 'Not yet exported'"
                size="small"
              />
            </template>
          </v-text-field>
        </v-window-item>
      </v-window>
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn
        color="primary"
        prepend-icon="mdi-calendar-export"
        @click="workObjectivesStore.exportObjectivesToOutlook"
      >
        Export to Outlook
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.week-header {
  background-color: rgba(var(--v-theme-secondary), 0.22);
}

.week-title {
  min-width: 0;
}

.week-card-title {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  line-height: 2rem;
}

.objective-field--current-day :deep(.v-field) {
  background-color: rgba(var(--v-theme-tertiary), 0.14);
}
</style>
