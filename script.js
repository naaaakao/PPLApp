console.log("Workout App started!");

const startButtons = document.querySelectorAll(".start-btn");

console.log("JS loaded");
console.log(startButtons);

const modal = document.getElementById("workoutModal");
const closeModalButton = document.getElementById("closeModal");
const modalExerciseName = document.getElementById("modalExerciseName");

startButtons.forEach((button) => {

    button.addEventListener("click", () => {
  
      console.log("BUTTON CLICKED");
  
      const exerciseName =
        button.parentElement.querySelector("span").textContent;
  
      modalExerciseName.textContent = exerciseName;
  
      modal.classList.add("show");
  
    });
  
  });

closeModalButton.addEventListener("click", () => {
  modal.classList.remove("show");
});

const weightInput = document.getElementById("weightInput");
const repsInput = document.getElementById("repsInput");
const setsInput = document.getElementById("setsInput");
const saveWorkoutBtn = document.getElementById("saveWorkoutBtn");

saveWorkoutBtn.addEventListener("click", () => {

  const exercise = modalExerciseName.textContent;
  const weight = weightInput.value;
  const reps = repsInput.value;
  const sets = setsInput.value;

  const workoutRecord = {
    exercise: exercise,
    weight: weight,
    reps: reps,
    sets: sets,
    date: new Date().toLocaleDateString()
  };

  const workoutHistory =
    JSON.parse(localStorage.getItem("workoutHistory")) || [];

  workoutHistory.push(workoutRecord);
  localStorage.setItem(
    "workoutHistory",
    JSON.stringify(workoutHistory)
  );

  renderHistory();

  alert("Workout saved!");

  weightInput.value = "";
  repsInput.value = "";
  setsInput.value = "";

  modal.classList.remove("show");
});

const historyList = document.getElementById("historyList");

function renderHistory() {

  const workoutHistory =
    JSON.parse(localStorage.getItem("workoutHistory")) || [];

  historyList.innerHTML = "";

  workoutHistory.forEach((record) => {

    const historyItem = document.createElement("div");

    historyItem.className = "history-item";

    historyItem.innerHTML = `
      <strong>${record.exercise}</strong>
      ${record.weight}kg × ${record.reps} reps × ${record.sets} sets
      <br>
      ${record.date}
    `;

    historyList.appendChild(historyItem);

  });

}

