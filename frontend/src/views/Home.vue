<script setup>
import { useSettingsStore } from "@/stores/settingsStore";
import TodayJournal from "@/components/dashboard/TodayJournal.vue";
import JournalSummary from "@/components/dashboard/JournalSummary.vue";
import WorkObjectives from "@/components/dashboard/WorkObjectives.vue";

const settingsStore = useSettingsStore();
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1>Welcome {{ settingsStore.username }}</h1>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col> <h2>Aujourd'hui</h2> </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <TodayJournal />
      </v-col>

      <v-col cols="12" md="6">
        <JournalSummary />
      </v-col>
    </v-row>
  </v-container>
</template>
