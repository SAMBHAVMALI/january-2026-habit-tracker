const DAYS = 31;
const START_DATE = new Date(2026, 0, 1); // Jan 1, 2026

let state = JSON.parse(localStorage.getItem("habitData")) || {
  habits: [],
  logs: {},
  day: 1
};

let dailyChart, monthlyChart;

/* SPLASH */
setTimeout(() => {
  document.getElementById("splash").classList.add("hidden");
  init();
}, 1000);

/* INIT */
function init() {
  if (state.habits.length === 0) showSetup();
  else showApp();
}

/* SETUP */
function showSetup() {
  const setup = document.getElementById("setup");
  setup.classList.remove("hidden");

  const container = document.getElementById("habitInputs");
  container.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const input = document.createElement("input");
    input.placeholder = `Habit ${i + 1}`;
    container.appendChild(input);
  }

  document.getElementById("startBtn").onclick = () => {
    state.habits = [...container.querySelectorAll("input")]
      .map(i => i.value.trim())
      .filter(Boolean);

    save();
    showApp();
  };
}

/* APP */
function showApp() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  render();
}

function render() {
  renderDate();
  renderHabits();
  renderCharts();
}

function renderDate() {
  const date = new Date(START_DATE);
  date.setDate(state.day);
  document.getElementById("dateLabel").textContent =
    date.toDateString();
}

function renderHabits() {
  const grid = document.getElementById("habitsGrid");
  grid.innerHTML = "";

  if (!state.logs[state.day]) state.logs[state.day] = {};

  state.habits.forEach(h => {
    const card = document.createElement("div");
    card.className = "habitCard";

    const title = document.createElement("h4");
    title.textContent = h;

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✓ Done";
    doneBtn.className = "done";
    doneBtn.onclick = () => {
      state.logs[state.day][h] = true;
      save(); render();
    };

    const notBtn = document.createElement("button");
    notBtn.textContent = "✕ Not Done";
    notBtn.className = "notdone";
    notBtn.onclick = () => {
      state.logs[state.day][h] = false;
      save(); render();
    };

    card.append(title, doneBtn, notBtn);
    grid.appendChild(card);
  });
}

/* CHARTS */
function renderCharts() {
  renderDailyPie();
  renderMonthlyLine();
}

function renderDailyPie() {
  const log = state.logs[state.day] || {};
  let done = 0, notDone = 0;

  state.habits.forEach(h => {
    if (log[h] === true) done++;
    else if (log[h] === false) notDone++;
  });

  if (dailyChart) dailyChart.destroy();

  dailyChart = new Chart(dailyPie, {
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
  const data = [];

  for (let d = 1; d <= DAYS; d++) {
    let count = 0;
    if (state.logs[d]) {
      state.habits.forEach(h => {
        if (state.logs[d][h] === true) count++;
      });
    }
    data.push(count);
  }

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(monthlyLine, {
    type: "line",
    data: {
      labels: Array.from({length: DAYS}, (_, i) => i + 1),
      datasets: [{
        label: "Habits Completed",
        data,
        borderColor: "#38bdf8",
        tension: 0.3,
        fill: false
      }]
    }
  });
}

/* NAV */
prevDay.onclick = () => {
  if (state.day > 1) state.day--;
  save(); render();
};

nextDay.onclick = () => {
  if (state.day < DAYS) state.day++;
  save(); render();
};

/* BACKUP */
exportBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(state)], {type: "application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "habit-backup.json";
  a.click();
};

importBtn.onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = e => {
    const file = e.target.files[0];
    file.text().then(t => {
      state = JSON.parse(t);
      save(); render();
    });
  };
  input.click();
};

resetBtn.onclick = () => {
  if (confirm("Reset everything?")) {
    localStorage.removeItem("habitData");
    location.reload();
  }
};

function save() {
  localStorage.setItem("habitData", JSON.stringify(state));
}
