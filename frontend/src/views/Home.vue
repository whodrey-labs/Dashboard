<script setup>
import TodayJournal from "@/components/dashboard/TodayJournal.vue";
import JournalSummary from "@/components/dashboard/JournalSummary.vue";
import WorkObjectives from "@/components/dashboard/WorkObjectives.vue";
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
      </v-col>
    </v-row>
  </v-container>
</template>
