/***********************
  BASIC CONFIG
************************/
const DAYS = 31;
let currentDay = 1;

let pieChart = null;
let lineChart = null;

/***********************
  DATA STORAGE
************************/
let data = {
  habits: [],
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
  SET HABIT STATUS
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
  CHART RENDER
************************/
function renderCharts() {
  renderDailyPie();
  renderMonthlyLine();
}

/***********************
  DAILY PIE CHART
************************/
function renderDailyPie() {
  const ctx = document.getElementById("dailyPie");
  if (!ctx) return;

  if (pieChart) pieChart.destroy();

  const { done, notDone } = dailyStats();

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Done", "Not Done"],
      datasets: [{
        data: [done, notDone],
        backgroundColor: ["#7CFC98", "#F45B5B"]
      }]
    },
    options: {
      responsive: true
    }
  });
}

/***********************
  MONTHLY LINE CHART
************************/
function renderMonthlyLine() {
  const ctx = document.getElementById("monthlyLine");
  if (!ctx) return;

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

/***********************
  UI BUILD
************************/
function buildHabitsUI() {
  const container = document.getElementById("habits");
  if (!container) return;

  container.innerHTML = "";

  data.habits.forEach(habit => {
    const card = document.createElement("div");
    card.className = "habit-card";

    const title = document.createElement("h3");
    title.textContent = habit;

    const doneBtn = document.createElement("button");
    doneBtn.className = "done";
    doneBtn.textContent = "✔ DONE";
    doneBtn.onclick = () => setHabitStatus(habit, true);

    const notDoneBtn = document.createElement("button");
    notDoneBtn.className = "not-done";
    notDoneBtn.textContent = "✖ NOT DONE";
    notDoneBtn.onclick = () => setHabitStatus(habit, false);

    card.appendChild(title);
    card.appendChild(doneBtn);
    card.appendChild(notDoneBtn);

    container.appendChild(card);
  });
}

/***********************
  INIT
************************/
buildHabitsUI();
renderCharts();

