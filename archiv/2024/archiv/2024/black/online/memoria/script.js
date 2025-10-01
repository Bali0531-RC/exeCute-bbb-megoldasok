const symbols = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝']; // Szimbólumok listája
let cardValues = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;

const memoryGrid = document.getElementById('memoryGrid');
const restartBtn = document.getElementById('restartBtn');


function initializeGame() {

    cardValues = [...symbols, ...symbols];
    shuffle(cardValues);
    matchedPairs = 0;
    memoryGrid.innerHTML = '';


    cardValues.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-game-card');
        card.dataset.symbol = symbol;
        card.dataset.index = index;

        const frontFace = document.createElement('div');
        frontFace.classList.add('memory-game-front');
        frontFace.textContent = symbol;

        const backFace = document.createElement('div');
        backFace.classList.add('memory-game-back');
        backFace.textContent = '❓';

        card.appendChild(frontFace);
        card.appendChild(backFace);

        card.addEventListener('click', flipCard);
        memoryGrid.appendChild(card);
    });
}


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}


function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}


function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}


function checkForMatch() {
    const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
    if (isMatch) {
        disableCards();
        matchedPairs++;
        if (matchedPairs === symbols.length) {
            setTimeout(() => alert('Gratulálok! Megnyerted a játékot!'), 500);
        }
    } else {
        unflipCards();
    }
}


function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}


restartBtn.addEventListener('click', initializeGame);

document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = '../../index.html';
});

initializeGame();