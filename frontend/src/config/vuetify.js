// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";
import { aliases, mdi } from "vuetify/iconsets/mdi";

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: "theme",
    themes: {
      theme: {
        dark: false,
        colors: {
          primary: "#06908F",
          secondary: "#0CA4A5",
          tertiary: "#0892A5",
          info: "#153243",
          success: "#A5CC6B",
          warning: "#ECC30B",
          error: "#984447",
          background: "#E8EEF2",
        },
      },
    },
  },
  defaults: {
    VBtn: {
      density: "compact",
    },
    VSelect: {
      density: "compact",
    },
    VTextField: {
      density: "compact",
    },
    VDateInput: {
      density: "compact",
    },
  },
});
