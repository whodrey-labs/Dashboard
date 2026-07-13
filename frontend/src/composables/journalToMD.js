function escapeMarkdownTableCell(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().replaceAll("|", "\\|").replace(/\r?\n/g, "<br>");
}

function formatActivities(activities = []) {
  return activities
    .filter((activity) => typeof activity === "string" && activity.trim())
    .map((activity) => escapeMarkdownTableCell(activity))
    .join("<br>");
}

function getEntryTimeLabel(entry) {
  if (entry.timeLabel) {
    return entry.timeLabel;
  }

  if (entry.startTime || entry.endTime) {
    return `${entry.startTime ?? ""} - ${entry.endTime ?? ""}`.trim();
  }

  return "";
}

function createFeedbackSection(title, value) {
  const content =
    typeof value === "string" && value.trim()
      ? value.trim()
      : "_Non renseigné_";

  return `### ${title}

${content}`;
}

function createRatingSection(title, value) {
  const rating = Number(value);
  const content =
    Number.isInteger(rating) && rating >= 1 && rating <= 5
      ? `${rating} / 5`
      : "_Non renseigné_";

  return `### ${title}

${content}`;
}

export function journalToMarkdown(journal) {
  if (!journal) {
    throw new Error("Aucun journal n'a été fourni.");
  }

  const days = journal.content?.days ?? [];
  const feedback = journal.content?.feedback ?? {};

  const lines = [
    `# ${journal.name ?? "Journal de travail"}`,
    "",
    `**Année :** ${journal.year ?? "—"}  `,
    `**Semaine :** ${journal.weekNumber ?? "—"}`,
    "",
  ];

  for (const day of days) {
    lines.push(`## ${day.label ?? day.name ?? "Jour"}`);
    lines.push("");
    lines.push("| Période | Activités | Objectif | Notes |");
    lines.push("| --- | --- | --- | --- |");

    const entries = day.entries ?? [];

    if (entries.length === 0) {
      lines.push("| — | — | — | — |");
    } else {
      for (const entry of entries) {
        const period = escapeMarkdownTableCell(getEntryTimeLabel(entry));
        const activities = formatActivities(entry.activities);
        const objective = escapeMarkdownTableCell(entry.objective);
        const notes = escapeMarkdownTableCell(entry.notes);

        lines.push(
          `| ${period || "—"} | ${activities || "—"} | ${objective || "—"} | ${notes || "—"} |`,
        );
      }
    }

    lines.push("");
  }

  lines.push("## Feedback de la semaine");
  lines.push("");

  lines.push(
    createFeedbackSection("Activité préférée", feedback.favoriteActivity),
  );
  lines.push("");

  lines.push(
    createFeedbackSection(
      "Activité la moins appréciée",
      feedback.leastFavoriteActivity,
    ),
  );
  lines.push("");

  lines.push(createRatingSection("Motivation", feedback.motivation));
  lines.push("");

  lines.push(createRatingSection("Capacité", feedback.capacity));
  lines.push("");

  lines.push(createFeedbackSection("Feedback général", feedback.feedback));
  lines.push("");

  lines.push(
    createFeedbackSection("Objectifs personnels", feedback.personalGoals),
  );
  lines.push("");

  return lines.join("\n");
}

export function downloadJournalMarkdown(journal) {
  const markdown = journalToMarkdown(journal);

  const blob = new Blob([markdown], {
    type: "text/markdown;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const year = journal.year ?? "journal";
  const week = String(journal.weekNumber ?? "").padStart(2, "0");

  link.href = url;
  link.download = `journal-${year}-semaine-${week}.md`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
