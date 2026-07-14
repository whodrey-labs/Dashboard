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
          primary: "#6F8FC7",
          secondary: "#91A9D6",
          tertiary: "#F2A65A",

          info: "#657B9B",
          success: "#7FAE72",
          warning: "#E8B44F",
          error: "#C45D66",

          background: "#F5EEDC",
          surface: "#FFFDF7",
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
