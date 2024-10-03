const rows = 5;
const cols = 5;
let board = [];
let playerPosition = { x: 0, y: 0 };
let totalFruits = 0;
let stepsRemaining = 10;
let bestScore = 0;
let teleportUsed = false;
let resetUsed = false;
let isTeleportActive = true;  // Kezdetben a teleport mód aktív

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
            cell.onclick = () => handleCellClick(i, j);  // Csak itt történik lépés
            boardContainer.appendChild(cell);
        }
        board.push(row);
        boardContainer.appendChild(document.createElement('br'));
    }

    // Kezdéskor a teleport mód aktív, lehet bárhova lépni
    isTeleportActive = true;
    updateBoardDisplay();
}

// Kezeli a mezőre kattintást
function handleCellClick(x, y) {
    if (isTeleportActive || isMovable(x, y)) {  // Csak ha a mező elérhető vagy teleportálás aktív
        movePlayer(x, y);
    }
}

// Ellenőrzi, hogy a mező mozdítható-e a játékos helyzetéből
function isMovable(x, y) {
    return (
        (x === playerPosition.x && Math.abs(y - playerPosition.y) === 1) ||
        (y === playerPosition.y && Math.abs(x - playerPosition.x) === 1)
    );
}

// Játékos mozgatása és gyümölcsök leszüretelése
function movePlayer(newX, newY) {
    playerPosition = { x: newX, y: newY };
    collectFruits(newX, newY);
    if (!teleportUsed && !isTeleportActive) {  // Csak akkor vonunk le lépést, ha nincs teleportálás
        stepsRemaining--;
    }
    document.getElementById('remaining-steps').innerText = stepsRemaining;
    isTeleportActive = false;  // Teleport deaktiválása lépés után
    updateBoardDisplay();

    if (stepsRemaining === 0) {
        endGame();
    }
}

// Gyümölcsök szüretelése az adott mezőn
function collectFruits(x, y) {
    totalFruits += board[x][y];
    board[x][y] = 0; // Gyümölcs eltávolítása
    document.getElementById('fruit-count').innerText = totalFruits;
}

// Frissíti a játékfelületet: színek és kattinthatóság beállítása
function updateBoardDisplay() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            cell.classList.remove('player', 'movable', 'not-movable');
            cell.innerText = board[i][j];
            
            if (i === playerPosition.x && j === playerPosition.y) {
                cell.classList.add('player');  // Zöld: ahol a játékos van
            } else if (isTeleportActive || isMovable(i, j)) {
                cell.classList.add('movable');  // Sárga: léphető mező vagy teleport módban minden mező
                cell.onclick = () => handleCellClick(i, j);  // Kattintható, ha elérhető
            } else {
                cell.classList.add('not-movable');  // Piros: nem léphető mező
                cell.onclick = null;  // Nem kattintható
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

// Játék vége és pontszám ellenőrzése
function endGame() {
    alert('Játék vége! Pontszámod: ' + totalFruits);
    if (totalFruits > bestScore) {
        bestScore = totalFruits;
        document.getElementById('best-score').innerText = bestScore;
    }
}

// Teleport képesség használata
function useTeleport() {
    isTeleportActive = true;
    document.getElementById('teleport-button').style.display = 'none';
    updateBoardDisplay();  // Minden mező kattintható
}

// Mezők újratöltése
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

// Játék újraindítása
function resetGame() {
    totalFruits = 0;
    stepsRemaining = 10;
    playerPosition = { x: 0, y: 0 };
    teleportUsed = false;
    resetUsed = false;
    isTeleportActive = true;  // Új játék kezdésekor ismét aktív a teleport
    document.getElementById('fruit-count').innerText = totalFruits;
    document.getElementById('remaining-steps').innerText = stepsRemaining;
    document.getElementById('teleport-button').style.display = 'inline';
    document.getElementById('reset-board-button').style.display = 'inline';
    createBoard();
}

// Billentyűkkel való irányítás
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp' && isMovable(playerPosition.x - 1, playerPosition.y)) {
        movePlayer(playerPosition.x - 1, playerPosition.y);
    } else if (event.key === 'ArrowDown' && isMovable(playerPosition.x + 1, playerPosition.y)) {
        movePlayer(playerPosition.x + 1, playerPosition.y);
    } else if (event.key === 'ArrowLeft' && isMovable(playerPosition.x, playerPosition.y - 1)) {
        movePlayer(playerPosition.x, playerPosition.y - 1);
    } else if (event.key === 'ArrowRight' && isMovable(playerPosition.x, playerPosition.y + 1)) {
        movePlayer(playerPosition.x, playerPosition.y + 1);
    }
});

// Játék elindítása
createBoard();
