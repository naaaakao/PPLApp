console.log("Workout App started!");

const startButtons = document.querySelectorAll(".start-btn");

console.log("JS loaded");
console.log(startButtons);

const modal = document.getElementById("workoutModal");
const closeModalButton = document.getElementById("closeModal");
const modalExerciseName = document.getElementById("modalExerciseName");


  const exerciseDefaults = {

    // PUSH
    "Bench Press": {
      weight: 42.5,
      reps: 8,
      sets: 3,
      rest: 180
    },
  
    "Smith Incline Bench Press": {
      weight: "",
      reps: 10,
      sets: 3,
      rest: 150
    },
  
    "OHP": {
      weight: 20,
      reps: 10,
      sets: 3,
      rest: 120
    },
  
    "DB Side Raise": {
      weight: 12,
      reps: 15,
      sets: 4,
      rest: 90
    },
  
    "Skull Crusher": {
      weight: 15,
      reps: 12,
      sets: 3,
      rest: 90
    },
  
    "Cable Pressdown": {
      weight: 15,
      reps: 12,
      sets: 2,
      rest: 90
    },
  
    // PULL
    "Pull Up": {
      weight: "",
      reps: 8,
      sets: 3,
      rest: 150
    },
  
    "Seated Cable Row": {
      weight: 30,
      reps: 10,
      sets: 3,
      rest: 120
    },
  
    "Lat Pulldown": {
      weight: 30,
      reps: 12,
      sets: 3,
      rest: 120
    },
  
    "Rear Delt Fly": {
      weight: "",
      reps: 15,
      sets: 3,
      rest: 90
    },
  
    "EZ Bar Curl": {
      weight: 20.5,
      reps: 10,
      sets: 3,
      rest: 90
    },
  
    "Incline DB Curl": {
      weight: 12,
      reps: 12,
      sets: 3,
      rest: 90
    },
  
    // LEGS
    "Barbell Squat": {
      weight: 60,
      reps: 8,
      sets: 3,
      rest: 180
    },
  
    "RDL": {
      weight: 40,
      reps: 10,
      sets: 3,
      rest: 150
    },
  
    "Leg Press": {
      weight: 70,
      reps: 12,
      sets: 3,
      rest: 120
    },
  
    "Leg Curl": {
      weight: 45,
      reps: 12,
      sets: 3,
      rest: 90
    },
  
    "Leg Extension": {
      weight: 35,
      reps: 12,
      sets: 3,
      rest: 90
    },
  
    "Calf Raise": {
      weight: 40,
      reps: 15,
      sets: 4,
      rest: 90
    }
  
  };

startButtons.forEach((button) => {

    button.addEventListener("click", () => {
  
      console.log("BUTTON CLICKED");
  
      const exerciseName =
        button.parentElement.querySelector("span").textContent;
  
      modalExerciseName.textContent = exerciseName;

      setsContainer.innerHTML = "";

const workoutHistory =
  JSON.parse(localStorage.getItem("workoutHistory")) || [];

const lastDefaultWorkout = workoutHistory
  .slice()
  .reverse()
  .find((record) =>
    record.exercise === exerciseName &&
    record.useAsNextDefault === true &&
    Array.isArray(record.sets)
  );

const defaults = exerciseDefaults[exerciseName];

if (lastDefaultWorkout) {

  lastDefaultWorkout.sets.forEach((set) => {
    addSet(set.weight, set.reps);
  });

} else if (defaults) {

  for (let i = 0; i < defaults.sets; i++) {
    addSet(defaults.weight, defaults.reps);
  }

} else {

  addSet();
  addSet();
  addSet();

}

if (
  lastDefaultWorkout &&
  lastDefaultWorkout.restTime
) {

  setRestTimer(lastDefaultWorkout.restTime);

} else if (defaults) {

  setRestTimer(defaults.rest);

}

document.getElementById("useAsNextDefault").checked = true;

modal.classList.add("show");
  
    });
  
  });

closeModalButton.addEventListener("click", () => {
  modal.classList.remove("show");
});

const setsContainer = document.getElementById("setsContainer");
const addSetBtn = document.getElementById("addSetBtn");
const saveWorkoutBtn = document.getElementById("saveWorkoutBtn");
const restTimeInput =
  document.getElementById("restTimeInput");

