function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanListItem(value) {
  return String(value)
    .replace(/^\s*[-–—•]\s*/, "")
    .trim();
}

function getEntryTime(entry) {
  if (entry.timeLabel) {
    return entry.timeLabel;
  }

  if (entry.startTime && entry.endTime) {
    return `${entry.startTime} - ${entry.endTime}`;
  }

  return "";
}

function activitiesToHtml(activities = "", asList = false) {
  const activityText = Array.isArray(activities)
    ? activities.join("\n")
    : typeof activities === "string"
      ? activities
      : "";

  if (!activityText.trim()) {
    return "<p></p>";
  }

  if (asList) {
    return notesToHtml({ notes: activityText });
  }

  return `<p>${escapeHtml(activityText).replaceAll("\n", "<br>")}</p>`;
}

function notesToHtml(entry) {
  const parts = [];

  if (entry.objective) {
    parts.push(
      `<p><strong>Objectif :</strong></p><p>${escapeHtml(entry.objective)}</p>`,
    );
  }

  if (typeof entry.notes === "string" && entry.notes.trim()) {
    const lines = entry.notes.split("\n").filter(function (line) {
      return line.trim();
    });

    let listItems = [];

    function flushList() {
      if (listItems.length > 0) {
        parts.push(`<ul>${listItems.join("")}</ul>`);
        listItems = [];
      }
    }

    lines.forEach(function (line) {
      const trimmedLine = line.trim();

      if (/^[-–—•]\s+/.test(trimmedLine)) {
        listItems.push(
          `<li><p>${escapeHtml(cleanListItem(trimmedLine))}</p></li>`,
        );
      } else {
        flushList();
        parts.push(`<p>${escapeHtml(trimmedLine)}</p>`);
      }
    });

    flushList();
  }

  return parts.join("") || "<p></p>";
}

function feedbackToHtml(feedback = {}) {
  const feedbackFields = [
    {
      label: "Activité préférée",
      value: feedback.favoriteActivity,
    },
    {
      label: "Activité la moins aimée",
      value: feedback.leastFavoriteActivity,
    },
    {
      label: "Feedback",
      value: feedback.feedback,
    },
    {
      label: "Objectifs personnels",
      value: feedback.personalGoals,
    },
  ];

  const rows = feedbackFields
    .filter(function (field) {
      return typeof field.value === "string" && field.value.trim();
    })
    .map(function (field) {
      return `
        <tr>
          <th><p>${field.label}</p></th>
          <td><p>${escapeHtml(field.value.trim()).replaceAll("\n", "<br>")}</p></td>
        </tr>
      `;
    })
    .join("");

  if (!rows) {
    return "";
  }

  return `
    <table>
      <tbody>
        <tr>
          <th colspan="2"><p>Feedback</p></th>
        </tr>
        ${rows}
      </tbody>
    </table>
  `;
}

export function journalToHTML(journal) {
  const rows = journal.content.days
    .flatMap(function (day) {
      return day.entries.map(function (entry, index) {
        const dayCell =
          index === 0
            ? `<p><strong>${escapeHtml(day.label)}</strong></p>`
            : "<p></p>";

        return `
          <tr>
            <td>${dayCell}</td>
            <td><p>${escapeHtml(getEntryTime(entry))}</p></td>
            <td>${activitiesToHtml(
              entry.activities,
              entry.key === "morningRoutine",
            )}</td>
            <td>${notesToHtml(entry)}</td>
          </tr>
        `;
      });
    })
    .join("");

  const feedback = feedbackToHtml(journal.content.feedback);

  return `
    <table>
      <tbody>
        <tr>
          <th><p>Jour</p></th>
          <th><p>Période</p></th>
          <th><p>Activité / Ce que j’ai fait</p></th>
          <th><p>Notes / blocages</p></th>
        </tr>
        ${rows}
      </tbody>
    </table>
    ${feedback}
  `.trim();
}

export async function copyJournalAsHTML(journal) {
  const html = journalToHTML(journal);

  const clipboardItem = new ClipboardItem({
    "text/html": new Blob([html], {
      type: "text/html",
    }),
  });

  await navigator.clipboard.write([clipboardItem]);
}
