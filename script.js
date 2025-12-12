/* ================= CONFIG ================= */
const DAYS = 31;
const MONTH = "January 2026";

/* ================= STATE ================= */
let currentDay = 1;
let pieChart = null;
let lineChart = null;

let data = JSON.parse(localStorage.getItem("jan2026Tracker")) || {
  habits: [],
  log: {} // { day: { habit: true/false } }
};

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  if (data.habits.length === 0) {
    renderSetup();
  } else {
    showMain();
  }
});

/* ================= SETUP ================= */
function renderSetup() {
  const setup = document.getElementById("setup");
  setup.innerHTML = `
    <h2>Enter 10 Habits for ${MONTH}</h2>
    ${Array.from({ length: 10 }).map(
      (_, i) => `<input placeholder="Habit ${i + 1}" />`
    ).join("")}
    <button onclick="startTracking()">Start Tracking</button>
  `;
}

function startTracking() {
  const inputs = document.querySelectorAll("#setup input");
  const habits = [...inputs].map(i => i.value.trim()).filter(Boolean);

  if (habits.length !== 10) {
    alert("Please enter exactly 10 habits");
    return;
  }

  data.habits = habits;
  save();
  showMain();
}

/* ================= MAIN ================= */
function showMain() {
  document.getElementById("setup").style.display = "none";
  document.getElementById("main").style.display = "block";
  renderDay();
}

/* ================= DAY UI ================= */
function renderDay() {
  document.getElementById("dateText").innerText =
    `Day ${currentDay} – ${MONTH}`;

  const container = document.getElementById("habits");
  container.innerHTML = "";

  data.habits.forEach(habit => {
    const status = data.log[currentDay]?.[habit];

    const card = document.createElement("div");
    card.className = "habit-card";

    card.innerHTML = `
      <h3>${habit}</h3>
      <div class="actions">
        <button class="${status === true ? "active done" : "done"}"
          onclick="setHabit('${habit}', true)">✔ DONE</button>
        <button class="${status === false ? "active notdone" : "notdone"}"
          onclick="setHabit('${habit}', false)">✖ NOT DONE</button>
      </div>
    `;

    container.appendChild(card);
  });

  renderCharts();
}

/* ================= ACTIONS ================= */
function setHabit(habit, value) {
  if (!data.log[currentDay]) data.log[currentDay] = {};
  data.log[currentDay][habit] = value;
  save();
  renderDay();
}

function prevDay() {
  if (currentDay > 1) {
    currentDay--;
    renderDay();
  }
}

function nextDay() {
  if (currentDay < DAYS) {
    currentDay++;
    renderDay();
  }
}

/* ================= STATS ================= */
function dailyStats() {
  let done = 0, notDone = 0;
  data.habits.forEach(h => {
    const v = data.log[currentDay]?.[h];
    if (v === true) done++;
    if (v === false) notDone++;
  });
  return { done, notDone };
}

function monthlyTrend() {
  const arr = [];
  for (let d = 1; d <= DAYS; d++) {
    let count = 0;
    data.habits.forEach(h => {
      if (data.log[d]?.[h] === true) count++;
    });
    arr.push(count);
  }
  return arr;
}

/* ================= CHARTS ================= */
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
        backgroundColor: ["#00ff99", "#ff4d4d"]
      }]
    },
    options: {
      responsive: true
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
        borderColor: "#00b0ff",
        backgroundColor: "rgba(0,176,255,0.2)",
        tension: 0.3,
        pointRadius: 5,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

/* ================= STORAGE ================= */
function save() {
  localStorage.setItem("jan2026Tracker", JSON.stringify(data));
}
