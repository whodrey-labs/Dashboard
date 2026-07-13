<script setup>
import router from "@/router";
</script>

<template>
  <v-app-bar color="primary" class="top-bar" flat>
    <v-container fluid>
      <v-row align="center" justify="space-around">
        <v-app-bar-title @click="router.push('/')" class="cursor-pointer">
          Dashboard
        </v-app-bar-title>
        <v-col cols="auto">
          <v-btn to="/journal">Journal</v-btn>
          <v-btn to="/calendar">Calendar</v-btn>
          <v-btn to="/settings">Settings</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.top-bar {
  position: relative;
  overflow: visible;
  z-index: 10;
}

.top-bar::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -14px;
  height: 14px;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-background)) 100%
  );
}
</style>
