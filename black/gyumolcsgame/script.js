const rows = 5;
const cols = 5;
let board = [];
let playerPosition = { x: 0, y: 0 };
let totalFruits = 0;
let stepsRemaining = 10;
let bestScore = 0;
let teleportUsed = false;
let resetUsed = false;

// Create the game board
function createBoard() {
    const boardContainer = document.getElementById('board-container');
    boardContainer.innerHTML = ''; // Clear the board first

    board = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            const cellValue = Math.floor(Math.random() * 11);
            row.push(cellValue);

            const cell = document.createElement('div');
            cell.className = 'cell fruit-tree';
            cell.id = `cell-${i}-${j}`;
            cell.innerText = cellValue;
            cell.onclick = () => chooseStartPosition(i, j);
            boardContainer.appendChild(cell);
        }
        board.push(row);
        boardContainer.appendChild(document.createElement('br'));
    }
}

// Set the player's starting position
function chooseStartPosition(x, y) {
    if (stepsRemaining < 10) return; // Can't rechoose after starting
    playerPosition = { x, y };
    collectFruits(x, y);
    updateBoardDisplay();
}

// Move player by direction and collect fruits
function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    if (newX < 0 || newX >= rows || newY < 0 || newY >= cols || stepsRemaining <= 0) return;
    
    playerPosition = { x: newX, y: newY };
    collectFruits(newX, newY);
    if (!teleportUsed) stepsRemaining--; // Deduct step only if teleport not used
    document.getElementById('remaining-steps').innerText = stepsRemaining;
    updateBoardDisplay();
    
    if (stepsRemaining === 0) {
        endGame();
    }
}

// Collect fruits from the player's position
function collectFruits(x, y) {
    totalFruits += board[x][y];
    board[x][y] = 0; // Clear the fruits
    document.getElementById('fruit-count').innerText = totalFruits;
}

function updateBoardDisplay() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            cell.classList.remove('player', 'movable', 'not-movable');
            cell.innerText = board[i][j];
            
            // Jelöljük a játékos mezőjét zölddel
            if (i === playerPosition.x && j === playerPosition.y) {
                cell.classList.add('player');
            }
            // Jelöljük a léphető mezőket sárgával (fel, le, balra, jobbra)
            else if (
                (i === playerPosition.x && Math.abs(j - playerPosition.y) === 1) || 
                (j === playerPosition.y && Math.abs(i - playerPosition.x) === 1)
            ) {
                cell.classList.add('movable');
            }
            // A többi mező piros, ahova nem léphet
            else {
                cell.classList.add('not-movable');
            }

            if (board[i][j] === 0) {
                cell.classList.remove('fruit-tree');
                cell.classList.add('empty-tree');
            } else {
                cell.classList.add('fruit-tree');
                cell.classList.remove('empty-tree');
            }
        }
    }
    document.getElementById(`cell-${playerPosition.x}-${playerPosition.y}`).classList.add('player');
}


// End game and check if the player has a new best score
function endGame() {
    alert('Játék vége! Pontszámod: ' + totalFruits);
    if (totalFruits > bestScore) {
        bestScore = totalFruits;
        document.getElementById('best-score').innerText = bestScore;
    }
}

// Reset the board's fruits to new random values
function resetBoard() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            board[i][j] = Math.floor(Math.random() * 11);
        }
    }
    resetUsed = true;
    document.getElementById('reset-board-button').style.display = 'none';
    updateBoardDisplay();
}

// Use the teleport ability
function useTeleport() {
    teleportUsed = true;
    alert('Teleportálhatsz bárhova egyszer!');
    document.getElementById('teleport-button').style.display = 'none';
}

// Reset the game
function resetGame() {
    totalFruits = 0;
    stepsRemaining = 10;
    playerPosition = { x: 0, y: 0 };
    teleportUsed = false;
    resetUsed = false;
    document.getElementById('fruit-count').innerText = totalFruits;
    document.getElementById('remaining-steps').innerText = stepsRemaining;
    document.getElementById('teleport-button').style.display = 'inline';
    document.getElementById('reset-board-button').style.display = 'inline';
    createBoard();
}

// Handle arrow key movements
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        movePlayer(-1, 0);
    } else if (event.key === 'ArrowDown') {
        movePlayer(1, 0);
    } else if (event.key === 'ArrowLeft') {
        movePlayer(0, -1);
    } else if (event.key === 'ArrowRight') {
        movePlayer(0, 1);
    }
});

// Start the game by creating the board
createBoard();
