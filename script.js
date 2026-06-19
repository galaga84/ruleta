const ROUND_SECONDS = 5 * 60;
const ROULETTE_DURATION = 2600;
const ROULETTE_STEP = 120;

// Preguntas organizadas por las cuatro rondas de la actividad.
const categories = [
  {
    title: "\u00bfC\u00f3mo llego hoy?",
    questions: [
      "Si tu estado emocional de hoy fuera un clima, \u00bfcu\u00e1l ser\u00eda y por qu\u00e9?",
      "\u00bfQu\u00e9 emoci\u00f3n ha estado m\u00e1s presente en ti durante esta semana?",
      "\u00bfCon qu\u00e9 energ\u00eda llegas hoy: alta, media o baja? \u00bfQu\u00e9 la explica?",
      "\u00bfQu\u00e9 has tenido que sostener \u00faltimamente en tu rol docente?",
      "\u00bfQu\u00e9 parte de tu trabajo te ha demandado m\u00e1s emocionalmente estos d\u00edas?"
    ]
  },
  {
    title: "Reconocer lo que me cuida",
    questions: [
      "\u00bfQu\u00e9 gesto peque\u00f1o te ayuda a recuperar calma durante una jornada dif\u00edcil?",
      "\u00bfQu\u00e9 haces, aunque sea por pocos minutos, para volver a ti durante el d\u00eda?",
      "\u00bfQu\u00e9 momento de la semana te record\u00f3 por qu\u00e9 elegiste educar?",
      "\u00bfQu\u00e9 te ayuda a sentirte acompa\u00f1ado/a dentro del colegio?",
      "\u00bfQu\u00e9 pr\u00e1ctica personal te gustar\u00eda cuidar m\u00e1s en esta etapa del a\u00f1o?"
    ]
  },
  {
    title: "Cuidado entre colegas",
    questions: [
      "\u00bfQu\u00e9 gesto de un colega te ha hecho sentir apoyado/a alguna vez?",
      "\u00bfC\u00f3mo te das cuenta de que alguien de tu equipo necesita apoyo?",
      "\u00bfQu\u00e9 tipo de ayuda te resulta realmente \u00fatil cuando est\u00e1s sobrecargado/a?",
      "\u00bfQu\u00e9 podr\u00edamos hacer m\u00e1s entre colegas para cuidarnos mejor?",
      "\u00bfQu\u00e9 frase o actitud ayuda a bajar la tensi\u00f3n en un d\u00eda dif\u00edcil?"
    ]
  },
  {
    title: "Cierre positivo y compromiso",
    questions: [
      "\u00bfQu\u00e9 fortaleza reconoces en ti como docente en este momento?",
      "\u00bfQu\u00e9 fortaleza viste o escuchaste en tu dupla durante esta conversaci\u00f3n?",
      "\u00bfQu\u00e9 necesitas soltar un poco para cuidar mejor tu bienestar?",
      "\u00bfQu\u00e9 peque\u00f1o gesto de cuidado te comprometes a practicar esta semana?",
      "\u00bfQu\u00e9 te gustar\u00eda agradecerle a tu dupla?"
    ]
  }
];

const screens = {
  welcome: document.querySelector("#welcome-screen"),
  categories: document.querySelector("#categories-screen"),
  round: document.querySelector("#round-screen"),
  final: document.querySelector("#final-screen")
};

const categoryGrid = document.querySelector("#category-grid");
const progressBar = document.querySelector("#progress-bar");
const roundProgress = document.querySelector("#round-progress");
const roundProgressActive = document.querySelector("#round-progress-active");
const roundKicker = document.querySelector("#round-kicker");
const roundTitle = document.querySelector("#round-title");
const rouletteWindow = document.querySelector("#roulette-window");
const rouletteLabel = document.querySelector("#roulette-label");
const questionText = document.querySelector("#question-text");
const timerDisplay = document.querySelector("#timer-display");
const timerMessage = document.querySelector("#timer-message");

const startActivityButton = document.querySelector("#start-activity");
const restartActivityButton = document.querySelector("#restart-activity");
const pauseTimerButton = document.querySelector("#pause-timer");
const resetTimerButton = document.querySelector("#reset-timer");
const finishRoundButton = document.querySelector("#finish-round");

let activeCategory = 0;
let completedCategories = 0;
let remainingSeconds = ROUND_SECONDS;
let timerId = null;
let rouletteId = null;
let selectedQuestion = "";
let rouletteIsRunning = false;

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-visible"));
  screens[screenName].classList.add("is-visible");
}

function renderCategories() {
  categoryGrid.innerHTML = "";

  categories.forEach((category, index) => {
    const state = getCategoryState(index);
    const article = document.createElement("article");
    article.className = `category-card is-${state}`;
    article.innerHTML = `
      <div>
        <p class="category-count">Categor\u00eda ${index + 1}</p>
        <h3>${category.title}</h3>
      </div>
      <p class="category-state">${getStateText(state)}</p>
      <button type="button" ${state !== "active" ? "disabled" : ""}>Comenzar</button>
    `;

    const button = article.querySelector("button");
    button.addEventListener("click", () => beginRound(index));
    categoryGrid.appendChild(article);
  });
}

