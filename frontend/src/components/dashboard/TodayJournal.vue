<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useJournalStore } from "@/stores/journalStore";

const router = useRouter();
const journalStore = useJournalStore();

const hasCurrentJournal = computed(() => {
  return Boolean(journalStore.currentWeekJournal);
});

const statusLabel = computed(() => {
  if (!hasCurrentJournal.value) {
    return "À créer";
  }

  if (!journalStore.currentDay) {
    return "Indisponible";
  }

  return journalStore.isCurrentDayFilled ? "Complété" : "À compléter";
});

const statusColor = computed(() => {
  if (!hasCurrentJournal.value) {
    return "tertiary";
  }

  if (!journalStore.currentDay) {
    return "info";
  }

  if (journalStore.isCurrentDayFilled) {
    return "success";
  }

  return "tertiary";
});

const description = computed(() => {
  if (!hasCurrentJournal.value) {
    return "Aucun journal n’existe encore pour cette semaine.";
  }

  if (!journalStore.currentDay) {
    return "Aucune entrée n’est prévue aujourd’hui.";
  }

  if (journalStore.isCurrentDayFilled) {
    return "Le journal d’aujourd’hui a été rempli.";
  }

  return "Le journal d’aujourd’hui doit encore être rempli.";
});

const currentDayObjective = computed(() => {
  const morningRoutine = journalStore.currentDay?.entries?.find(function (entry) {
    return entry.key === "morningRoutine";
  });

  return morningRoutine?.objective?.trim() ?? "";
});

function openJournal() {
  const journal = journalStore.ensureCurrentWeekJournal();

  router.push({
    path: "/journal",
    query: {
      edit: "true",
      year: journal.year,
      weekNumber: journal.weekNumber,
    },
  });
}
</script>

<template>
  <v-card class="bg-surface">
    <div class="dashboard-card-title text-primary">
      Journal du jour
    </div>

    <v-card-text>
      <v-chip :color="statusColor" class="mb-4">
        {{ statusLabel }}
      </v-chip>

      <p class="mb-2">
        {{ description }}
      </p>

      <p v-if="currentDayObjective" class="mb-2">
        <strong>Objectif :</strong> {{ currentDayObjective }}
      </p>

      <p v-if="journalStore.currentDay">
        {{ journalStore.currentDayActivityCount }}
        activité{{
          journalStore.currentDayActivityCount > 1 ? "s" : ""
        }}
        enregistrée{{ journalStore.currentDayActivityCount > 1 ? "s" : "" }}.
      </p>
    </v-card-text>

    <v-card-actions>
      <v-btn color="primary" @click="openJournal">
        {{
          journalStore.isCurrentDayFilled
            ? "Ouvrir le journal"
            : "Remplir le journal"
        }}
      </v-btn>
    </v-card-actions>
  </v-card>
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
