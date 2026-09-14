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

// ============================================================
// 共通ユーティリティ・データ保存
// ============================================================

const STORAGE_KEYS = Object.freeze({
  workoutSessions: "workoutSessions",
  activeWorkoutSession: "activeWorkoutSession",
  bodyWeightHistory: "bodyWeightHistory"
});

function loadJson(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue === null ? fallback : JSON.parse(storedValue);
  } catch (error) {
    console.warn(`Failed to load localStorage key: ${key}`, error);
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save localStorage key: ${key}`, error);
    return false;
  }
}

function removeStoredValue(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove localStorage key: ${key}`, error);
    return false;
  }
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeExerciseRecord(record) {
  return {
    recordId: typeof record?.recordId === "string" ? record.recordId : createId("record"),
    exerciseId: typeof record?.exerciseId === "string" ? record.exerciseId : "",
    exercise: typeof record?.exercise === "string" ? record.exercise : "Unknown Exercise",
    sets: Array.isArray(record?.sets)
      ? record.sets.map((set) => ({
          weight: toFiniteNumber(set.weight),
          reps: toFiniteNumber(set.reps)
        }))
      : [],
    restTime: toFiniteNumber(record?.restTime, 90),
    useAsNextDefault: record?.useAsNextDefault === true,
    createdAt: typeof record?.createdAt === "string" ? record.createdAt : new Date().toISOString()
  };
}

function normalizeSession(session) {
  return {
    sessionId: typeof session?.sessionId === "string" ? session.sessionId : createId("session"),
    type: typeof session?.type === "string" ? session.type : "",
    startedAt: typeof session?.startedAt === "string" ? session.startedAt : "",
    finishedAt: typeof session?.finishedAt === "string" ? session.finishedAt : null,
    duration: toFiniteNumber(session?.duration),
    date: typeof session?.date === "string" ? session.date : "",
    exercises: Array.isArray(session?.exercises)
      ? session.exercises.map(normalizeExerciseRecord)
      : []
  };
}

function getWorkoutSessions() {
  const sessions = loadJson(STORAGE_KEYS.workoutSessions, []);
  return Array.isArray(sessions) ? sessions.map(normalizeSession) : [];
}

function saveWorkoutSessions(sessions) {
  return saveJson(STORAGE_KEYS.workoutSessions, sessions);
}

function getActiveWorkoutSession() {
  const session = loadJson(STORAGE_KEYS.activeWorkoutSession, null);
  if (!session || typeof session !== "object" || Array.isArray(session)) return null;

  const normalizedSession = normalizeSession(session);
  return normalizedSession.startedAt ? normalizedSession : null;
}

function saveActiveWorkoutSession(session) {
  return saveJson(STORAGE_KEYS.activeWorkoutSession, session);
}

function clearActiveWorkoutSession() {
  return removeStoredValue(STORAGE_KEYS.activeWorkoutSession);
}

function getBodyWeightHistory() {
  const history = loadJson(STORAGE_KEYS.bodyWeightHistory, []);
  if (!Array.isArray(history)) return [];

  return history.map((record) => ({
    weight: toFiniteNumber(record?.weight),
    date: typeof record?.date === "string" ? record.date : "",
    createdAt: typeof record?.createdAt === "string" ? record.createdAt : null
  }));
}

function saveBodyWeightHistory(history) {
  return saveJson(STORAGE_KEYS.bodyWeightHistory, history);
}

// ============================================================
// DOM参照・画面生成
// ============================================================

const workoutSection = document.getElementById("workoutSection");
const modal = document.getElementById("workoutModal");
const closeModalButton = document.getElementById("closeModal");
const modalExerciseName = document.getElementById("modalExerciseName");
const setsContainer = document.getElementById("setsContainer");
const addSetBtn = document.getElementById("addSetBtn");
const saveWorkoutBtn = document.getElementById("saveWorkoutBtn");
const useAsNextDefault = document.getElementById("useAsNextDefault");
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
const activeWorkoutTitle = document.getElementById("activeWorkoutTitle");
const activeWorkoutTime = document.getElementById("activeWorkoutTime");
const activeWorkoutExerciseCount = document.getElementById("activeWorkoutExerciseCount");
const appPages = document.querySelectorAll(".app-page");
const navigationButtons = document.querySelectorAll(".nav-button");

