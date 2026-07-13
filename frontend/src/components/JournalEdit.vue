<script setup>
import { watch } from "vue";
import { journalDayTemplate } from "@/templates/journalTemplate";

const props = defineProps({
  journal: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const minRating = 1;
const maxRating = 5;

const protectedActivityEntryKey = "morningRoutine";

const protectedActivities =
  journalDayTemplate.find((entry) => entry.key === protectedActivityEntryKey)
    ?.activities ?? [];

watch(
  () => props.journal.content,
  () => {
    props.journal.editedAt = new Date().toISOString();
  },
  { deep: true },
);

function isProtectedActivityEntry(entry) {
  return entry.key === protectedActivityEntryKey;
}

function getActivitySuggestions() {
  return [
    ...new Set(
      props.journal.content.days.flatMap((day) =>
        day.entries.flatMap((entry) =>
          isProtectedActivityEntry(entry)
            ? []
            : (entry.activities ?? []).filter(
                (activity) => !protectedActivities.includes(activity),
              ),
        ),
      ),
    ),
  ];
}

function getEntryTimeLabel(entry) {
  return entry.timeLabel ?? `${entry.startTime} - ${entry.endTime}`;
}

function updateEntryActivities(entry, activities) {
  const selectedActivities = Array.isArray(activities) ? activities : [];

  if (!isProtectedActivityEntry(entry)) {
    entry.activities = selectedActivities;
    return;
  }

  entry.activities = [
    ...protectedActivities,
    ...selectedActivities.filter(
      (activity) => !protectedActivities.includes(activity),
    ),
  ];
}
</script>

<template>
  <v-card>
    <v-card-title>
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
          <h2 class="journal-day__title">
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
                  <v-combobox
                    class="journal-activities-input"
                    :model-value="entry.activities"
                    :items="getActivitySuggestions()"
                    chips
                    :closable-chips="!isProtectedActivityEntry(entry)"
                    density="compact"
                    hide-details
                    multiple
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
          <h2>Feedback de la semaine</h2>
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

.journal-activities-input :deep(.v-field__input) {
  align-items: flex-start;
  min-height: 40px;
  padding-bottom: 6px;
  padding-top: 6px;
  row-gap: 4px;
}

.journal-objective {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: auto minmax(0, 1fr);
}

.journal-objective__label {
  font-weight: 600;
  white-space: nowrap;
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
