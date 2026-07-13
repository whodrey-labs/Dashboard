<script setup></script>

<template>
  <v-bottom-navigation bg-color="primary" class="bottom-nav">
    <v-container fluid class="d-flex align-center justify-center">
      <span>Made with love by Whodrey</span>
    </v-container>
  </v-bottom-navigation>
</template>

<style scoped>
.bottom-nav {
  position: relative;
  overflow: visible;
}

.bottom-nav::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -37px;
  height: 44px;
  pointer-events: none;
  background-color: rgb(var(--v-theme-primary));

  -webkit-mask-image: url("/ocean-wave-mask.png");
  -webkit-mask-repeat: repeat-x;
  -webkit-mask-size: auto 44px;
  -webkit-mask-position: left top;

  mask-image: url("/ocean-wave-mask.png");
  mask-repeat: repeat-x;
  mask-size: auto 44px;
  mask-position: left top;
}
</style>
