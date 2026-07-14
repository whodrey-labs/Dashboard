<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useJournalStore } from "@/stores/journalStore";

const router = useRouter();
const journalStore = useJournalStore();

const progress = computed(() => {
  return (journalStore.filledDaysThisWeek / 5) * 100;
});

function openJournalList() {
  router.push("/journal");
}
</script>

<template>
  <v-card class="bg-surface">
    <div class="dashboard-card-title text-primary">
      Résumé du journal
    </div>

    <v-card-text v-if="journalStore.currentWeekJournal">
      <p>Semaine {{ journalStore.currentWeekJournal.weekNumber }}</p>

      <p>{{ journalStore.filledDaysThisWeek }} jours sur 5 remplis</p>

      <p>
        {{ journalStore.activitiesThisWeek }}
        activité{{
          journalStore.activitiesThisWeek > 1 ? "s" : ""
        }}
        enregistrée{{ journalStore.activitiesThisWeek > 1 ? "s" : "" }}
      </p>

      <p>
        Statut :
        {{ journalStore.currentWeekJournal.completed ? "terminé" : "en cours" }}
      </p>

      <v-progress-linear
        :model-value="progress"
        class="mt-4"
        color="primary"
        rounded
      />
    </v-card-text>

    <v-card-text v-else> Aucun journal pour cette semaine. </v-card-text>

    <v-card-actions>
      <v-btn color="secondary" variant="tonal" @click="openJournalList">
        Voir les journaux
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
