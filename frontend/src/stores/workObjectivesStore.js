import { defineStore } from "pinia";
import { ref } from "vue";

export const useWorkObjectivesStore = defineStore(
  "workObjectives",
  function () {
    const selectedWeek = ref(0);
    const weeks = ref([]);

    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    function getMonday(referenceDate) {
      const date = new Date(referenceDate);
      const currentDay = date.getDay();

      const distanceFromMonday = currentDay === 0 ? -6 : 1 - currentDay;

      date.setDate(date.getDate() + distanceFromMonday);
      date.setHours(12, 0, 0, 0);

      return date;
    }

    function createWeek(referenceDate) {
      const monday = getMonday(referenceDate);
      const objectives = [];

      for (let index = 0; index < 5; index++) {
        const currentDate = new Date(monday);

        currentDate.setDate(monday.getDate() + index);

        objectives.push({
          date: formatDate(currentDate),
          title: "",
          exported: false,
        });
      }

      return {
        startDate: formatDate(monday),
        objectives,
      };
    }

    function initializeWeeks() {
      const currentWeek = createWeek(new Date());

      const currentWeekIndex = weeks.value.findIndex(function (week) {
        return week.startDate === currentWeek.startDate;
      });

      if (currentWeekIndex !== -1) {
        selectedWeek.value = currentWeekIndex;
        return;
      }

      weeks.value.push(currentWeek);

      weeks.value.sort(function (firstWeek, secondWeek) {
        return firstWeek.startDate.localeCompare(secondWeek.startDate);
      });

      selectedWeek.value = weeks.value.findIndex(function (week) {
        return week.startDate === currentWeek.startDate;
      });
    }

    function goToNextWeek() {
      const nextIndex = selectedWeek.value + 1;

      if (!weeks.value[nextIndex]) {
        const currentWeek = weeks.value[selectedWeek.value];
        const nextMonday = new Date(`${currentWeek.startDate}T12:00:00`);

        nextMonday.setDate(nextMonday.getDate() + 7);

        weeks.value.push(createWeek(nextMonday));
      }

      selectedWeek.value = nextIndex;
    }

    function goToPreviousWeek() {
      if (selectedWeek.value > 0) {
        selectedWeek.value--;
      }
    }

    function formatObjectiveLabel(date) {
      return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date(`${date}T12:00:00`));
    }

    function formatWeekTitle(week) {
      const firstDate = new Date(`${week.objectives[0].date}T12:00:00`);

      const lastDate = new Date(`${week.objectives[4].date}T12:00:00`);

      const start = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
      }).format(firstDate);

      const end = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(lastDate);

      return `${start} – ${end}`;
    }

    function formatIcsDate(date) {
      return date.replaceAll("-", "");
    }

    function getNextDate(date) {
      const nextDate = new Date(`${date}T12:00:00`);

      nextDate.setDate(nextDate.getDate() + 1);

      return formatDate(nextDate);
    }

    function escapeIcsText(text) {
      return text
        .replaceAll("\\", "\\\\")
        .replaceAll("\n", "\\n")
        .replaceAll(",", "\\,")
        .replaceAll(";", "\\;");
    }

    function getIcsTimestamp() {
      return new Date()
        .toISOString()
        .replaceAll("-", "")
        .replaceAll(":", "")
        .replace(/\.\d{3}Z$/, "Z");
    }

    function createIcsEvent(objective) {
      const startDate = formatIcsDate(objective.date);
      const endDate = formatIcsDate(getNextDate(objective.date));
      const title = escapeIcsText(objective.title.trim());

      return [
        "BEGIN:VEVENT",
        `UID:objective-${startDate}@dashboard`,
        `DTSTAMP:${getIcsTimestamp()}`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `DTEND;VALUE=DATE:${endDate}`,
        `SUMMARY:🎯 ${title}`,
        "TRANSP:TRANSPARENT",
        "STATUS:CONFIRMED",
        "END:VEVENT",
      ].join("\r\n");
    }

    function getCompletedObjectives() {
      return weeks.value.flatMap(function (week) {
        return week.objectives.filter(function (objective) {
          return objective.title.trim() !== "" && !objective.exported;
        });
      });
    }

    function createIcsCalendar() {
      const events = getCompletedObjectives()
        .map(function (objective) {
          return createIcsEvent(objective);
        })
        .join("\r\n");

      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Dashboard//Weekly Objectives//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        events,
        "END:VCALENDAR",
      ].join("\r\n");
    }

    function exportObjectivesToOutlook() {
      const completedObjectives = getCompletedObjectives();

      if (completedObjectives.length === 0) {
        return;
      }

      const calendarContent = createIcsCalendar();

      const blob = new Blob([calendarContent], {
        type: "text/calendar;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `work-objectives-${weeks.value[0].startDate}.ics`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      completedObjectives.forEach(function (objective) {
        objective.exported = true;
      });
    }

    return {
      selectedWeek,
      weeks,
      initializeWeeks,
      goToNextWeek,
      goToPreviousWeek,
      formatObjectiveLabel,
      formatWeekTitle,
      exportObjectivesToOutlook,
    };
  },
  {
    persist: true,
  },
);