let activeExerciseId = null;
let currentPage = "workout";

function showPage(pageName) {
  currentPage = pageName;

  appPages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageName);
  });

  navigationButtons.forEach((button) => {
    const isActive = button.dataset.pageTarget === pageName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  if (pageName === "progress") {
    requestAnimationFrame(() => {
      refreshProgressCharts();
    });
  }
}

navigationButtons.forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.pageTarget));
});

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
  restSecondsRemaining = Math.max(0, toFiniteNumber(seconds, 90));
  restTimeInput.value = restSecondsRemaining;
  updateRestTimerDisplay();
}

startRestBtn.addEventListener("click", () => {
  clearInterval(restTimerInterval);
  restSecondsRemaining = Math.max(0, toFiniteNumber(restTimeInput.value));
  updateRestTimerDisplay();

  if (restSecondsRemaining === 0) return;

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

resetRestBtn.addEventListener("click", () => setRestTimer(restTimeInput.value));

// ============================================================
// Workout種目記録
// ============================================================

function findLatestDefaultExerciseRecord(exerciseId) {
  const records = getWorkoutSessions()
    .flatMap((session) => session.exercises)
    .filter((record) =>
      record.exerciseId === exerciseId && record.useAsNextDefault === true
    );

  const activeRecord = getActiveWorkoutSession()?.exercises.find((record) =>
    record.exerciseId === exerciseId && record.useAsNextDefault === true
  );
  if (activeRecord) records.push(activeRecord);

  return records.sort((left, right) =>
    Date.parse(right.createdAt) - Date.parse(left.createdAt)
  )[0] || null;
}

function openWorkoutModal(exerciseId) {
  const exercise = EXERCISE_BY_ID.get(exerciseId);
  if (!exercise) return;

  activeExerciseId = exercise.exerciseId;
  modalExerciseName.textContent = exercise.name;
  setsContainer.innerHTML = "";

  const activeRecord = getActiveWorkoutSession()?.exercises.find(
    (record) => record.exerciseId === exercise.exerciseId
  );
  const defaultRecord = activeRecord || findLatestDefaultExerciseRecord(exercise.exerciseId);

  if (defaultRecord) {
    defaultRecord.sets.forEach((set) => addSet(set.weight, set.reps));
  } else {
    for (let index = 0; index < exercise.defaultSets; index++) {
      addSet(exercise.defaultWeight ?? "", exercise.defaultReps);
    }
  }

  setRestTimer(defaultRecord?.restTime ?? exercise.defaultRestTime);
  useAsNextDefault.checked = activeRecord?.useAsNextDefault ?? true;
  modal.classList.add("show");
}

workoutSection.addEventListener("click", (event) => {
  const button = event.target.closest(".start-btn");
  if (button) openWorkoutModal(button.dataset.exerciseId);
});

closeModalButton.addEventListener("click", () => modal.classList.remove("show"));
addSetBtn.addEventListener("click", () => addSet());

saveWorkoutBtn.addEventListener("click", () => {
  const activeSession = getActiveWorkoutSession();
  if (!activeSession) {
    alert("先にWorkoutを開始してください。");
    return;
  }

  const exercise = EXERCISE_BY_ID.get(activeExerciseId);
  if (!exercise) return;

  const existingIndex = activeSession.exercises.findIndex(
    (record) => record.exerciseId === exercise.exerciseId
  );
  const existingRecord = activeSession.exercises[existingIndex];
  const sets = Array.from(setsContainer.querySelectorAll(".set-row")).map((row) => ({
    weight: toFiniteNumber(row.querySelector(".set-weight").value),
    reps: toFiniteNumber(row.querySelector(".set-reps").value)
  }));

  const exerciseRecord = {
    recordId: existingRecord?.recordId || createId("record"),
    exerciseId: exercise.exerciseId,
    exercise: exercise.name,
    sets,
    restTime: toFiniteNumber(restTimeInput.value, exercise.defaultRestTime),
    useAsNextDefault: useAsNextDefault.checked,
    createdAt: existingRecord?.createdAt || new Date().toISOString()
  };

  if (existingIndex >= 0) {
    activeSession.exercises[existingIndex] = exerciseRecord;
  } else {
    activeSession.exercises.push(exerciseRecord);
  }

  if (!saveActiveWorkoutSession(activeSession)) {
    alert("Workoutを保存できませんでした。");
    return;
  }

  activeWorkoutSession = activeSession;
  updateWorkoutTimerDisplay();
  alert("Workout saved!");
  modal.classList.remove("show");
});

// ============================================================
// Workout全体タイマー・Session管理
// ============================================================

let workoutTimerInterval = null;
let activeWorkoutSession = null;

function formatWorkoutDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(toFiniteNumber(totalSeconds)));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;
}

