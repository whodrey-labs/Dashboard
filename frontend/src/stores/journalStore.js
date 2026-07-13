import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  journalDayTemplate,
  journalDays,
  journalFeedbackTemplate,
} from "@/templates/journalTemplate";
import {
  getDayName,
  getIsoWeek,
  getIsoWeekYear,
} from "@/composables/dateUtils";

export const useJournalStore = defineStore(
  "journal",
  () => {
    const journals = ref([]);

    function findEntry(entries, key) {
      return entries?.find((entry) => entry.key === key);
    }

    function isDayCompleted(day) {
      if (!Array.isArray(day?.entries)) {
        return false;
      }

      const morningRoutine = findEntry(day.entries, "morningRoutine");

      const morningWork = findEntry(day.entries, "morningWork");

      const afternoonWork = findEntry(day.entries, "afternoonWork");

      return (
        Boolean(morningRoutine?.objective?.trim()) &&
        Boolean(
          morningWork?.activities?.some((activity) => activity?.trim()),
        ) &&
        Boolean(afternoonWork?.activities?.some((activity) => activity?.trim()))
      );
    }

    function countUserActivities(day) {
      if (!Array.isArray(day?.entries)) {
        return 0;
      }

      return day.entries.reduce((total, entry) => {
        if (entry.key === "morningRoutine") {
          return total;
        }

        const activities = Array.isArray(entry.activities)
          ? entry.activities
          : [];

        return (
          total +
          activities.filter(
            (activity) =>
              typeof activity === "string" && activity.trim().length > 0,
          ).length
        );
      }, 0);
    }

    function getTemplateEntry(key) {
      return structuredClone(
        journalDayTemplate.find((entry) => entry.key === key),
      );
    }

    function normalizeDayEntries(entries = []) {
      const oldMorningRoutine = findEntry(entries, "morningRoutine");
      const oldStandup = findEntry(entries, "standup");
      const oldMorningWork = findEntry(entries, "morningWork");
      const oldLunchBreak = findEntry(entries, "lunchBreak");
      const oldAfternoonWork = findEntry(entries, "afternoonWork");

      const isCurrentTemplate =
        !oldStandup &&
        !oldLunchBreak &&
        oldMorningRoutine?.timeLabel &&
        oldMorningWork?.timeLabel &&
        oldAfternoonWork?.timeLabel;

      if (isCurrentTemplate) {
        return [
          {
            ...getTemplateEntry("morningRoutine"),
            ...oldMorningRoutine,
            activities:
              oldMorningRoutine.activities ??
              getTemplateEntry("morningRoutine").activities,
            objective: oldMorningRoutine.objective ?? "",
            notes: oldMorningRoutine.notes ?? "",
          },
          {
            ...getTemplateEntry("morningWork"),
            ...oldMorningWork,
            activities: oldMorningWork.activities ?? [],
            notes: oldMorningWork.notes ?? "",
          },
          {
            ...getTemplateEntry("afternoonWork"),
            ...oldAfternoonWork,
            activities: oldAfternoonWork.activities ?? [],
            notes: oldAfternoonWork.notes ?? "",
          },
        ];
      }

      const morningRoutine = {
        ...getTemplateEntry("morningRoutine"),
        activities: uniqueActivities(
          getTemplateEntry("morningRoutine").activities,
          oldMorningRoutine?.activities ?? [],
          oldStandup?.activities ?? [],
        ),
        objective: oldMorningRoutine?.objective ?? oldStandup?.objective ?? "",
        notes: combineNotes(oldMorningRoutine?.notes, oldStandup?.notes),
      };

      const morningWork = {
        ...getTemplateEntry("morningWork"),
        activities: oldMorningWork?.activities ?? [],
        notes: oldMorningWork?.notes ?? "",
      };

      const afternoonWork = {
        ...getTemplateEntry("afternoonWork"),
        activities: oldAfternoonWork?.activities ?? [],
        notes: oldAfternoonWork?.notes ?? "",
      };

      return [morningRoutine, morningWork, afternoonWork];
    }

    function normalizeJournal(journal) {
      return {
        ...journal,
        completed: journal.completed ?? false,
        content: {
          ...journal.content,
          days: (journal.content?.days ?? []).map((day) => ({
            ...day,
            entries: normalizeDayEntries(day.entries),
          })),
          feedback: {
            ...structuredClone(journalFeedbackTemplate),
            ...(journal.content?.feedback ?? {}),
          },
        },
      };
    }

    function normalizeJournalsToCurrentTemplate() {
      journals.value = journals.value.map(normalizeJournal);
    }

    function createNewJournal(date = new Date()) {
      const weekNumber = getIsoWeek(date);
      const year = getIsoWeekYear(date);
      const now = new Date().toISOString();

      return {
        name: `Journal de travail S${weekNumber}`,
        year,
        weekNumber,
        completed: false,
        createdAt: now,
        editedAt: now,

        content: {
          days: journalDays.map((day) => ({
            ...day,
            entries: structuredClone(journalDayTemplate),
          })),

          feedback: structuredClone(journalFeedbackTemplate),
        },
      };
    }

    function ensureJournalForDate(date = new Date()) {
      normalizeJournalsToCurrentTemplate();

      const weekNumber = getIsoWeek(date);
      const year = getIsoWeekYear(date);

      const existingJournal = journals.value.find(
        (journal) => journal.weekNumber === weekNumber && journal.year === year,
      );

      if (existingJournal) {
        return existingJournal;
      }

      const journal = createNewJournal(date);
      journals.value.push(journal);

      return journal;
    }

    function ensureCurrentWeekJournal() {
      return ensureJournalForDate(new Date());
    }

    /*
     * Homepage journal values
     */

    const currentWeekJournal = computed(() => {
      const today = new Date();
      const weekNumber = getIsoWeek(today);
      const year = getIsoWeekYear(today);

      return (
        journals.value.find(
          (journal) =>
            journal.weekNumber === weekNumber && journal.year === year,
        ) ?? null
      );
    });

    const currentDay = computed(() => {
      const journal = currentWeekJournal.value;

      if (!journal) {
        return null;
      }

      return (
        journal.content?.days?.find((day) => day.name === getDayName()) ?? null
      );
    });

    const isCurrentDayFilled = computed(() => {
      return isDayCompleted(currentDay.value);
    });

    const filledDaysThisWeek = computed(() => {
      const days = currentWeekJournal.value?.content?.days ?? [];

      return days.filter(isDayCompleted).length;
    });

    const currentDayActivityCount = computed(() => {
      return countUserActivities(currentDay.value);
    });

    const activitiesThisWeek = computed(() => {
      const days = currentWeekJournal.value?.content?.days ?? [];

      return days.reduce((total, day) => {
        return total + countUserActivities(day);
      }, 0);
    });

    const totalJournalCount = computed(() => {
      return journals.value.length;
    });

    const newJournal = ref(createNewJournal());

    return {
      journals,
      newJournal,

      currentWeekJournal,
      currentDay,
      isCurrentDayFilled,
      currentDayActivityCount,
      filledDaysThisWeek,
      activitiesThisWeek,
      totalJournalCount,

      createNewJournal,
      ensureCurrentWeekJournal,
      ensureJournalForDate,
      normalizeJournalsToCurrentTemplate,
    };
  },
  {
    persist: true,
  },
);
