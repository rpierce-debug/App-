const STORAGE_KEY = "cerina_entries";
const MAX_ENTRIES = 50;

const form = document.getElementById("checkInForm");
const timeline = document.getElementById("timeline");
const clearButton = document.getElementById("clearEntries");
const exportButton = document.getElementById("exportEntries");
const lastCheckIn = document.getElementById("lastCheckIn");
const averageMood = document.getElementById("averageMood");
const entryCount = document.getElementById("entryCount");
const streakEl = document.getElementById("streak");
const bestStreakEl = document.getElementById("bestStreak");
const checkInButton = document.getElementById("checkInButton");
const viewJournalButton = document.getElementById("viewJournalButton");
const checkInPanel = document.getElementById("checkInPanel");
const journalPanel = document.getElementById("journalPanel");
const breathingReminder = document.getElementById("breathingReminder");
const rangeFilter = document.getElementById("rangeFilter");
const noteCounter = document.getElementById("noteCounter");
const moodInput = document.getElementById("mood");
const moodLabel = document.getElementById("moodLabel");
const autoFill = document.getElementById("autoFill");
const insightSummary = document.getElementById("insightSummary");
const moodChart = document.getElementById("moodChart");

const prompts = [
  "What felt heavy today? What helped lighten it?",
  "Name one boundary you upheld or want to protect.",
  "Who made you feel supported? How can you thank them?",
  "Describe a moment you felt proud, even if it was small.",
  "What would 'rest' look like for you right now?"
];

let entries = [];

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

const loadEntries = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch (_) {
    return [];
  }
};

const saveEntries = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_ENTRIES)));
};

const calculateStreaks = (list) => {
  if (!list.length) return { current: 0, best: 0 };
  const days = [...new Set(list.map((entry) => new Date(entry.date).toDateString()))]
    .map((day) => new Date(day).getTime())
    .sort((a, b) => b - a);

  let current = 1;
  let best = 1;
  for (let i = 1; i < days.length; i += 1) {
    const diffDays = (days[i - 1] - days[i]) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      current += 1;
    } else if (diffDays > 1) {
      current = 1;
    }
    best = Math.max(best, current);
  }

  const lastEntryDay = days[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if ((today.getTime() - lastEntryDay) / (1000 * 60 * 60 * 24) >= 1) {
    current = 0;
  }

  return { current, best };
};

const updateSummary = (list) => {
  entryCount.textContent = list.length;
  if (!list.length) {
    lastCheckIn.textContent = "—";
    averageMood.textContent = "—";
    streakEl.textContent = "0 days";
    bestStreakEl.textContent = "0 days";
    return;
  }

  const last = list[list.length - 1];
  lastCheckIn.textContent = formatDate(last.date);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekEntries = list.filter((entry) => new Date(entry.date).getTime() >= weekAgo);
  const average =
    weekEntries.reduce((sum, item) => sum + Number(item.mood), 0) / weekEntries.length;
  averageMood.textContent = `${average.toFixed(1)} / 5`;

  const { current, best } = calculateStreaks(list);
  streakEl.textContent = `${current} ${current === 1 ? "day" : "days"}`;
  bestStreakEl.textContent = `${best} ${best === 1 ? "day" : "days"}`;
};

const filterEntries = (list) => {
  const range = rangeFilter?.value;
  if (!range || range === "all") return list;
  const days = Number(range);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return list.filter((entry) => new Date(entry.date).getTime() >= cutoff);
};

const renderEntries = (list) => {
  timeline.innerHTML = "";
  const visibleEntries = filterEntries(list);

  if (!visibleEntries.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent =
      list.length === 0
        ? "No check-ins yet. Take a breath and add your first reflection."
        : "No entries in this range. Try a wider window.";
    timeline.appendChild(empty);
    return;
  }

  visibleEntries
    .slice()
    .reverse()
    .forEach((entry) => {
      const wrapper = document.createElement("div");
      wrapper.className = "entry";

      const meta = document.createElement("div");
      meta.className = "entry__meta";
      meta.innerHTML = `
        <div>
          <strong>${formatDate(entry.date)}</strong>
          <p class="muted small">Energy: ${entry.energy}</p>
        </div>
        <span class="badge">Mood ${entry.mood}/5</span>
      `;

      const note = document.createElement("p");
      note.className = "entry__note";
      note.textContent = entry.note.trim() || "(No notes)";

      wrapper.append(meta, note);
      timeline.appendChild(wrapper);
    });
};

