import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useCalendarStore = defineStore(
  "calendar",
  () => {
    const events = ref([]);
    const loading = ref(true);
    const error = ref("");

    async function loadEvents() {
      loading.value = true;
      error.value = "";

      try {
        const response = await fetch("/api/calendar/events");

        if (!response.ok) {
          throw new Error("Could not load Google Calendar events");
        }

        const data = await response.json();
        events.value = data.items ?? [];
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    }

    function shiftDate(dateString, days) {
      const date = new Date(`${dateString}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + days);
      return date.toISOString().slice(0, 10);
    }

    function toVuetifyCalendarEvent(event) {
      const timedStart = event.start?.dateTime;
      const timedEnd = event.end?.dateTime;
      const allDayStart = event.start?.date;
      const allDayEnd = event.end?.date;

      if (!timedStart && !allDayStart) {
        return null;
      }

      return {
        name: event.summary || "Untitled event",
        start: timedStart ? new Date(timedStart) : allDayStart,
        end: timedEnd
          ? new Date(timedEnd)
          : allDayEnd && allDayEnd !== allDayStart
            ? shiftDate(allDayEnd, -1)
            : allDayStart,
        timed: Boolean(timedStart),
        color: "primary",
        original: event,
      };
    }

    const vuetifyEvents = computed(() =>
      events.value.map(toVuetifyCalendarEvent).filter(Boolean),
    );

    function formatEventTime(event) {
      const start = event.start?.dateTime ?? event.start?.date;
      if (!start) return "No date";

      return new Intl.DateTimeFormat("fr-CH", {
        dateStyle: "medium",
        timeStyle: event.start?.dateTime ? "short" : undefined,
      }).format(new Date(start));
    }

    return {
      loadEvents,
      formatEventTime,
      events,
      vuetifyEvents,
      loading,
      error,
    };
  },
  {
    persist: true,
  },
);
