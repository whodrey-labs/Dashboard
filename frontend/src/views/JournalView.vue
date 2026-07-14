<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useJournalStore } from "@/stores/journalStore";
import JournalEdit from "@/components/JournalEdit.vue";
import { copyJournalAsHTML } from "@/composables/journalToHTML";

const route = useRoute();
const journalStore = useJournalStore();

const isEditing = ref(false);
const editingJournal = ref(null);

const currentWeekJournal = computed(() => journalStore.currentWeekJournal);

const olderJournals = computed(() => {
  return journalStore.journals.filter(
    (journal) => journal !== currentWeekJournal.value,
  );
});

async function copyJournal(journal) {
  try {
    await copyJournalAsHTML(journal);
  } catch (error) {
    console.error("Impossible de copier le journal", error);
  }
}

const journalStatusOptions = [
  {
    label: "En cours",
    value: false,
    color: "warning",
  },
  {
    label: "Complété",
    value: true,
    color: "success",
  },
];

const headers = [
  {
    title: "Journal",
    key: "name",
  },
  {
    title: "Créé le",
    key: "createdAt",
  },
  {
    title: "Modifié le",
    key: "editedAt",
  },
  {
    title: "Statut",
    key: "completed",
    sortable: true,
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
    align: "end",
  },
];

function openEditDialog(journal) {
  editingJournal.value = journal;
  isEditing.value = true;
}

function openJournalFromRoute() {
  if (route.query.edit !== "true") {
    return;
  }

  const year = Number(route.query.year);
  const weekNumber = Number(route.query.weekNumber);

  if (!year || !weekNumber) {
    return;
  }

  const journal = journalStore.journals.find(
    (item) => item.year === year && item.weekNumber === weekNumber,
  );

  if (journal) {
    openEditDialog(journal);
  }
}

onMounted(() => {
  journalStore.ensureCurrentWeekJournal();
  openJournalFromRoute();
});

watch(
  () => [route.query.edit, route.query.year, route.query.weekNumber],
  () => {
    openJournalFromRoute();
  },
);

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getJournalStatus(value) {
  const completed = normalizeJournalStatusValue(value);

  return (
    journalStatusOptions.find((status) => status.value === completed) ??
    journalStatusOptions[0]
  );
}

function getSelectStatus(selectItem, fallbackValue) {
  const rawStatus = selectItem?.raw;

  if (rawStatus?.label && rawStatus?.color) {
    return rawStatus;
  }

  const value =
    rawStatus?.value ?? selectItem?.value ?? selectItem?.props?.value;

  const label =
    rawStatus?.label ?? selectItem?.title ?? selectItem?.props?.title;

  return (
    journalStatusOptions.find(
      (status) => status.value === value || status.label === label,
    ) ?? getJournalStatus(fallbackValue)
  );
}

function normalizeJournalStatusValue(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value && typeof value === "object" && "value" in value) {
    return value.value;
  }

  return (
    journalStatusOptions.find((status) => status.label === value)?.value ??
    false
  );
}

function updateJournalStatus(journal, completed) {
  journal.completed = normalizeJournalStatusValue(completed);

  journal.editedAt = new Date().toISOString();
}
</script>

<template>
  <v-container fluid>
    <v-row no-gutters align="center" justify="space-between">
      <v-col cols="auto">
        <h1>Journaux de travail</h1>
      </v-col>

      <v-col cols="auto">
        <v-btn color="secondary"> Create </v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12">
        <h2 class="mb-3">Semaine actuelle</h2>

        <v-card v-if="currentWeekJournal">
          <v-card-title>{{ currentWeekJournal.name }}</v-card-title>

          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="auto">
                Créé le {{ formatDate(currentWeekJournal.createdAt) }}
              </v-col>

              <v-col cols="12" sm="auto">
                Modifié le {{ formatDate(currentWeekJournal.editedAt) }}
              </v-col>

              <v-col cols="12" sm="auto">
                <v-select
                  :model-value="currentWeekJournal.completed ?? false"
                  :items="journalStatusOptions"
                  density="compact"
                  hide-details
                  item-title="label"
                  item-value="value"
                  variant="plain"
                  class="journal-status-select"
                  @update:model-value="
                    updateJournalStatus(currentWeekJournal, $event)
                  "
                >
                  <template #selection="{ item: statusItem }">
                    <v-chip
                      :color="
                        getSelectStatus(statusItem, currentWeekJournal.completed)
                          .color
                      "
                      size="small"
                      class="journal-status-select__chip"
                    >
                      {{
                        getSelectStatus(statusItem, currentWeekJournal.completed)
                          .label
                      }}
                    </v-chip>
                  </template>

                  <template #item="{ props, item: statusItem }">
                    <v-list-item v-bind="props">
                      <template #title>
                        <v-chip
                          :color="
                            getSelectStatus(
                              statusItem,
                              currentWeekJournal.completed,
                            ).color
                          "
                          size="small"
                        >
                          {{
                            getSelectStatus(
                              statusItem,
                              currentWeekJournal.completed,
                            ).label
                          }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-btn
              prepend-icon="mdi-content-copy"
              variant="text"
              @click="copyJournal(currentWeekJournal)"
            >
              Copier
            </v-btn>

            <v-btn
              prepend-icon="mdi-pencil"
              color="secondary"
              @click="openEditDialog(currentWeekJournal)"
            >
              Modifier
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12">
        <h2 class="mb-3">Anciens journaux</h2>

        <v-data-table
          :headers="headers"
          :items="olderJournals"
          item-value="weekNumber"
        >
          <template #item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>

          <template #item.editedAt="{ item }">
            {{ formatDate(item.editedAt) }}
          </template>

          <template #item.completed="{ item }">
            <v-select
              :model-value="item.completed ?? false"
              :items="journalStatusOptions"
              density="compact"
              hide-details
              item-title="label"
              item-value="value"
              variant="plain"
              class="journal-status-select"
              @update:model-value="updateJournalStatus(item, $event)"
            >
              <template #selection="{ item: statusItem }">
                <v-chip
                  :color="getSelectStatus(statusItem, item.completed).color"
                  size="small"
                  class="journal-status-select__chip"
                >
                  {{ getSelectStatus(statusItem, item.completed).label }}
                </v-chip>
              </template>

              <template #item="{ props, item: statusItem }">
                <v-list-item v-bind="props">
                  <template #title>
                    <v-chip
                      :color="getSelectStatus(statusItem, item.completed).color"
                      size="small"
                    >
                      {{ getSelectStatus(statusItem, item.completed).label }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-content-copy"
              variant="text"
              size="small"
              title="Copier le journal"
              @click="copyJournal(item)"
            />

            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              title="Modifier"
              @click="openEditDialog(item)"
            />
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="isEditing" max-width="1400">
      <JournalEdit
        v-if="editingJournal"
        :journal="editingJournal"
        @close="isEditing = false"
      />
    </v-dialog>
  </v-container>
</template>

<style scoped>
.journal-status-select {
  max-width: 132px;
}

.journal-status-select :deep(.v-field) {
  cursor: pointer;
}

.journal-status-select :deep(.v-field__input) {
  min-height: 0;
  padding-bottom: 0;
  padding-top: 0;
}

.journal-status-select :deep(.v-field__append-inner) {
  display: none;
}

.journal-status-select__chip {
  cursor: pointer;
}
</style>
