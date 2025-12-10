const STORAGE_KEY = "cerina_entries";
const MAX_ENTRIES = 50;

const form = document.getElementById("checkInForm");
const timeline = document.getElementById("timeline");
const clearButton = document.getElementById("clearEntries");
const lastCheckIn = document.getElementById("lastCheckIn");
const averageMood = document.getElementById("averageMood");
const entryCount = document.getElementById("entryCount");
const checkInButton = document.getElementById("checkInButton");
const viewJournalButton = document.getElementById("viewJournalButton");
const checkInPanel = document.getElementById("checkInPanel");
const journalPanel = document.getElementById("journalPanel");
const breathingReminder = document.getElementById("breathingReminder");

const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
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

const saveEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
};

const updateSummary = (entries) => {
  entryCount.textContent = entries.length;
  if (!entries.length) {
    lastCheckIn.textContent = "—";
    averageMood.textContent = "—";
    return;
  }

  const last = entries[entries.length - 1];
  lastCheckIn.textContent = formatDate(last.date);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekEntries = entries.filter((entry) => new Date(entry.date).getTime() >= weekAgo);
  const average = weekEntries.reduce((sum, item) => sum + Number(item.mood), 0) / weekEntries.length;
  averageMood.textContent = `${average.toFixed(1)} / 5`;
};

const renderEntries = (entries) => {
  timeline.innerHTML = "";
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No check-ins yet. Take a breath and add your first reflection.";
    timeline.appendChild(empty);
    return;
  }

  entries.slice().reverse().forEach((entry) => {
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

const scrollToSection = (element) => {
  element.scrollIntoView({ behavior: "smooth", block: "start" });
};

checkInButton?.addEventListener("click", () => scrollToSection(checkInPanel));
viewJournalButton?.addEventListener("click", () => scrollToSection(journalPanel));

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const entry = {
    mood: data.get("mood"),
    energy: data.get("energy"),
    note: data.get("note") || "",
    reminder: breathingReminder.checked,
    date: new Date().toISOString()
  };

  const entries = [...loadEntries(), entry];
  saveEntries(entries);
  renderEntries(entries);
  updateSummary(entries);

  form.reset();
  form.mood.value = entry.mood;
  if (entry.reminder) {
    alert("Breathing break set. Try box breathing: inhale 4, hold 4, exhale 4, hold 4.");
  }
});

clearButton?.addEventListener("click", () => {
  if (!confirm("Clear all check-ins from this device?")) return;
  saveEntries([]);
  renderEntries([]);
  updateSummary([]);
});

const init = () => {
  const entries = loadEntries();
  renderEntries(entries);
  updateSummary(entries);
};

init();
