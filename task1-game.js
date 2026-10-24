// Task 1 — Higher or Lower
// Change these constants to adjust the game. The inclusive random range is used below.
const GAME_MIN_NUMBER = 1;
const GAME_MAX_NUMBER = 12;
const GAME_STARTING_LIVES = 3;
const GAME_CRITICAL_EQUAL_RULE = true;

const currentNumberElement = document.querySelector("#current-number");
const gameMessageElement = document.querySelector("#game-message");
const livesValueElement = document.querySelector("#lives-value");
const streakValueElement = document.querySelector("#streak-value");
const bestValueElement = document.querySelector("#best-value");
const higherButton = document.querySelector("#guess-higher");
const lowerButton = document.querySelector("#guess-lower");
const startButton = document.querySelector("#start-game");
const restartButton = document.querySelector("#restart-game");

let currentNumber = null;
let lives = GAME_STARTING_LIVES;
let streak = 0;
let bestStreak = 0;
let gameActive = false;

function randomGameNumber() {
  return Math.floor(Math.random() * (GAME_MAX_NUMBER - GAME_MIN_NUMBER + 1)) + GAME_MIN_NUMBER;
}

function updateGameView() {
  currentNumberElement.textContent = currentNumber === null ? "—" : String(currentNumber);
  livesValueElement.textContent = String(lives);
  streakValueElement.textContent = String(streak);
  bestValueElement.textContent = String(bestStreak);
  higherButton.disabled = !gameActive;
  lowerButton.disabled = !gameActive;
  startButton.disabled = gameActive;
}

function startGame() {
  lives = GAME_STARTING_LIVES;
  streak = 0;
  currentNumber = randomGameNumber();
  gameActive = true;
  gameMessageElement.textContent = "Game started. Will the next number be higher or lower?";
  gameMessageElement.className = "muted";
  updateGameView();
}

function finishGame() {
  gameActive = false;
  gameMessageElement.textContent = `Game over. Your best streak is ${bestStreak}. Press Restart to play again.`;
  gameMessageElement.className = "muted is-error";
  updateGameView();
}

function makeGuess(direction) {
  if (gameActive !== true || (direction !== "higher" && direction !== "lower")) {
    gameMessageElement.textContent = "That move is not available. Start or restart the game first.";
    return;
  }

  const nextNumber = randomGameNumber();
  const isEqual = nextNumber === currentNumber;
  const isHigherCorrect = direction === "higher" && nextNumber > currentNumber;
  const isLowerCorrect = direction === "lower" && nextNumber < currentNumber;
  const isCorrect = (isHigherCorrect || isLowerCorrect || (GAME_CRITICAL_EQUAL_RULE && isEqual)) && gameActive === true;

  currentNumber = nextNumber;
  if (isCorrect) {
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    gameMessageElement.textContent = isEqual
      ? `The number was ${nextNumber} again. Equal counts as correct!`
      : `Correct! The next number was ${nextNumber}.`;
    gameMessageElement.className = "muted is-success";
  } else {
    lives -= 1;
    streak = 0;
    gameMessageElement.textContent = `Not quite — the next number was ${nextNumber}. You lost one life.`;
    gameMessageElement.className = "muted is-error";
  }

  if (lives <= 0 && lives === 0) {
    finishGame();
  } else {
    updateGameView();
  }
}

higherButton.addEventListener("click", () => makeGuess("higher"));
lowerButton.addEventListener("click", () => makeGuess("lower"));
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

updateGameView();
