const DAYS = 31;
const today = new Date().getDate();

let data = JSON.parse(localStorage.getItem("habitData")) || {
  habits: [],
  log: {}
};

let pieChart, lineChart;

function save() {
  localStorage.setItem("habitData", JSON.stringify(data));
}

/* SPLASH */
setTimeout(() => {
  document.getElementById("splash").style.display = "none";
  init();
}, 1000);

/* MENU */
function toggleMenu() {
  document.getElementById("menu").classList.toggle("hidden");
}

/* INIT */
function init() {
  document.getElementById("topbar").classList.remove("hidden");

  if (data.habits.length === 0) {
    document.getElementById("setup").classList.remove("hidden");
  } else {
    document.getElementById("app").classList.remove("hidden");
    renderHabits();
    renderCharts();
  }
}

/* HABITS SETUP */
function saveHabits() {
  data.habits = document
    .getElementById("habitInput")
    .value.split(",")
    .map(h => h.trim())
    .filter(Boolean)
    .slice(0, 10);

  data.log = {};
  save();

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  renderHabits();
  renderCharts();
}

/* RENDER HABITS */
function renderHabits() {
  const box = document.getElementById("habits");
  box.innerHTML = "";

  if (!data.log[today]) data.log[today] = {};

  data.habits.forEach(h => {
    const div = document.createElement("div");
    div.className = "habit card";
    div.innerHTML = `
      <h4>${h}</h4>
      <button class="done">✔ Done</button>
      <button class="notdone">✖ Not Done</button>
    `;
    div.querySelector(".done").onclick = () => {
      data.log[today][h] = true;
      save(); renderCharts();
    };
    div.querySelector(".notdone").onclick = () => {
      data.log[today][h] = false;
      save(); renderCharts();
    };
    box.appendChild(div);
  });
}

/* STATS */
function dailyStats() {
  let done = 0, notDone = 0;
  const log = data.log[today] || {};
  data.habits.forEach(h => {
    if (log[h] === true) done++;
    else if (log[h] === false) notDone++;
  });
  return { done, notDone };
}

function monthlyTrend() {
  let arr = [];
  for (let d = 1; d <= DAYS; d++) {
    let count = 0;
    if (data.log[d]) {
      data.habits.forEach(h => {
        if (data.log[d][h] === true) count++;
      });
    }
    arr.push(count);
  }
  return arr;
}

/* CHARTS */
function renderCharts() {
  const { done, notDone } = dailyStats();

  if (pieChart) pieChart.destroy();
  if (lineChart) lineChart.destroy();

  pieChart = new Chart(dailyPie, {
    type: "pie",
    data: {
      labels: ["Done", "Not Done"],
      datasets: [{
        data: [done, notDone],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    }
  });

  lineChart = new Chart(monthlyLine, {
    type: "line",
    data: {
      labels: Array.from({ length: DAYS }, (_, i) => i + 1),
      datasets: [{
        label: "Habits Completed",
        data: monthlyTrend(),
        borderColor: "#1e90ff",
        tension: 0.3
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

/* RESET OPTIONS */
function resetToday() {
  delete data.log[today];
  save(); renderHabits(); renderCharts();
}

function resetMonth() {
  data.log = {};
  save(); renderHabits(); renderCharts();
}

function resetAll() {
  localStorage.removeItem("habitData");
  location.reload();
}

