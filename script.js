document.addEventListener("DOMContentLoaded", () => {

  const DAYS = 31;
  const START_DAY_INDEX = 4; // Thursday
  const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  let currentDay = 1;

  let data = {
    habits: [],
    log: {}
  };

  const setupDiv = document.getElementById("setup");
  const mainDiv = document.getElementById("main");
  const habitsDiv = document.getElementById("habits");

  let pieChart = null;
  let lineChart = null;

  // ---------- SETUP ----------
  renderSetup();

  function renderSetup() {
    let html = `<h2>Enter 10 Habits for January 2026</h2>`;
    for (let i = 0; i < 10; i++) {
      html += `<input placeholder="Habit ${i + 1}">`;
    }
    html += `<button id="startBtn">Start Tracking</button>`;
    setupDiv.innerHTML = html;

    document.getElementById("startBtn").onclick = startTracking;
  }

  function startTracking() {
    const inputs = setupDiv.querySelectorAll("input");
    const habits = [...inputs].map(i => i.value.trim()).filter(Boolean);

    if (habits.length !== 10) {
      alert("Please enter exactly 10 habits");
      return;
    }

    data.habits = habits;
    setupDiv.style.display = "none";
    mainDiv.style.display = "block";

    renderAll();
  }

  // ---------- NAV ----------
  window.prevDay = () => {
    if (currentDay > 1) {
      currentDay--;
      renderAll();
    }
  };

  window.nextDay = () => {
    if (currentDay < DAYS) {
      currentDay++;
      renderAll();
    }
  };

  // ---------- RENDER ----------
  function renderAll() {
    renderDate();
    renderHabits();
    renderCharts();
  }

  function renderDate() {
    const idx = (START_DAY_INDEX + currentDay - 1) % 7;
    document.getElementById("dateText").innerText =
      `${DAY_NAMES[idx]}, ${currentDay} January 2026`;
  }

  function renderHabits() {
    habitsDiv.innerHTML = "";

    if (!data.log[currentDay]) data.log[currentDay] = {};

    data.habits.forEach(habit => {
      const state = data.log[currentDay][habit];

      const div = document.createElement("div");
      div.className = "habit";
      div.innerHTML = `
        <div class="habit-name">${habit}</div>
        <div class="actions">
          <button class="action-btn done ${state === true ? "active" : ""}">✔ DONE</button>
          <button class="action-btn not-done ${state === false ? "active" : ""}">✖ NOT DONE</button>
        </div>
      `;

      div.querySelector(".done").onclick = () => setHabit(habit, true);
      div.querySelector(".not-done").onclick = () => setHabit(habit, false);

      habitsDiv.appendChild(div);
    });
  }

function setHabit(day, habit, value) {
  if (!data.log[day]) data.log[day] = {};
  data.log[day][habit] = value;

  saveData();
  renderHabits();
  renderCharts();   // ⭐ THIS IS THE FIX
}

  // ---------- STATS ----------
  function dailyStats() {
    let done = 0, notDone = 0;
    data.habits.forEach(h => {
      if (data.log[currentDay]?.[h] === true) done++;
      if (data.log[currentDay]?.[h] === false) notDone++;
    });
    return { done, notDone };
  }

  function monthlyTrend() {
    let arr = [];
    for (let d = 1; d <= DAYS; d++) {
      let count = 0;
      data.habits.forEach(h => {
        if (data.log[d]?.[h] === true) count++;
      });
      arr.push(count);
    }
    return arr;
  }

  // ---------- CHARTS ----------
  function renderCharts() {
  renderDailyPie();
  renderMonthlyLine();
}

// ---------- DAILY PIE ----------
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
        backgroundColor: ["#00e676", "#ff5252"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { font: { size: 16 } }
        }
      }
    }
  });
}

// ---------- MONTHLY LINE ----------
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