function getCategoryState(index) {
  if (index < completedCategories) {
    return "complete";
  }

  if (index === activeCategory) {
    return "active";
  }

  return "locked";
}

function getStateText(state) {
  const labels = {
    active: "Disponible",
    locked: "Bloqueada",
    complete: "Completada"
  };

  return labels[state];
}

function beginRound(index) {
  if (index !== activeCategory || rouletteIsRunning) {
    return;
  }

  selectedQuestion = "";
  resetTimer("El tiempo comenzar\u00e1 cuando se seleccione la pregunta.");
  updateRoundHeader(index);
  showScreen("round");
  runRoulette(index);
}

function runRoulette(index) {
  const questions = categories[index].questions;
  let step = 0;
  rouletteIsRunning = true;
  finishRoundButton.disabled = true;
  pauseTimerButton.disabled = true;
  resetTimerButton.disabled = true;
  rouletteWindow.classList.add("is-spinning");
  rouletteWindow.classList.remove("is-selected");
  rouletteLabel.textContent = "La ruleta est\u00e1 girando";

  rouletteId = window.setInterval(() => {
    questionText.textContent = questions[step % questions.length];
    step += 1;
  }, ROULETTE_STEP);

  window.setTimeout(() => {
    window.clearInterval(rouletteId);
    rouletteId = null;
    selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionText.textContent = selectedQuestion;
    rouletteLabel.textContent = "Pregunta seleccionada";
    rouletteWindow.classList.remove("is-spinning");
    rouletteWindow.classList.add("is-selected");
    rouletteIsRunning = false;
    pauseTimerButton.disabled = false;
    resetTimerButton.disabled = false;
    startTimer();
  }, ROULETTE_DURATION);
}

function startTimer() {
  if (timerId || remainingSeconds <= 0 || rouletteIsRunning) {
    return;
  }

  pauseTimerButton.textContent = "Pausar";
  timerMessage.textContent = "Conversaci\u00f3n en curso.";

  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      pauseTimer(false);
      finishRoundButton.disabled = false;
      timerMessage.textContent = "Tiempo finalizado. Pueden cerrar la conversaci\u00f3n.";
    }
  }, 1000);
}

function pauseTimer(showMessage = true) {
  if (!timerId) {
    return;
  }

  window.clearInterval(timerId);
  timerId = null;
  pauseTimerButton.textContent = "Reanudar";

  if (showMessage && remainingSeconds > 0) {
    timerMessage.textContent = "Timer pausado.";
  }
}

function toggleTimer() {
  if (rouletteIsRunning || remainingSeconds <= 0) {
    return;
  }

  if (timerId) {
    pauseTimer();
    return;
  }

  startTimer();
}

function resetTimer(message = "El timer est\u00e1 listo para comenzar.") {
  pauseTimer(false);
  remainingSeconds = ROUND_SECONDS;
  updateTimerDisplay();
  finishRoundButton.disabled = true;
  pauseTimerButton.textContent = "Pausar";
  timerMessage.textContent = message;
}

function finishRound() {
  if (rouletteIsRunning || remainingSeconds > 0 || completedCategories >= categories.length) {
    return;
  }

  completedCategories += 1;
  activeCategory = completedCategories;
  resetTimer("Ronda terminada.");
  selectedQuestion = "";

  if (completedCategories === categories.length) {
    showScreen("final");
    return;
  }

  renderCategories();
  updateProgress();
  showScreen("categories");
}

function updateTimerDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  timerDisplay.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateProgress() {
  const visibleRound = Math.min(activeCategory + 1, categories.length);
  roundProgress.textContent = `Ronda ${visibleRound} de ${categories.length}`;
  roundProgressActive.textContent = `Ronda ${visibleRound} de ${categories.length}`;
  progressBar.style.width = `${(visibleRound / categories.length) * 100}%`;
}

function updateRoundHeader(index) {
  roundKicker.textContent = `Categor\u00eda ${index + 1}`;
  roundTitle.textContent = categories[index].title;
  updateProgress();
}

function resetActivity() {
  activeCategory = 0;
  completedCategories = 0;
  selectedQuestion = "";
  rouletteIsRunning = false;

  if (rouletteId) {
    window.clearInterval(rouletteId);
    rouletteId = null;
  }

  resetTimer("El tiempo comenzar\u00e1 cuando se seleccione la pregunta.");
  questionText.textContent = "...";
  rouletteLabel.textContent = "La ruleta est\u00e1 girando";
  rouletteWindow.classList.remove("is-spinning", "is-selected");
  renderCategories();
  updateProgress();
  showScreen("categories");
}

startActivityButton.addEventListener("click", resetActivity);
restartActivityButton.addEventListener("click", resetActivity);
pauseTimerButton.addEventListener("click", toggleTimer);
resetTimerButton.addEventListener("click", () => {
  resetTimer("Tiempo reiniciado. La conversaci\u00f3n puede continuar.");
  startTimer();
});
finishRoundButton.addEventListener("click", finishRound);

updateTimerDisplay();
renderCategories();
updateProgress();
