console.log("Workout App started!");

// ============================================================
// 種目マスター
// ============================================================

const EXERCISES = [
  { exerciseId: "push-bench-press", name: "Bench Press", category: "Push", defaultWeight: 42.5, defaultReps: 8, defaultSets: 3, defaultRestTime: 180 },
  { exerciseId: "push-smith-incline-bench-press", name: "Smith Incline Bench Press", category: "Push", defaultWeight: null, defaultReps: 10, defaultSets: 3, defaultRestTime: 150 },
  { exerciseId: "push-ohp", name: "OHP", category: "Push", defaultWeight: 20, defaultReps: 10, defaultSets: 3, defaultRestTime: 120 },
  { exerciseId: "push-db-side-raise", name: "DB Side Raise", category: "Push", defaultWeight: 12, defaultReps: 15, defaultSets: 4, defaultRestTime: 90 },
  { exerciseId: "push-skull-crusher", name: "Skull Crusher", category: "Push", defaultWeight: 15, defaultReps: 12, defaultSets: 3, defaultRestTime: 90 },
  { exerciseId: "push-cable-pressdown", name: "Cable Pressdown", category: "Push", defaultWeight: 15, defaultReps: 12, defaultSets: 2, defaultRestTime: 90 },
  { exerciseId: "pull-pull-up", name: "Pull Up", category: "Pull", defaultWeight: null, defaultReps: 8, defaultSets: 3, defaultRestTime: 150 },
  { exerciseId: "pull-seated-cable-row", name: "Seated Cable Row", category: "Pull", defaultWeight: 30, defaultReps: 10, defaultSets: 3, defaultRestTime: 120 },
  { exerciseId: "pull-lat-pulldown", name: "Lat Pulldown", category: "Pull", defaultWeight: 30, defaultReps: 12, defaultSets: 3, defaultRestTime: 120 },
  { exerciseId: "pull-rear-delt-fly", name: "Rear Delt Fly", category: "Pull", defaultWeight: null, defaultReps: 15, defaultSets: 3, defaultRestTime: 90 },
  { exerciseId: "pull-ez-bar-curl", name: "EZ Bar Curl", category: "Pull", defaultWeight: 20.5, defaultReps: 10, defaultSets: 3, defaultRestTime: 90 },
  { exerciseId: "pull-incline-db-curl", name: "Incline DB Curl", category: "Pull", defaultWeight: 12, defaultReps: 12, defaultSets: 3, defaultRestTime: 90 },
  { exerciseId: "legs-barbell-squat", name: "Barbell Squat", category: "Legs", defaultWeight: 60, defaultReps: 8, defaultSets: 3, defaultRestTime: 180 },
  { exerciseId: "legs-rdl", name: "RDL", category: "Legs", defaultWeight: 40, defaultReps: 10, defaultSets: 3, defaultRestTime: 150 },
  { exerciseId: "legs-leg-press", name: "Leg Press", category: "Legs", defaultWeight: 70, defaultReps: 12, defaultSets: 3, defaultRestTime: 120 },
  { exerciseId: "legs-leg-curl", name: "Leg Curl", category: "Legs", defaultWeight: 45, defaultReps: 12, defaultSets: 3, defaultRestTime: 90 },
  { exerciseId: "legs-leg-extension", name: "Leg Extension", category: "Legs", defaultWeight: 35, defaultReps: 12, defaultSets: 3, defaultRestTime: 90 },
  { exerciseId: "legs-calf-raise", name: "Calf Raise", category: "Legs", defaultWeight: 40, defaultReps: 15, defaultSets: 4, defaultRestTime: 90 }
];

const EXERCISE_BY_ID = new Map(EXERCISES.map((exercise) => [exercise.exerciseId, exercise]));
const EXERCISE_BY_NAME = new Map(EXERCISES.map((exercise) => [exercise.name, exercise]));

// ============================================================
// 共通ユーティリティ・データ保存
// ============================================================

const STORAGE_KEYS = Object.freeze({
  workoutHistory: "workoutHistory",
  workoutSessions: "workoutSessions",
  bodyWeightHistory: "bodyWeightHistory"
});

function loadArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn(`Failed to load localStorage key: ${key}`, error);
    return [];
  }
}

function saveArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save localStorage key: ${key}`, error);
    return false;
  }
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createTimestamp() {
  const now = new Date();
  return {
    createdAt: now.toISOString(),
    date: now.toLocaleDateString()
  };
}

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function findExerciseForRecord(record) {
  return EXERCISE_BY_ID.get(record.exerciseId) || EXERCISE_BY_NAME.get(record.exercise);
}

function normalizeWorkoutRecord(record) {
  const exercise = findExerciseForRecord(record);

  return {
    ...record,
    recordId: record.recordId || createId("record"),
    exerciseId: record.exerciseId || exercise?.exerciseId || "",
    exercise: record.exercise || exercise?.name || "Unknown Exercise",
    sets: Array.isArray(record.sets)
      ? record.sets.map((set) => ({
          weight: toFiniteNumber(set.weight),
          reps: toFiniteNumber(set.reps)
        }))
      : record.sets,
    restTime: toFiniteNumber(record.restTime, 90),
    createdAt: record.createdAt || null,
    useAsNextDefault: record.useAsNextDefault === true
  };
}

function getWorkoutHistory() {
  return loadArray(STORAGE_KEYS.workoutHistory).map(normalizeWorkoutRecord);
}

function saveWorkoutHistory(history) {
  return saveArray(STORAGE_KEYS.workoutHistory, history);
}

function normalizeSessionRecord(session) {
  return {
    ...session,
    sessionId: session.sessionId || createId("session"),
    type: typeof session.type === "string" ? session.type : "",
    duration: toFiniteNumber(session.duration),
    createdAt: session.createdAt || null
  };
}

function getWorkoutSessions() {
  return loadArray(STORAGE_KEYS.workoutSessions).map(normalizeSessionRecord);
}

function saveWorkoutSessions(sessions) {
  return saveArray(STORAGE_KEYS.workoutSessions, sessions);
}

function getBodyWeightHistory() {
  return loadArray(STORAGE_KEYS.bodyWeightHistory).map((record) => ({
    ...record,
    weight: toFiniteNumber(record.weight),
    createdAt: record.createdAt || null
  }));
}

function saveBodyWeightHistory(history) {
  return saveArray(STORAGE_KEYS.bodyWeightHistory, history);
}

// ============================================================
// DOM参照・基本画面描画
// ============================================================

const workoutSection = document.getElementById("workoutSection");
const modal = document.getElementById("workoutModal");
const closeModalButton = document.getElementById("closeModal");
const modalExerciseName = document.getElementById("modalExerciseName");
const setsContainer = document.getElementById("setsContainer");
const addSetBtn = document.getElementById("addSetBtn");
const saveWorkoutBtn = document.getElementById("saveWorkoutBtn");
const useAsNextDefault = document.getElementById("useAsNextDefault");
const historyList = document.getElementById("historyList");
const restTimeInput = document.getElementById("restTimeInput");
const restTimerDisplay = document.getElementById("restTimerDisplay");
const startRestBtn = document.getElementById("startRestBtn");
const resetRestBtn = document.getElementById("resetRestBtn");
const currentWeight = document.getElementById("currentWeight");
const bodyWeightInput = document.getElementById("bodyWeightInput");
const saveWeightBtn = document.getElementById("saveWeightBtn");
const workoutTimerDisplay = document.getElementById("workoutTimerDisplay");
const workoutType = document.getElementById("workoutType");
const startWorkoutBtn = document.getElementById("startWorkoutBtn");
const finishWorkoutBtn = document.getElementById("finishWorkoutBtn");
const sessionHistoryList = document.getElementById("sessionHistoryList");
const weightChartCanvas = document.getElementById("weightChart");
const exerciseChartSelect = document.getElementById("exerciseChartSelect");
const exerciseChartCanvas = document.getElementById("exerciseChart");

let activeExerciseId = null;

function renderExerciseCards() {
  workoutSection.innerHTML = "";

  ["Push", "Pull", "Legs"].forEach((category) => {
    const card = document.createElement("div");
    card.className = "workout-card";

    const heading = document.createElement("h2");
    heading.textContent = category;
    card.appendChild(heading);

    EXERCISES.filter((exercise) => exercise.category === category).forEach((exercise) => {
      const row = document.createElement("div");
      row.className = "exercise";

      const name = document.createElement("span");
      name.textContent = exercise.name;

      const button = document.createElement("button");
      button.className = "start-btn";
      button.type = "button";
      button.dataset.exerciseId = exercise.exerciseId;
      button.textContent = "▶";

      row.append(name, button);
      card.appendChild(row);
    });

    workoutSection.appendChild(card);
  });
}

function addSet(weight = "", reps = "") {
  const setRow = document.createElement("div");
  setRow.className = "set-row";

  const setNumber = document.createElement("span");
  setNumber.className = "set-number";

  const weightWrapper = document.createElement("div");
  weightWrapper.className = "set-input";
  const weightInput = document.createElement("input");
  weightInput.className = "set-weight";
  weightInput.type = "number";
  weightInput.step = "0.5";
  weightInput.placeholder = "kg";
  weightInput.value = weight ?? "";
  weightWrapper.appendChild(weightInput);

  const repsWrapper = document.createElement("div");
  repsWrapper.className = "set-input";
  const repsInput = document.createElement("input");
  repsInput.className = "set-reps";
  repsInput.type = "number";
  repsInput.placeholder = "reps";
  repsInput.value = reps ?? "";
  repsWrapper.appendChild(repsInput);

  const removeButton = document.createElement("button");
  removeButton.className = "remove-set-btn";
  removeButton.type = "button";
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => {
    setRow.remove();
    updateSetNumbers();
  });

  setRow.append(setNumber, weightWrapper, repsWrapper, removeButton);
  setsContainer.appendChild(setRow);
  updateSetNumbers();
}

function updateSetNumbers() {
  setsContainer.querySelectorAll(".set-row").forEach((row, index) => {
    row.querySelector(".set-number").textContent = index + 1;
  });
}

// ============================================================
// 種目別休憩タイマー
// ============================================================

let restTimerInterval = null;
let restSecondsRemaining = 90;

function updateRestTimerDisplay() {
  const minutes = Math.floor(restSecondsRemaining / 60);
  const seconds = restSecondsRemaining % 60;
  restTimerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function setRestTimer(seconds) {
  clearInterval(restTimerInterval);
  restTimerInterval = null;
  restSecondsRemaining = toFiniteNumber(seconds, 90);
  restTimeInput.value = restSecondsRemaining;
  updateRestTimerDisplay();
}

startRestBtn.addEventListener("click", () => {
  clearInterval(restTimerInterval);
  restSecondsRemaining = toFiniteNumber(restTimeInput.value, 0);
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
  setRestTimer(restTimeInput.value);
});

// ============================================================
// Workout種目記録
// ============================================================

function openWorkoutModal(exerciseId) {
  const exercise = EXERCISE_BY_ID.get(exerciseId);
  if (!exercise) return;

  activeExerciseId = exercise.exerciseId;
  modalExerciseName.textContent = exercise.name;
  setsContainer.innerHTML = "";

  const lastDefaultWorkout = getWorkoutHistory()
    .slice()
    .reverse()
    .find((record) =>
      record.exerciseId === exercise.exerciseId &&
      record.useAsNextDefault === true &&
      Array.isArray(record.sets)
    );

  if (lastDefaultWorkout) {
    lastDefaultWorkout.sets.forEach((set) => addSet(set.weight, set.reps));
  } else {
    for (let index = 0; index < exercise.defaultSets; index++) {
      addSet(exercise.defaultWeight ?? "", exercise.defaultReps);
    }
  }

  setRestTimer(lastDefaultWorkout?.restTime ?? exercise.defaultRestTime);
  useAsNextDefault.checked = true;
  modal.classList.add("show");
}

workoutSection.addEventListener("click", (event) => {
  const button = event.target.closest(".start-btn");
  if (button) openWorkoutModal(button.dataset.exerciseId);
});

closeModalButton.addEventListener("click", () => {
  modal.classList.remove("show");
});

addSetBtn.addEventListener("click", () => addSet());

saveWorkoutBtn.addEventListener("click", () => {
  const exercise = EXERCISE_BY_ID.get(activeExerciseId);
  if (!exercise) return;

  const sets = Array.from(setsContainer.querySelectorAll(".set-row")).map((row) => ({
    weight: toFiniteNumber(row.querySelector(".set-weight").value),
    reps: toFiniteNumber(row.querySelector(".set-reps").value)
  }));

  const timestamp = createTimestamp();
  const workoutRecord = {
    recordId: createId("record"),
    exerciseId: exercise.exerciseId,
    exercise: exercise.name,
    sets,
    restTime: toFiniteNumber(restTimeInput.value, exercise.defaultRestTime),
    date: timestamp.date,
    createdAt: timestamp.createdAt,
    useAsNextDefault: useAsNextDefault.checked
  };

  const workoutHistory = getWorkoutHistory();
  workoutHistory.push(workoutRecord);

  if (!saveWorkoutHistory(workoutHistory)) {
    alert("Workoutを保存できませんでした。");
    return;
  }

  renderHistory();
  renderExerciseChart();
  alert("Workout saved!");
  modal.classList.remove("show");
});

function renderHistory() {
  const workoutHistory = getWorkoutHistory();
  historyList.innerHTML = "";

  workoutHistory.slice().reverse().forEach((record) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const exerciseName = document.createElement("strong");
    exerciseName.textContent = record.exercise;

    const setsElement = document.createElement("div");
    setsElement.className = "history-sets";

    if (Array.isArray(record.sets)) {
      record.sets.forEach((set, index) => {
        const setElement = document.createElement("div");
        setElement.textContent = `Set ${index + 1}： ${set.weight}kg × ${set.reps} reps`;
        setsElement.appendChild(setElement);
      });
    } else {
      setsElement.textContent = "旧形式のWorkout記録";
    }

    const dateElement = document.createElement("div");
    dateElement.className = "history-date";
    dateElement.textContent = record.date || "";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-history-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const updatedHistory = workoutHistory.filter(
        (item) => item.recordId !== record.recordId
      );
      saveWorkoutHistory(updatedHistory);
      renderHistory();
      renderExerciseChart();
    });

    historyItem.append(exerciseName, setsElement, dateElement, deleteButton);
    historyList.appendChild(historyItem);
  });
}

// ============================================================
// Workout全体タイマー・Session履歴
// ============================================================

let workoutTimerInterval = null;
let workoutSeconds = 0;
let workoutRunning = false;

function formatWorkoutDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;
}

function updateWorkoutTimerDisplay() {
  workoutTimerDisplay.textContent = formatWorkoutDuration(workoutSeconds);
}

startWorkoutBtn.addEventListener("click", () => {
  if (workoutRunning) return;

  workoutRunning = true;
  workoutTimerInterval = setInterval(() => {
    workoutSeconds++;
    updateWorkoutTimerDisplay();
  }, 1000);
});

finishWorkoutBtn.addEventListener("click", () => {
  if (!workoutRunning) return;

  clearInterval(workoutTimerInterval);
  workoutTimerInterval = null;
  workoutRunning = false;

  const timestamp = createTimestamp();
  const sessionRecord = {
    sessionId: createId("session"),
    type: workoutType.value,
    duration: workoutSeconds,
    date: timestamp.date,
    createdAt: timestamp.createdAt
  };

  const workoutSessions = getWorkoutSessions();
  workoutSessions.push(sessionRecord);

  if (!saveWorkoutSessions(workoutSessions)) {
    alert("Workout Sessionを保存できませんでした。");
    return;
  }

  renderSessionHistory();
  alert(`${workoutType.value} workout saved!\nTime: ${workoutTimerDisplay.textContent}`);
  workoutSeconds = 0;
  updateWorkoutTimerDisplay();
});

function renderSessionHistory() {
  const workoutSessions = getWorkoutSessions();
  sessionHistoryList.innerHTML = "";

  if (workoutSessions.length === 0) {
    sessionHistoryList.textContent = "No workout sessions yet.";
    return;
  }

  workoutSessions.slice().reverse().forEach((session) => {
    const sessionItem = document.createElement("div");
    sessionItem.className = "session-history-item";

    const type = document.createElement("strong");
    type.textContent = session.type;
    const duration = document.createElement("div");
    duration.textContent = formatWorkoutDuration(session.duration);
    const date = document.createElement("div");
    date.textContent = session.date || "";

    sessionItem.append(type, duration, date);
    sessionHistoryList.appendChild(sessionItem);
  });
}

// ============================================================
// 体重記録
// ============================================================

function loadCurrentWeight() {
  const weightHistory = getBodyWeightHistory();
  if (weightHistory.length > 0) {
    currentWeight.textContent = weightHistory[weightHistory.length - 1].weight;
  }
}

saveWeightBtn.addEventListener("click", () => {
  if (bodyWeightInput.value === "") {
    alert("体重を入力してください");
    return;
  }

  const timestamp = createTimestamp();
  const weightRecord = {
    weight: toFiniteNumber(bodyWeightInput.value),
    date: timestamp.date,
    createdAt: timestamp.createdAt
  };

  const weightHistory = getBodyWeightHistory();
  weightHistory.push(weightRecord);

  if (!saveBodyWeightHistory(weightHistory)) {
    alert("体重を保存できませんでした。");
    return;
  }

  currentWeight.textContent = weightRecord.weight;
  bodyWeightInput.value = "";
  renderWeightChart();
  alert("体重を記録しました！");
});

// ============================================================
// グラフ
// ============================================================

let weightChart = null;
let exerciseChart = null;

function canRenderCharts() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js is not available.");
    return false;
  }
  return true;
}

function renderWeightChart() {
  if (!canRenderCharts()) return;

  const weightHistory = getBodyWeightHistory();
  if (weightChart) weightChart.destroy();

  weightChart = new Chart(weightChartCanvas, {
    type: "line",
    data: {
      labels: weightHistory.map((record) => record.date),
      datasets: [{
        label: "Body Weight (kg)",
        data: weightHistory.map((record) => record.weight),
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: false } }
    }
  });
}

function populateExerciseChartSelect() {
  exerciseChartSelect.innerHTML = "";
  EXERCISES.forEach((exercise) => {
    const option = document.createElement("option");
    option.value = exercise.exerciseId;
    option.textContent = exercise.name;
    exerciseChartSelect.appendChild(option);
  });
  exerciseChartSelect.value = "push-bench-press";
}

function renderExerciseChart() {
  if (!canRenderCharts()) return;

  const selectedExerciseId = exerciseChartSelect.value;
  const exerciseHistory = getWorkoutHistory().filter((record) =>
    record.exerciseId === selectedExerciseId && Array.isArray(record.sets)
  );
  const labels = [];
  const weights = [];
  const estimated1RMs = [];

  exerciseHistory.forEach((record) => {
    const validSets = record.sets.filter((set) =>
      Number.isFinite(set.weight) && Number.isFinite(set.reps) &&
      set.weight > 0 && set.reps > 0
    );
    if (validSets.length === 0) return;

    labels.push(record.date);
    weights.push(Math.max(...validSets.map((set) => set.weight)));
    estimated1RMs.push(Number(Math.max(
      ...validSets.map((set) => set.weight * (1 + set.reps / 30))
    ).toFixed(1)));
  });

  if (exerciseChart) exerciseChart.destroy();

  exerciseChart = new Chart(exerciseChartCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Max Weight (kg)", data: weights, tension: 0.3 },
        { label: "Estimated 1RM (kg)", data: estimated1RMs, tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: false } }
    }
  });
}

exerciseChartSelect.addEventListener("change", renderExerciseChart);

// ============================================================
// 初期化
// ============================================================

function initializeApp() {
  renderExerciseCards();
  populateExerciseChartSelect();
  renderHistory();
  renderSessionHistory();
  loadCurrentWeight();
  renderWeightChart();
  renderExerciseChart();
  updateWorkoutTimerDisplay();
  updateRestTimerDisplay();
}

initializeApp();
