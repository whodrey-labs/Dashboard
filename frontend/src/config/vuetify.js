// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "theme",
    themes: {
      theme: {
        dark: false,
        colors: {
          primary: "#8D6B94",
          secondary: "#B185A7",
          tertiary: "#C3A29E",
          info: "#420039",
          success: "#5FAD41",
          warning: "#FFBF00",
          error: "#E70E02",
          background: "#E8DBC5",
        },
      },
    },
  },
});