function getActiveWorkoutDuration() {
  if (!activeWorkoutSession) return 0;
  const startedAtMs = Date.parse(activeWorkoutSession.startedAt);
  if (!Number.isFinite(startedAtMs)) return 0;
  return Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
}

function updateWorkoutTimerDisplay() {
  const formattedDuration = formatWorkoutDuration(getActiveWorkoutDuration());
  workoutTimerDisplay.textContent = formattedDuration;
  activeWorkoutTime.textContent = formattedDuration;

  if (activeWorkoutSession) {
    const exerciseCount = activeWorkoutSession.exercises.length;
    activeWorkoutTitle.textContent = `${activeWorkoutSession.type} Workout`;
    activeWorkoutExerciseCount.textContent =
      `${exerciseCount} ${exerciseCount === 1 ? "exercise" : "exercises"} recorded`;
  } else {
    activeWorkoutTitle.textContent = "No active workout";
    activeWorkoutExerciseCount.textContent = "0 exercises recorded";
  }
}

function startWorkoutTimer() {
  clearInterval(workoutTimerInterval);
  updateWorkoutTimerDisplay();
  workoutTimerInterval = setInterval(updateWorkoutTimerDisplay, 1000);
}

function stopWorkoutTimer() {
  clearInterval(workoutTimerInterval);
  workoutTimerInterval = null;
}

startWorkoutBtn.addEventListener("click", () => {
  if (activeWorkoutSession) return;

  if (!workoutType.value) {
    alert("Workout Typeを選択してからWorkoutを開始してください。");
    return;
  }

  activeWorkoutSession = {
    sessionId: createId("session"),
    type: workoutType.value,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    duration: 0,
    date: "",
    exercises: []
  };

  if (!saveActiveWorkoutSession(activeWorkoutSession)) {
    activeWorkoutSession = null;
    alert("Workoutを開始できませんでした。");
    return;
  }

  startWorkoutTimer();
});

finishWorkoutBtn.addEventListener("click", () => {
  activeWorkoutSession = getActiveWorkoutSession();
  if (!activeWorkoutSession) {
    alert("進行中のWorkoutはありません。");
    return;
  }

  if (activeWorkoutSession.exercises.length === 0) {
    alert("種目が記録されていないため、Workoutを終了できません。");
    return;
  }

  const finishedAt = new Date();
  const startedAtMs = Date.parse(activeWorkoutSession.startedAt);
  activeWorkoutSession.finishedAt = finishedAt.toISOString();
  activeWorkoutSession.duration = Math.max(
    0,
    Math.floor((finishedAt.getTime() - startedAtMs) / 1000)
  );
  activeWorkoutSession.date = finishedAt.toLocaleDateString();

  const workoutSessions = getWorkoutSessions();
  workoutSessions.push(activeWorkoutSession);

  if (!saveWorkoutSessions(workoutSessions)) {
    alert("Workout Sessionを保存できませんでした。");
    return;
  }

  if (!clearActiveWorkoutSession()) {
    workoutSessions.pop();
    saveWorkoutSessions(workoutSessions);
    alert("Workout Sessionを終了できませんでした。");
    return;
  }

  const completedSession = activeWorkoutSession;
  activeWorkoutSession = null;
  stopWorkoutTimer();
  updateWorkoutTimerDisplay();
  renderSessionHistory();
  markExerciseChartForUpdate();
  alert(`${completedSession.type} workout saved!\nTime: ${formatWorkoutDuration(completedSession.duration)}`);
});