const drawChart = (list) => {
  if (!moodChart) return;
  const ctx = moodChart.getContext("2d");
  ctx.clearRect(0, 0, moodChart.width, moodChart.height);

  const sample = list.slice(-10);
  if (!sample.length) {
    insightSummary.textContent = "Add a check-in to see your trend.";
    return;
  }

  const minMood = 1;
  const maxMood = 5;
  const padding = 20;
  const width = moodChart.width - padding * 2;
  const height = moodChart.height - padding * 2;

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i += 1) {
    const y = padding + (height / 4) * i;
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + width, y);
  }
  ctx.stroke();

  const points = sample.map((entry, index) => {
    const x = padding + (width / Math.max(sample.length - 1, 1)) * index;
    const y = padding + height - ((entry.mood - minMood) / (maxMood - minMood)) * height;
    return { x, y, mood: entry.mood };
  });

  ctx.beginPath();
  ctx.strokeStyle = "#5f4ef5";
  ctx.lineWidth = 2;
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  ctx.fillStyle = "#5f4ef5";
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  const moods = sample.map((e) => Number(e.mood));
  const avg = moods.reduce((sum, value) => sum + value, 0) / moods.length;
  const high = Math.max(...moods);
  const low = Math.min(...moods);
  insightSummary.textContent = `Average ${avg.toFixed(1)}/5 • High ${high}/5 • Low ${low}/5`;
};

const scrollToSection = (element) => {
  element.scrollIntoView({ behavior: "smooth", block: "start" });
};

const updateMoodLabel = (value) => {
  const labels = {
    1: "Feeling low—go gently.",
    2: "A bit heavy—small steps help.",
    3: "Feels steady.",
    4: "Solid energy today.",
    5: "Feeling bright—enjoy it." 
  };
  moodLabel.textContent = labels[value] || "Feels steady.";
  moodInput.setAttribute("aria-valuenow", value);
};

const updateNoteCounter = () => {
  const count = form.note.value.length;
  noteCounter.textContent = `${count} / 500`;
};

const suggestPrompt = () => {
  const current = form.note.value.trim();
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  form.note.value = current ? `${current}\n\n${prompt}` : prompt;
  updateNoteCounter();
  form.note.focus();
};

const exportData = (list) => {
  if (!list.length) {
    alert("No entries to export yet.");
    return;
  }
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(list, null, 2)
  )}`;
  const anchor = document.createElement("a");
  anchor.setAttribute("href", dataStr);
  anchor.setAttribute("download", "cerina-entries.json");
  anchor.click();
};

checkInButton?.addEventListener("click", () => scrollToSection(checkInPanel));
viewJournalButton?.addEventListener("click", () => scrollToSection(journalPanel));

moodInput?.addEventListener("input", (event) => updateMoodLabel(event.target.value));
form?.note?.addEventListener("input", updateNoteCounter);
autoFill?.addEventListener("click", suggestPrompt);

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const moodValue = Number(data.get("mood"));
  const entry = {
    mood: Number.isFinite(moodValue) ? moodValue : 3,
    energy: data.get("energy") || "Stable",
    note: data.get("note")?.toString().trim() || "",
    reminder: breathingReminder.checked,
    date: new Date().toISOString()
  };

  entries = [...entries, entry];
  saveEntries(entries);
  renderEntries(entries);
  updateSummary(entries);
  drawChart(entries);

  form.reset();
  form.mood.value = entry.mood;
  updateMoodLabel(entry.mood);
  updateNoteCounter();
  if (entry.reminder) {
    alert("Breathing break set. Try box breathing: inhale 4, hold 4, exhale 4, hold 4.");
  }
});

clearButton?.addEventListener("click", () => {
  if (!confirm("Clear all check-ins from this device?")) return;
  entries = [];
  saveEntries(entries);
  renderEntries(entries);
  updateSummary(entries);
  drawChart(entries);
});

exportButton?.addEventListener("click", () => exportData(entries));
rangeFilter?.addEventListener("change", () => renderEntries(entries));

const init = () => {
  entries = loadEntries();
  renderEntries(entries);
  updateSummary(entries);
  drawChart(entries);
  updateMoodLabel(moodInput.value);
  updateNoteCounter();
};

init();
