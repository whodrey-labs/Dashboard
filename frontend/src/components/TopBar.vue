<script setup></script>

<template>
  <v-app-bar color="primary">
    <v-container fluid>
      <v-row align="center" justify="space-around">
        <v-col> Dashboard </v-col>

        <v-col cols="auto">
          <v-btn to="/calendar">Calendar</v-btn>
          <v-btn to="/settings">Settings</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>
