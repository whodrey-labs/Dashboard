import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const usePersonalTasksStore = defineStore(
  "personalTasks",
  () => {
    const recurringTasks = ref([
      {
        id: "laundry",
        title: "Laundry",
        description: "Wash, dry, and put away clothes.",
        defaultDay: 6,
      },
      {
        id: "vacuum",
        title: "Vacuum",
        description: "Vacuum the main rooms.",
        defaultDay: 3,
      },
      {
        id: "water-plants",
        title: "Water plants",
        description: "Check the soil and water the indoor plants.",
        defaultDay: 2,
      },
    ]);

    const weeklyTasks = ref([]);
    const currentWeekStart = ref(getMonday(new Date()));
    const tasksByDay = ref({});

    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    function getMonday(date) {
      const monday = new Date(date);
      const day = monday.getDay();

      monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
      monday.setHours(0, 0, 0, 0);

      return monday;
    }

    function getWeekDays(weekStart) {
      const days = [];
      const monday = getMonday(weekStart);

      for (let index = 0; index < 7; index++) {
        const date = new Date(monday);

        date.setDate(date.getDate() + index);

        days.push({
          date: formatDate(date),
          name: new Intl.DateTimeFormat("en-GB", {
            weekday: "long",
          }).format(date),
          dateLabel: new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
          }).format(date),
        });
      }

      return days;
    }

    function formatWeekTitle(weekStart) {
      const firstDay = getMonday(weekStart);
      const lastDay = new Date(firstDay);

      lastDay.setDate(lastDay.getDate() + 6);

      const formatter = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return `${formatter.format(firstDay)} – ${formatter.format(lastDay)}`;
    }

    function generateWeek(weekStart) {
      const monday = getMonday(weekStart);
      const weekKey = formatDate(monday);

      const weekAlreadyExists = weeklyTasks.value.some(function (task) {
        return task.weekStart === weekKey;
      });

      if (weekAlreadyExists) {
        return;
      }

      recurringTasks.value.forEach(function (recurringTask) {
        const taskDate = new Date(monday);

        taskDate.setDate(taskDate.getDate() + recurringTask.defaultDay - 1);

        weeklyTasks.value.push({
          id: `${recurringTask.id}-${weekKey}`,
          taskId: recurringTask.id,
          title: recurringTask.title,
          description: recurringTask.description,
          date: formatDate(taskDate),
          weekStart: weekKey,
          completed: false,
        });
      });
    }

    function getTasksForDate(date) {
      return weeklyTasks.value.filter(function (task) {
        return task.date === date;
      });
    }

    function replaceWeekTasks(weekStart, weekTasksByDay) {
      const weekKey = formatDate(getMonday(weekStart));

      const tasksFromOtherWeeks = weeklyTasks.value.filter(function (task) {
        return task.weekStart !== weekKey;
      });

      const updatedWeekTasks = Object.entries(weekTasksByDay).flatMap(function ([
        date,
        tasks,
      ]) {
        return tasks.map(function (task) {
          task.date = date;
          task.weekStart = weekKey;

          return task;
        });
      });

      weeklyTasks.value = [...tasksFromOtherWeeks, ...updatedWeekTasks];
    }

    function toggleTask(taskId) {
      const task = weeklyTasks.value.find(function (task) {
        return task.id === taskId;
      });

      if (!task) {
        return;
      }

      task.completed = !task.completed;
    }

    function addTask(title, description, date) {
      const taskDate = new Date(`${date}T00:00:00`);

      weeklyTasks.value.push({
        id: `personal-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        date: formatDate(taskDate),
        weekStart: formatDate(getMonday(taskDate)),
        completed: false,
      });
    }

    function loadWeek(weekStart = currentWeekStart.value) {
      currentWeekStart.value = getMonday(weekStart);
      generateWeek(currentWeekStart.value);

      tasksByDay.value = getWeekDays(currentWeekStart.value).reduce(function (
        tasks,
        day,
      ) {
        tasks[day.date] = getTasksForDate(day.date);

        return tasks;
      }, {});
    }

    function previousWeek() {
      const date = new Date(currentWeekStart.value);

      date.setDate(date.getDate() - 7);
      loadWeek(date);
    }

    function nextWeek() {
      const date = new Date(currentWeekStart.value);

      date.setDate(date.getDate() + 7);
      loadWeek(date);
    }

    function goToCurrentWeek() {
      loadWeek(new Date());
    }

    function saveMovedTasks() {
      replaceWeekTasks(currentWeekStart.value, tasksByDay.value);
    }

    const weekDays = computed(function () {
      return getWeekDays(currentWeekStart.value);
    });

    const weekTitle = computed(function () {
      return formatWeekTitle(currentWeekStart.value);
    });

    const completedTaskCount = computed(function () {
      return weeklyTasks.value.filter(function (task) {
        return task.completed;
      }).length;
    });

    return {
      recurringTasks,
      weeklyTasks,
      currentWeekStart,
      tasksByDay,

      completedTaskCount,
      weekDays,
      weekTitle,

      formatDate,
      getMonday,
      generateWeek,
      getTasksForDate,
      replaceWeekTasks,
      toggleTask,
      addTask,
      loadWeek,
      previousWeek,
      nextWeek,
      goToCurrentWeek,
      saveMovedTasks,
    };
  },
  {
    persist: true,
  },
);
