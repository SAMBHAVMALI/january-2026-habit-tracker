const DAYS = 31;
const START_DATE = new Date(2026, 0, 1);

let state = JSON.parse(localStorage.getItem("habitData")) || {
  habits: [],
  logs: {},
  day: 1
};

let pieChart, lineChart;

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  if (state.habits.length === 0) setupScreen();
  else appScreen();
});

/* SETUP */
function setupScreen() {
  const container = document.getElementById("habitInputs");
  for (let i = 0; i < 10; i++) {
    const input = document.createElement("input");
    input.placeholder = `Habit ${i + 1}`;
    container.appendChild(input);
  }

  startBtn.onclick = () => {
    state.habits = [...container.querySelectorAll("input")]
      .map(i => i.value.trim())
      .filter(Boolean);

    save();
    appScreen();
  };
}

/* APP */
function appScreen() {
  setup.classList.add("hidden");
  app.classList.remove("hidden");
  render();
}

function render() {
  renderDate();
  renderHabits();
  renderCharts();
}

function renderDate() {
  const d = new Date(START_DATE);
  d.setDate(state.day);
  dateLabel.textContent = d.toDateString();
}

function renderHabits() {
  habits.innerHTML = "";
  if (!state.logs[state.day]) state.logs[state.day] = {};

  state.habits.forEach(h => {
    const div = document.createElement("div");
    div.className = "habit";
    div.innerHTML = `
      <strong>${h}</strong><br>
      <button>Done</button>
      <button class="danger">Not Done</button>
    `;

    div.children[1].onclick = () => {
      state.logs[state.day][h] = true;
      save(); render();
    };
    div.children[2].onclick = () => {
      state.logs[state.day][h] = false;
      save(); render();
    };

    habits.appendChild(div);
  });
}

/* CHARTS */
function renderCharts() {
  let done = 0, notDone = 0;
  const log = state.logs[state.day] || {};

  state.habits.forEach(h => {
    if (log[h] === true) done++;
    else if (log[h] === false) notDone++;
  });

  pieChart && pieChart.destroy();
  pieChart = new Chart(dailyPie, {
    type: "pie",
    data: {
      labels: ["Done", "Not Done"],
      datasets: [{
        data: [done, notDone],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    }
  });

  const monthly = [];
  for (let d = 1; d <= DAYS; d++) {
    let c = 0;
    if (state.logs[d]) {
      state.habits.forEach(h => state.logs[d][h] === true && c++);
    }
    monthly.push(c);
  }

  lineChart && lineChart.destroy();
  lineChart = new Chart(monthlyLine, {
    type: "line",
    data: {
      labels: Array.from({length:DAYS},(_,i)=>i+1),
      datasets: [{
        label: "Habits Done",
        data: monthly,
        borderColor: "#38bdf8",
        tension: 0.3
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
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

/* RESET */
resetAll.onclick = () => {
  if (confirm("Reset all data?")) {
    localStorage.removeItem("habitData");
    location.reload();
  }
};

function save() {
  localStorage.setItem("habitData", JSON.stringify(state));
}
