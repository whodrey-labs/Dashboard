<script setup>
import Connect from "@/components/Connect.vue";
import { useFieldSavedState } from "@/composables/useFieldSavedState";
import { useSettingsStore } from "@/stores/settingsStore";

const settingsStore = useSettingsStore();
const {
  handleFocus: handleUsernameFocus,
  handleBlur: handleUsernameBlur,
  icon: usernameIcon,
  color: usernameColor,
} = useFieldSavedState();

const {
  handleFocus: handleBirthdayFocus,
  handleBlur: handleBirthdayBlur,
  icon: birthdayIcon,
  color: birthdayColor,
} = useFieldSavedState();
</script>

<template>
  <v-container fluid>
    <v-row class="align-center">
      <v-col>
        <h1>Settings</h1>
      </v-col>
      <v-col>
        <Connect />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="3">
        <v-card elevation="0" class="bg-background">
          <v-card-text>
            <v-text-field
              v-model="settingsStore.username"
              @focus="handleUsernameFocus"
              @blur="handleUsernameBlur"
            >
              <template #prepend> username </template>
              <template #append-inner>
                <v-icon :color="usernameColor">{{ usernameIcon }}</v-icon>
              </template>
            </v-text-field>

            <v-date-input
              v-model="settingsStore.birthday"
              @focus="handleBirthdayFocus"
              @blur="handleBirthdayBlur"
            >
              <template #prepend> birthday </template>
              <template #append-inner>
                <v-icon :color="birthdayColor">{{ birthdayIcon }}</v-icon>
              </template>
            </v-date-input>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
