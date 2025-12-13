let habits = [];

const habitInput = document.getElementById("habitInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitGrid = document.getElementById("habitGrid");

// Chart setup
const ctx = document.getElementById("habitChart");
const habitChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Done", "Not Done"],
    datasets: [{
      data: [0, 0],
      backgroundColor: ["#22c55e", "#ef4444"]
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: { color: "white" }
      }
    }
  }
});

function updateChart() {
  const doneCount = habits.filter(h => h.done).length;
  habitChart.data.datasets[0].data = [
    doneCount,
    habits.length - doneCount
  ];
  habitChart.update();
}

function addHabit() {
  const name = habitInput.value.trim();
  if (!name) return;

  const habit = { name, done: false };
  habits.push(habit);

  const card = document.createElement("div");
  card.className = "habit-card";

  const title = document.createElement("p");
  title.textContent = name;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", () => {
    habit.done = checkbox.checked;
    updateChart();
  });

  card.appendChild(title);
  card.appendChild(checkbox);
  habitGrid.appendChild(card);

  habitInput.value = "";
  updateChart();
}

addHabitBtn.addEventListener("click", addHabit);

// Service Worker (for install support)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

