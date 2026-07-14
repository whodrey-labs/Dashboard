<script setup>
import TopBar from "./components/TopBar.vue";
import BotNav from "./components/BotNav.vue";
</script>

<template>
  <v-app class="bg-background">
    <TopBar />

    <v-main class="mb-15">
      <v-container fluid class="fill-height pb-15">
        <v-row class="fill-height">
          <router-view></router-view>
        </v-row>
      </v-container>
    </v-main>

    <BotNav />
  </v-app>
</template>

<style scoped></style>
