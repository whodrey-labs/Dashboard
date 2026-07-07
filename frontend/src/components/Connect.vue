<script setup>
const connectGoogle = () => {
  const returnTo = encodeURIComponent(`${window.location.origin}/calendar`);
  window.location.href = `http://localhost:4000/auth/google?returnTo=${returnTo}`;
};
</script>

<template>
  <v-btn @click="connectGoogle">Connect Google Calendar</v-btn>
</template>
