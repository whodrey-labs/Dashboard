import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import CalendarView from "@/views/CalendarView.vue";
import AlarmView from "@/views/AlarmView.vue";
import SettingsView from "@/views/SettingsView.vue";
import JournalView from "@/views/JournalView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Home,
    },
    {
      path: "/calendar",
      component: CalendarView,
    },
    {
      path: "/alarms",
      component: AlarmView,
    },
    {
      path: "/settings",
      component: SettingsView,
    },
    {
      path: "/journal",
      component: JournalView,
    },
  ],
});

export default router;