const restTimerDisplay =
  document.getElementById("restTimerDisplay");

const startRestBtn =
  document.getElementById("startRestBtn");

const resetRestBtn =
  document.getElementById("resetRestBtn");

let restTimerInterval = null;
let restSecondsRemaining = 90;

function updateRestTimerDisplay() {

  const minutes =
    Math.floor(restSecondsRemaining / 60);

  const seconds =
    restSecondsRemaining % 60;

  restTimerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


function setRestTimer(seconds) {

  clearInterval(restTimerInterval);

  restSecondsRemaining = Number(seconds);

  restTimeInput.value = seconds;

  updateRestTimerDisplay();
}


startRestBtn.addEventListener("click", () => {

  clearInterval(restTimerInterval);

  restSecondsRemaining =
    Number(restTimeInput.value);

  updateRestTimerDisplay();

  restTimerInterval = setInterval(() => {

    restSecondsRemaining--;

    updateRestTimerDisplay();

    if (restSecondsRemaining <= 0) {

      clearInterval(restTimerInterval);

      restTimerInterval = null;

      alert("休憩終了！");

    }

  }, 1000);

});


resetRestBtn.addEventListener("click", () => {

  clearInterval(restTimerInterval);

  restTimerInterval = null;

  setRestTimer(restTimeInput.value);

});


function addSet(weight = "", reps = "") {

  const setNumber = setsContainer.children.length + 1;

  const setRow = document.createElement("div");
  setRow.className = "set-row";

  setRow.innerHTML = `
    <span class="set-number">${setNumber}</span>

    <div class="set-input">
      <input
        class="set-weight"
        type="number"
        step="0.5"
        value="${weight}"
        placeholder="kg"
      >
    </div>

    <div class="set-input">
      <input
        class="set-reps"
        type="number"
        value="${reps}"
        placeholder="reps"
      >
    </div>

    <button class="remove-set-btn">×</button>
  `;

  const removeButton =
    setRow.querySelector(".remove-set-btn");

  removeButton.addEventListener("click", () => {
    setRow.remove();
    updateSetNumbers();
  });

  setsContainer.appendChild(setRow);
}

function updateSetNumbers() {

  const setRows =
    setsContainer.querySelectorAll(".set-row");

  setRows.forEach((row, index) => {
    row.querySelector(".set-number").textContent =
      index + 1;
  });

}

addSetBtn.addEventListener("click", () => {
  addSet();
});

saveWorkoutBtn.addEventListener("click", () => {

  const exercise = modalExerciseName.textContent;

  const setRows =
    setsContainer.querySelectorAll(".set-row");

  const sets = [];

  setRows.forEach((row) => {

    const weight =
      row.querySelector(".set-weight").value;

    const reps =
      row.querySelector(".set-reps").value;

    sets.push({
      weight: weight,
      reps: reps
    });

  });

  const useAsNextDefault =
    document.getElementById("useAsNextDefault");

    const workoutRecord = {
      exercise: exercise,
      sets: sets,
      restTime: Number(restTimeInput.value),
      date: new Date().toLocaleDateString(),
      useAsNextDefault: useAsNextDefault.checked
    };

  const workoutHistory =
    JSON.parse(localStorage.getItem("workoutHistory")) || [];

  workoutHistory.push(workoutRecord);

  localStorage.setItem(
    "workoutHistory",
    JSON.stringify(workoutHistory)
  );

  renderHistory();

  renderExerciseChart();

  alert("Workout saved!");

  modal.classList.remove("show");

});

const historyList = document.getElementById("historyList");

function renderHistory() {

  const workoutHistory =
    JSON.parse(localStorage.getItem("workoutHistory")) || [];

  historyList.innerHTML = "";

  workoutHistory
  .slice()
  .reverse()
  .forEach((record, index) => {

    const historyItem = document.createElement("div");

    historyItem.className = "history-item";

    let setsHtml = "";

    if (Array.isArray(record.sets)) {
    
      setsHtml = record.sets
        .map((set, index) => {
          return `
            <div>
              Set ${index + 1}：
              ${set.weight}kg × ${set.reps} reps
            </div>
          `;
        })
        .join("");
    
    } else {
    
      setsHtml = `
        <div>
          旧形式のWorkout記録
        </div>
      `;
    
    }

historyItem.innerHTML = `
  <strong>${record.exercise}</strong>

  <div class="history-sets">
    ${setsHtml}
  </div>

  <div class="history-date">
    ${record.date}
  </div>

  <button class="delete-history-btn">
    Delete
  </button>
`;

    const deleteButton =
      historyItem.querySelector(".delete-history-btn");

    deleteButton.addEventListener("click", () => {

      const originalIndex =
        workoutHistory.length - 1 - index;

      workoutHistory.splice(originalIndex, 1);

      localStorage.setItem(
        "workoutHistory",
        JSON.stringify(workoutHistory)
      );

      renderHistory();

    });

    historyList.appendChild(historyItem);

  });

}

renderHistory();

const currentWeight =
  document.getElementById("currentWeight");

const bodyWeightInput =
  document.getElementById("bodyWeightInput");

const saveWeightBtn =
  document.getElementById("saveWeightBtn");


function loadCurrentWeight() {

  const weightHistory =
    JSON.parse(localStorage.getItem("bodyWeightHistory")) || [];

  if (weightHistory.length === 0) {
    return;
  }

  const latestWeight =
    weightHistory[weightHistory.length - 1];

  currentWeight.textContent =
    latestWeight.weight;
}


saveWeightBtn.addEventListener("click", () => {

  const weight =
    bodyWeightInput.value;

  if (weight === "") {
    alert("体重を入力してください");
    return;
  }

  const weightHistory =
    JSON.parse(localStorage.getItem("bodyWeightHistory")) || [];

  const weightRecord = {
    weight: Number(weight),
    date: new Date().toLocaleDateString()
  };

  weightHistory.push(weightRecord);

  localStorage.setItem(
    "bodyWeightHistory",
    JSON.stringify(weightHistory)
  );

  currentWeight.textContent = weight;

bodyWeightInput.value = "";

renderWeightChart();

alert("体重を記録しました！");
});


loadCurrentWeight();

const workoutTimerDisplay =
  document.getElementById("workoutTimerDisplay");

const workoutType =
  document.getElementById("workoutType");  

const startWorkoutBtn =
  document.getElementById("startWorkoutBtn");

const finishWorkoutBtn =
  document.getElementById("finishWorkoutBtn");

let workoutTimerInterval = null;
let workoutSeconds = 0;
let workoutRunning = false;

function updateWorkoutTimerDisplay() {

  const hours =
    Math.floor(workoutSeconds / 3600);

  const minutes =
    Math.floor((workoutSeconds % 3600) / 60);

  const seconds =
    workoutSeconds % 60;

  workoutTimerDisplay.textContent =
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;
}

startWorkoutBtn.addEventListener("click", () => {

  if (workoutRunning) {
    return;
  }

  workoutRunning = true;

  workoutTimerInterval = setInterval(() => {

    workoutSeconds++;

    updateWorkoutTimerDisplay();

  }, 1000);

});

finishWorkoutBtn.addEventListener("click", () => {

  if (!workoutRunning) {
    return;
  }

  clearInterval(workoutTimerInterval);

  workoutTimerInterval = null;
  workoutRunning = false;

  const workoutSessions =
    JSON.parse(localStorage.getItem("workoutSessions")) || [];

  const sessionRecord = {
    type: workoutType.value,
    duration: workoutSeconds,
    date: new Date().toLocaleDateString()
  };

  workoutSessions.push(sessionRecord);

  localStorage.setItem(
    "workoutSessions",
    JSON.stringify(workoutSessions)
  );

  renderSessionHistory();

  alert(
    `${workoutType.value} workout saved!\n` +
    `Time: ${workoutTimerDisplay.textContent}`
  );

  workoutSeconds = 0;

  updateWorkoutTimerDisplay();

});


const sessionHistoryList =
  document.getElementById("sessionHistoryList");


function formatWorkoutDuration(totalSeconds) {

  const hours =
    Math.floor(totalSeconds / 3600);

  const minutes =
    Math.floor((totalSeconds % 3600) / 60);

  const seconds =
    totalSeconds % 60;

  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`
  );
}


function renderSessionHistory() {

  const workoutSessionHistory =
  JSON.parse(
    localStorage.getItem("workoutSessions")
  ) || [];

  sessionHistoryList.innerHTML = "";

  if (workoutSessionHistory.length === 0) {

    sessionHistoryList.textContent =
      "No workout sessions yet.";

    return;
  }

  workoutSessionHistory
    .slice()
    .reverse()
    .forEach((session) => {

      const sessionItem =
        document.createElement("div");

      sessionItem.className =
        "session-history-item";

      sessionItem.innerHTML = `
        <strong>${session.type}</strong>

        <div>
          ${formatWorkoutDuration(session.duration)}
        </div>

        <div>
          ${session.date}
        </div>
      `;

      sessionHistoryList.appendChild(
        sessionItem
      );

    });

}


renderSessionHistory();

const weightChartCanvas =
  document.getElementById("weightChart");

let weightChart = null;


function renderWeightChart() {

  const weightHistory =
    JSON.parse(
      localStorage.getItem("bodyWeightHistory")
    ) || [];

  const labels =
    weightHistory.map((record) => record.date);

  const weights =
    weightHistory.map((record) => record.weight);


  if (weightChart) {
    weightChart.destroy();
  }


  weightChart = new Chart(
    weightChartCanvas,
    {
      type: "line",

      data: {
        labels: labels,

        datasets: [
          {
            label: "Body Weight (kg)",
            data: weights,
            tension: 0.3
          }
        ]
      },

      options: {
        responsive: true,

        plugins: {
          legend: {
            display: true
          }
        },

        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    }
  );

}


renderWeightChart();

const exerciseChartSelect =
  document.getElementById("exerciseChartSelect");

const exerciseChartCanvas =
  document.getElementById("exerciseChart");

let exerciseChart = null;


// 種目一覧を自動で追加
Object.keys(exerciseDefaults).forEach((exercise) => {

  const option =
    document.createElement("option");

  option.value = exercise;
  option.textContent = exercise;

  exerciseChartSelect.appendChild(option);

});


// 最初はBench Press
exerciseChartSelect.value = "Bench Press";


function renderExerciseChart() {

  const selectedExercise =
    exerciseChartSelect.value;

  const workoutHistory =
    JSON.parse(
      localStorage.getItem("workoutHistory")
    ) || [];


  const exerciseHistory =
    workoutHistory.filter((record) =>
      record.exercise === selectedExercise &&
      Array.isArray(record.sets)
    );


    const labels = [];

    const weights = [];
    
    const estimated1RMs = [];


    exerciseHistory.forEach((record) => {

      const validSets =
        record.sets
          .map((set) => {
            return {
              weight: Number(set.weight),
              reps: Number(set.reps)
            };
          })
          .filter((set) =>
            !Number.isNaN(set.weight) &&
            !Number.isNaN(set.reps) &&
            set.weight > 0 &&
            set.reps > 0
          );
    
    
      if (validSets.length === 0) {
        return;
      }
    
    
      const maxWeight =
        Math.max(
          ...validSets.map((set) => set.weight)
        );
    
    
      const setEstimated1RMs =
        validSets.map((set) => {
    
          return (
            set.weight *
            (1 + set.reps / 30)
          );
    
        });
    
    
      const maxEstimated1RM =
        Math.max(...setEstimated1RMs);
    
    
      labels.push(record.date);
    
      weights.push(maxWeight);
    
      estimated1RMs.push(
        Number(maxEstimated1RM.toFixed(1))
      );
    
    });


  if (exerciseChart) {
    exerciseChart.destroy();
  }


  exerciseChart = new Chart(
    exerciseChartCanvas,
    {
      type: "line",

      data: {
        labels: labels,

        datasets: [
          {
            label: "Max Weight (kg)",
            data: weights,
            tension: 0.3
          },
        
          {
            label: "Estimated 1RM (kg)",
            data: estimated1RMs,
            tension: 0.3
          }
        ]
      },

      options: {
        responsive: true,

        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    }
  );

}


exerciseChartSelect.addEventListener(
  "change",
  renderExerciseChart
);


renderExerciseChart();