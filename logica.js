document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos del DOM
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const gameBoard = document.getElementById('game-board');
    const timerElement = document.getElementById('time');
    const scoreElement = document.getElementById('score-value');
  
    // Variables del juego
    let cards = [];
    let flippedCards = [];
    let score = 0;
    let timer;
    let timeLeft = 180;
  
    // Inicializar el juego
    initializeGame();
  
    // Función para inicializar el juego
    function initializeGame() {
      startButton.addEventListener('click', () => {
        const username = prompt('Ingresa tu nombre de usuario');
        if (username) {
          startGame(username);
        }
      });
      restartButton.addEventListener('click', restartGame);
    }
  
    // Función para comenzar el juego
    function startGame(username) {
      startButton.disabled = true;
      restartButton.disabled = false;
  
      saveUsername(username);
  
      generateCards();
      renderCards();
  
      // Iniciar temporizador
      timer = setInterval(updateTimer, 1000);
    }
  
    // Función para reiniciar el juego
    function restartGame() {
      clearInterval(timer);
      timeLeft = 180;
      score = 0;
      flippedCards = [];
  
      timerElement.textContent = timeLeft;
      scoreElement.textContent = score;
  
      gameBoard.innerHTML = '';
      startButton.disabled = false;
      restartButton.disabled = true;
    }
  
    // Función para generar las tarjetas
    function generateCards() {
      const images = ['imagen1', 'imagen2', 'imagen3', 'imagen4', 'imagen5', 'imagen6', 'imagen7', 'imagen8'];
      cards = [...images, ...images]; // Duplicar las imágenes para tener pares
  
      // Barajar las tarjetas usando el algoritmo de Fisher-Yates
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
    }
  
    // Función para renderizar las tarjetas en el tablero de juego
    function renderCards() {
      for (let i = 0; i < cards.length; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.cardIndex = i;
        card.addEventListener('click', flipCard);
  
        const frontFace = document.createElement('div');
        frontFace.classList.add('front-face');
  
        const backFace = document.createElement('div');
        backFace.classList.add('back-face');
  
        const reverseImage = new Image();
        reverseImage.src = 'imagenes/volteada.jpg';
        reverseImage.alt = 'Card Reverse';
        reverseImage.classList.add('card-image');
  
        const frontImage = new Image();
        frontImage.src = `imagenes/${cards[i]}.jpeg`;
        frontImage.alt = 'Card Front';
        frontImage.classList.add('card-image');
  
        backFace.appendChild(reverseImage);
        frontFace.appendChild(frontImage);
  
        card.appendChild(frontFace);
        card.appendChild(backFace);
        gameBoard.appendChild(card);
      }
    }
  
    // Función para voltear una tarjeta
    function flipCard() {
      if (!this.classList.contains('flipped') && !this.classList.contains('found') && flippedCards.length < 2) {
        const frontFace = this.querySelector('.front-face');
        const backFace = this.querySelector('.back-face');
  
        frontFace.style.display = 'block';
        backFace.style.display = 'none';
        this.classList.add('flipped');
        flippedCards.push(this);
  
        if (flippedCards.length === 2) {
          setTimeout(checkMatch, 100);
        }
      }
    }
  
    // Función para verificar si hay una coincidencia
    function checkMatch() {
      const card1 = flippedCards[0];
      const card2 = flippedCards[1];
      const index1 = Number(card1.dataset.cardIndex);
      const index2 = Number(card2.dataset.cardIndex);
  
      if (cards[index1] === cards[index2]) {
        card1.classList.add('found');
        card2.classList.add('found');
  
        const frontImage1 = card1.querySelector('.front-face img');
        const frontImage2 = card2.querySelector('.front-face img');
        frontImage1.style.display = 'block';
        frontImage2.style.display = 'block';
  
        flippedCards = [];
  
        score += 20;
        scoreElement.textContent = score;
  
        checkGameCompletion();
      } else {
        setTimeout(() => {
          const frontFace1 = card1.querySelector('.front-face');
          const backFace1 = card1.querySelector('.back-face');
          frontFace1.style.display = 'none';
          backFace1.style.display = 'block';
          card1.classList.remove('flipped');
  
          const frontFace2 = card2.querySelector('.front-face');
          const backFace2 = card2.querySelector('.back-face');
          frontFace2.style.display = 'none';
          backFace2.style.display = 'block';
          card2.classList.remove('flipped');
  
          flippedCards = [];
        }, 1000);
      }
    }
  
    // Función para verificar si se completó el juego
    function checkGameCompletion() {
      const foundCards = document.querySelectorAll('.found');
      if (foundCards.length === cards.length) {
        clearInterval(timer);
        const username = loadUsername();
        const maxScore = 1000; // Puntuación máxima posible
        const userScore = Math.floor((timeLeft / 180) * maxScore);
        saveScore(username, userScore);
        showScores();
        alert('¡Felicidades! Has completado el juego.');
      }
    }
  
    // Función para actualizar el temporizador
    function updateTimer() {
      timeLeft--;
      timerElement.textContent = timeLeft;
  
      if (timeLeft === 0) {
        clearInterval(timer);
        alert('¡Se acabó el tiempo! Inténtalo de nuevo.');
        restartGame();
      }
    }
  
    // Función para guardar el nombre de usuario en LocalStorage
    function saveUsername(username) {
      localStorage.setItem('username', username);
    }
  
    // Función para cargar el nombre de usuario desde LocalStorage
    function loadUsername() {
      return localStorage.getItem('username') || '';
    }
  
    // Función para guardar la puntuación en LocalStorage
    function saveScore(username, score) {
      const scores = getScores();
      scores.push({ username, score });
      localStorage.setItem('scores', JSON.stringify(scores));
    }
  
    // Función para cargar los puntajes desde LocalStorage
    function getScores() {
      const scores = localStorage.getItem('scores');
      return scores ? JSON.parse(scores) : [];
    }
  
    // Función para mostrar los puntajes en la tabla
    function showScores() {
      const scores = getScores();
      const tbody = document.querySelector('#scoreboard tbody');
      tbody.innerHTML = '';
      scores.sort((a, b) => b.score - a.score);
      scores.forEach((score) => {
        const row = document.createElement('tr');
        const usernameCell = document.createElement('td');
        usernameCell.textContent = score.username;
        const scoreCell = document.createElement('td');
        scoreCell.textContent = score.score;
        row.appendChild(usernameCell);
        row.appendChild(scoreCell);
        tbody.appendChild(row);
      });
    }
  });