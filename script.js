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

  function setHabit(habit, value) {
    data.log[currentDay][habit] = value;
    renderHabits();
    renderCharts();
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
    const pieCtx = document.getElementById("dailyPie");
    const lineCtx = document.getElementById("monthlyLine");

    if (pieChart) pieChart.destroy();
    if (lineChart) lineChart.destroy();

    const { done, notDone } = dailyStats();

    pieChart = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Done", "Not Done"],
        datasets: [{
          data: [done || 1, notDone || 1],
          backgroundColor: ["#00ff99", "#ff4d4d"]
        }]
      }
    });

    lineChart = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: DAYS }, (_, i) => i + 1),
        datasets: [{
          label: "Habits Completed",
          data: monthlyTrend().map(v => v || 0.2),
          borderColor: "#00e5ff",
          pointRadius: 5,
          tension: 0.3
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

});