function restoreActiveWorkout() {
  activeWorkoutSession = getActiveWorkoutSession();
  if (!activeWorkoutSession) {
    updateWorkoutTimerDisplay();
    return;
  }

  workoutType.value = activeWorkoutSession.type;
  startWorkoutTimer();
}

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

    const heading = document.createElement("strong");
    heading.textContent = `${session.date} - ${session.type}`;

    const duration = document.createElement("div");
    duration.textContent = `Time: ${formatWorkoutDuration(session.duration)}`;

    const exerciseCount = document.createElement("div");
    exerciseCount.textContent =
      `${session.exercises.length} ${session.exercises.length === 1 ? "exercise" : "exercises"}`;

    const exercises = document.createElement("div");
    session.exercises.forEach((record) => {
      const exerciseBlock = document.createElement("div");
      exerciseBlock.className = "history-item";

      const exerciseName = document.createElement("strong");
      exerciseName.textContent = record.exercise;
      exerciseBlock.appendChild(exerciseName);

      record.sets.forEach((set, index) => {
        const setElement = document.createElement("div");
        setElement.textContent = `Set ${index + 1}： ${set.weight}kg × ${set.reps} reps`;
        exerciseBlock.appendChild(setElement);
      });

      exercises.appendChild(exerciseBlock);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-history-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const updatedSessions = workoutSessions.filter(
        (item) => item.sessionId !== session.sessionId
      );

      if (saveWorkoutSessions(updatedSessions)) {
        renderSessionHistory();
        markExerciseChartForUpdate();
      } else {
        alert("Workout Sessionを削除できませんでした。");
      }
    });

    sessionItem.append(heading, duration, exerciseCount, exercises, deleteButton);
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

  const now = new Date();
  const weightRecord = {
    weight: toFiniteNumber(bodyWeightInput.value),
    date: now.toLocaleDateString(),
    createdAt: now.toISOString()
  };
  const weightHistory = getBodyWeightHistory();
  weightHistory.push(weightRecord);

  if (!saveBodyWeightHistory(weightHistory)) {
    alert("体重を保存できませんでした。");
    return;
  }

  currentWeight.textContent = weightRecord.weight;
  bodyWeightInput.value = "";
  markWeightChartForUpdate();
  alert("体重を記録しました！");
});

// ============================================================
// グラフ
// ============================================================

let weightChart = null;
let exerciseChart = null;
let weightChartNeedsUpdate = true;
let exerciseChartNeedsUpdate = true;

function markWeightChartForUpdate() {
  weightChartNeedsUpdate = true;
  if (currentPage === "progress") renderWeightChart();
}

function markExerciseChartForUpdate() {
  exerciseChartNeedsUpdate = true;
  if (currentPage === "progress") renderExerciseChart();
}

function refreshProgressCharts() {
  if (weightChartNeedsUpdate || !weightChart) {
    renderWeightChart();
  } else {
    weightChart.resize();
  }

  if (exerciseChartNeedsUpdate || !exerciseChart) {
    renderExerciseChart();
  } else {
    exerciseChart.resize();
  }
}

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
  weightChartNeedsUpdate = false;
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
  const exerciseHistory = getWorkoutSessions()
    .flatMap((session) => session.exercises.map((record) => ({
      ...record,
      sessionDate: session.date
    })))
    .filter((record) => record.exerciseId === selectedExerciseId);
  const labels = [];
  const weights = [];
  const estimated1RMs = [];

  exerciseHistory.forEach((record) => {
    const validSets = record.sets.filter((set) =>
      Number.isFinite(set.weight) && Number.isFinite(set.reps) &&
      set.weight > 0 && set.reps > 0
    );
    if (validSets.length === 0) return;

    labels.push(record.sessionDate);
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
  exerciseChartNeedsUpdate = false;
}

exerciseChartSelect.addEventListener("change", markExerciseChartForUpdate);

// ============================================================
// 初期化
// ============================================================

function initializeApp() {
  renderExerciseCards();
  populateExerciseChartSelect();
  renderSessionHistory();
  loadCurrentWeight();
  restoreActiveWorkout();
  updateRestTimerDisplay();
  showPage("workout");
}

initializeApp();
