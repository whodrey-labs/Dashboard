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
  <v-card height="100%">
    <v-card-title>Résumé du journal</v-card-title>

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

      <v-progress-linear :model-value="progress" class="mt-4" rounded />
    </v-card-text>

    <v-card-text v-else> Aucun journal pour cette semaine. </v-card-text>

    <v-card-actions>
      <v-btn color="secondary" @click="openJournalList">
        Voir les journaux
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
