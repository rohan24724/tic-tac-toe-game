document.addEventListener("DOMContentLoaded", () => {

  /* ================= STATE ================= */

  let board = Array(9).fill("");
  let currentPlayer = "X";
  let gameActive = false;
  let vsComputer = false;
  let userSymbol = null;
  let computerSymbol = null;
  let difficulty = null;
  let boardLocked = false;

  let scoreX = 0;
  let scoreO = 0;
  let scoreDraw = 0;

  const WIN_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  /* ================= ELEMENTS ================= */

  const screens = document.querySelectorAll(".screen");

  const homeScreen = document.getElementById("home-screen");
  const modeScreen = document.getElementById("mode-screen");
  const settingsScreen = document.getElementById("settings-screen");
  const gameScreen = document.getElementById("game-screen");

  const startBtn = document.getElementById("start-btn");
  const twoPlayerBtn = document.getElementById("two-player-btn");
  const computerBtn = document.getElementById("computer-btn");
  const backHomeBtn = document.getElementById("back-home-btn");
  const backModeBtn = document.getElementById("back-mode-btn");

  const symbolBtns = document.querySelectorAll(".symbol-btn");
  const difficultyBtns = document.querySelectorAll(".difficulty-btn");
  const startGameBtn = document.getElementById("start-game-btn");

  const boardElement = document.getElementById("board");
  const statusText = document.getElementById("status-text");

  const restartBtn = document.getElementById("restart-btn");
  const homeBtn = document.getElementById("home-btn");

  const resultModal = document.getElementById("result-modal");
  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");
  const playAgainBtn = document.getElementById("play-again-btn");
  const closeModalBtn = document.getElementById("close-modal-btn");

  const scoreXEl = document.getElementById("score-x");
  const scoreOEl = document.getElementById("score-o");
  const scoreDrawEl = document.getElementById("score-draw");

  /* ================= SCREEN CONTROL ================= */

  function showScreen(screen) {
    screens.forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
  }

  startBtn.onclick = () => showScreen(modeScreen);
  backHomeBtn.onclick = () => showScreen(homeScreen);
  backModeBtn.onclick = () => showScreen(modeScreen);

  twoPlayerBtn.onclick = () => {
    vsComputer = false;
    showScreen(gameScreen);
    initGame();
  };

  computerBtn.onclick = () => {
    vsComputer = true;
    showScreen(settingsScreen);
  };

  /* ================= SETTINGS ================= */

  function resetSelections() {
    userSymbol = null;
    computerSymbol = null;
    difficulty = null;
    startGameBtn.disabled = true;
    symbolBtns.forEach(b => b.classList.remove("active"));
    difficultyBtns.forEach(b => b.classList.remove("active"));
  }

  symbolBtns.forEach(btn => {
    btn.onclick = () => {
      symbolBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      userSymbol = btn.dataset.symbol;
      computerSymbol = userSymbol === "X" ? "O" : "X";

      validateStart();
    };
  });

  difficultyBtns.forEach(btn => {
    btn.onclick = () => {
      difficultyBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      difficulty = btn.dataset.level;

      validateStart();
    };
  });

  function validateStart() {
    if (userSymbol && difficulty) {
      startGameBtn.disabled = false;
    }
  }

  startGameBtn.onclick = () => {
    if (!userSymbol || !difficulty) return;
    showScreen(gameScreen);
    initGame();
  };

  /* ================= BOARD GENERATION ================= */

  function generateBoard() {
    boardElement.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = i;
      boardElement.appendChild(cell);
    }
  }

  /* ================= GAME INIT ================= */

  function initGame() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;
    boardLocked = false;

    generateBoard();
    updateStatus();

    if (vsComputer && computerSymbol === "X") {
      computerMove();
    }
  }

  /* ================= CLICK HANDLING ================= */

  boardElement.addEventListener("click", (e) => {

    if (!e.target.classList.contains("cell")) return;

    const index = e.target.dataset.index;

    if (!gameActive) return;
    if (boardLocked) return;
    if (board[index] !== "") return;

    makeMove(index, currentPlayer);

    if (vsComputer && gameActive && currentPlayer === computerSymbol) {
      computerMove();
    }

  });

  function makeMove(index, player) {
    board[index] = player;
    document.querySelector(`[data-index="${index}"]`).textContent = player;

    if (checkWin(player)) {
      endGame(player);
      return;
    }

    if (board.every(c => c !== "")) {
      endGame("draw");
      return;
    }

    currentPlayer = player === "X" ? "O" : "X";
    updateStatus();
  }

  function updateStatus() {
    if (!gameActive) return;

    if (!vsComputer) {
      statusText.textContent = `Turn: ${currentPlayer}`;
      return;
    }

    if (currentPlayer === userSymbol) {
      statusText.textContent = "Your Turn";
      boardLocked = false;
    } else {
      statusText.textContent = "Computer Thinking...";
      boardLocked = true;
    }
  }

  function checkWin(player) {
    return WIN_COMBOS.some(combo =>
      combo.every(i => board[i] === player)
    );
  }

  function endGame(result) {
    gameActive = false;
    boardLocked = true;

    if (result === "draw") {
      scoreDraw++;
      scoreDrawEl.textContent = scoreDraw;
      showModal("Draw!", "It's a draw!");
      return;
    }

    if (result === "X") {
      scoreX++;
      scoreXEl.textContent = scoreX;
    } else {
      scoreO++;
      scoreOEl.textContent = scoreO;
    }

    showModal("Winner!", `Player ${result} Wins!`);
  }

  /* ================= MODAL ================= */

  function showModal(title, message) {
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    resultModal.classList.remove("hidden");
  }

  function closeModal() {
    resultModal.classList.add("hidden");
  }

  playAgainBtn.onclick = () => {
    closeModal();
    initGame();
  };

  closeModalBtn.onclick = closeModal;

  /* ================= AI ================= */

  function computerMove() {
    boardLocked = true;

    setTimeout(() => {

      let move;

      if (difficulty === "easy") {
        move = randomMove();
      } else if (difficulty === "medium") {
        move = Math.random() < 0.5 ? randomMove() : bestMove();
      } else {
        move = bestMove();
      }

      makeMove(move, computerSymbol);

    }, 600);
  }

  function randomMove() {
    const empty = board
      .map((v,i) => v === "" ? i : null)
      .filter(v => v !== null);
    return empty[Math.floor(Math.random() * empty.length)];
  }

  function bestMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = computerSymbol;
        let score = minimax(board, 0, false);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  function minimax(tempBoard, depth, isMaximizing) {

    if (checkWin(computerSymbol)) return 10 - depth;
    if (checkWin(userSymbol)) return depth - 10;
    if (tempBoard.every(c => c !== "")) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === "") {
          tempBoard[i] = computerSymbol;
          let score = minimax(tempBoard, depth+1, false);
          tempBoard[i] = "";
          best = Math.max(best, score);
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === "") {
          tempBoard[i] = userSymbol;
          let score = minimax(tempBoard, depth+1, true);
          tempBoard[i] = "";
          best = Math.min(best, score);
        }
      }
      return best;
    }
  }

  /* ================= CONTROLS ================= */

  restartBtn.onclick = initGame;

  homeBtn.onclick = () => {
    gameActive = false;
    boardLocked = false;
    resetSelections();
    showScreen(homeScreen);
  };

});
