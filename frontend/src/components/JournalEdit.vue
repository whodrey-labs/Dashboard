<script setup>
import { watch } from "vue";

const props = defineProps({
  journal: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const minRating = 1;
const maxRating = 5;

watch(
  () => props.journal.content,
  () => {
    props.journal.editedAt = new Date().toISOString();
  },
  { deep: true },
);

function getEntryActivitiesText(entry) {
  if (typeof entry.activities === "string") {
    return entry.activities;
  }

  return (entry.activities ?? []).join("\n");
}

function getEntryActivityLines(entry) {
  return getEntryActivitiesText(entry).split("\n").filter(function (activity) {
    return activity.trim();
  });
}

function getEntryTimeLabel(entry) {
  return entry.timeLabel ?? `${entry.startTime} - ${entry.endTime}`;
}

function updateEntryActivities(entry, activitiesText) {
  entry.activities = String(activitiesText ?? "");
}
</script>

<template>
  <v-card class="bg-surface">
    <v-card-title class="text-primary">
      <v-row align="center" no-gutters>
        <v-col>
          {{ props.journal.name }}
        </v-col>

        <v-col cols="auto">
          <v-btn icon="mdi-close" variant="text" @click="emit('close')" />
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <v-row class="ga-6">
        <v-col
          v-for="day in props.journal.content.days"
          :key="day.name"
          cols="12"
          class="journal-day"
        >
          <h2 class="journal-day__title text-primary">
            {{ day.label }}
          </h2>

          <v-table class="journal-table" density="comfortable">
            <thead>
              <tr>
                <th scope="col">Période</th>
                <th scope="col">Activités</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="entry in day.entries" :key="entry.key">
                <td class="journal-table__hours">
                  {{ getEntryTimeLabel(entry) }}
                </td>

                <td class="journal-table__activities">
                  <div
                    v-if="entry.key === 'morningRoutine'"
                    class="journal-activities-list"
                  >
                    <p
                      v-for="activity in getEntryActivityLines(entry)"
                      :key="activity"
                    >
                      {{ activity }}
                    </p>
                  </div>

                  <v-textarea
                    v-else
                    :model-value="getEntryActivitiesText(entry)"
                    auto-grow
                    density="compact"
                    hide-details
                    rows="1"
                    variant="plain"
                    @update:model-value="updateEntryActivities(entry, $event)"
                  />
                </td>

                <td>
                  <div v-if="'objective' in entry" class="journal-objective">
                    <span class="journal-objective__label"> Objectif : </span>

                    <v-text-field
                      v-model="entry.objective"
                      density="compact"
                      hide-details
                      variant="plain"
                    />
                  </div>

                  <v-textarea
                    v-else
                    v-model="entry.notes"
                    auto-grow
                    density="compact"
                    hide-details
                    rows="1"
                    variant="plain"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-col>

        <v-col cols="12">
          <h2 class="journal-feedback-title text-primary">Feedback de la semaine</h2>
        </v-col>

        <v-col cols="12" md="6">
          <v-textarea
            v-model="props.journal.content.feedback.favoriteActivity"
            label="Activité préférée"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-textarea
            v-model="props.journal.content.feedback.leastFavoriteActivity"
            label="Activité la moins aimée"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-slider
            v-model="props.journal.content.feedback.motivation"
            :max="maxRating"
            :min="minRating"
            hide-details
            label="Motivation"
            color="primary"
            show-ticks="always"
            step="1"
            thumb-label="always"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-slider
            v-model="props.journal.content.feedback.capacity"
            :max="maxRating"
            :min="minRating"
            hide-details
            label="Capacité"
            color="primary"
            show-ticks="always"
            step="1"
            thumb-label="always"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-textarea
            v-model="props.journal.content.feedback.feedback"
            label="Feedback"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-textarea
            v-model="props.journal.content.feedback.personalGoals"
            label="Objectifs personnels"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.journal-day__title {
  margin-bottom: 12px;
}

.journal-table {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.journal-table :deep(table) {
  table-layout: fixed;
}

.journal-table th,
.journal-table td {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  vertical-align: middle;
}

.journal-table th:last-child,
.journal-table td:last-child {
  border-right: 0;
}

.journal-table th {
  background-color: rgba(var(--v-theme-secondary), 0.28);
  font-weight: 600;
  white-space: nowrap;
}

.journal-table__hours {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  width: 132px;
}

.journal-table__activities {
  vertical-align: top;
}

.journal-activities-list {
  margin: 0;
  padding: 8px 0;
}

.journal-activities-list p {
  margin: 0;
}

.journal-objective {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: auto minmax(0, 1fr);
}

.journal-objective__label {
  color: rgb(var(--v-theme-tertiary));
  font-weight: 600;
  white-space: nowrap;
}

.journal-feedback-title {
  border-bottom: 3px solid rgb(var(--v-theme-tertiary));
  display: inline-block;
  padding-bottom: 4px;
}

.journal-objective :deep(.v-field__input) {
  min-height: 32px;
  padding-bottom: 0;
  padding-top: 0;
}

@media (max-width: 960px) {
  .journal-table {
    overflow-x: auto;
  }

  .journal-table :deep(table) {
    min-width: 760px;
  }
}
</style>
