<script setup>
import { onMounted, ref } from "vue";
import { useCalendarStore } from "@/stores/calendarStore";

const calendarStore = useCalendarStore();
const selectedDate = ref(new Date().toISOString().slice(0, 10));

onMounted(calendarStore.loadEvents);
</script>

<template>
  <v-calendar
    v-model="selectedDate"
    :events="calendarStore.vuetifyEvents"
    event-color="color"
    event-end="end"
    event-name="name"
    event-start="start"
    event-timed="timed"
    format="24hr"
    type="month"
  />
</template>
