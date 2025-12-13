/***********************
  CONFIG
************************/
const DAYS = 31;
let currentDay = 1;

let pieChart = null;
let lineChart = null;

/***********************
  DATA
************************/
let data = {
  habits: ["Water", "Workout", "Study", "Sleep"],
  log: {}
};

function saveData() {
  localStorage.setItem("habitData", JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem("habitData");
  if (saved) data = JSON.parse(saved);
}

loadData();

/***********************
  HABIT STATUS
************************/
function setHabitStatus(habit, status) {
  if (!data.log[currentDay]) {
    data.log[currentDay] = {};
  }

  data.log[currentDay][habit] = status;
  saveData();
  renderCharts();
}

/***********************
  STATS
************************/
function dailyStats() {
  const dayLog = data.log[currentDay] || {};
  let done = 0;
  let notDone = 0;

  data.habits.forEach(habit => {
    if (dayLog[habit] === true) done++;
    else if (dayLog[habit] === false) notDone++;
  });

  return { done, notDone };
}

function monthlyTrend() {
  let arr = [];

  for (let d = 1; d <= DAYS; d++) {
    const dayLog = data.log[d];
    if (!dayLog) {
      arr.push(0);
      continue;
    }

    let count = 0;
    data.habits.forEach(h => {
      if (dayLog[h] === true) count++;
    });

    arr.push(count);
  }

  return arr;
}

/***********************
  CHARTS
************************/
function renderCharts() {
  renderDailyPie();
  renderMonthlyLine();
}

function renderDailyPie() {
  const ctx = document.getElementById("dailyPie");
  if (pieChart) pieChart.destroy();

  const { done, notDone } = dailyStats();

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Done", "Not Done"],
      datasets: [{
        data: [done, notDone],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    }
  });
}

function renderMonthlyLine() {
  const ctx = document.getElementById("monthlyLine");
  if (lineChart) lineChart.destroy();

  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: Array.from({ length: DAYS }, (_, i) => i + 1),
      datasets: [{
        label: "Habits Completed",
        data: monthlyTrend(),
        borderColor: "#3b82f6",
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/***********************
  UI
************************/
function buildHabitsUI() {
  const container = document.getElementById("habits");
  container.innerHTML = "";

  data.habits.forEach(habit => {
    const card = document.createElement("div");
    card.className = "habit-card";

    card.innerHTML = `
      <h3>${habit}</h3>
      <button class="done">✔ Done</button>
      <button class="not-done">✖ Not Done</button>
    `;

    card.querySelector(".done").onclick = () =>
      setHabitStatus(habit, true);

    card.querySelector(".not-done").onclick = () =>
      setHabitStatus(habit, false);

    container.appendChild(card);
  });
}

/***********************
  BACKUP
************************/
function exportData() {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "habit-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const imported = JSON.parse(e.target.result);
    if (!imported.habits || !imported.log) {
      alert("Invalid backup");
      return;
    }

    data = imported;
    saveData();
    buildHabitsUI();
    renderCharts();
    alert("Backup restored");
  };

  reader.readAsText(file);
}

/***********************
  INIT
************************/
buildHabitsUI();
renderCharts();

