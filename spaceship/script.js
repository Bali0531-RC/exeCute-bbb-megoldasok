class SpaceshipGame {
    constructor() {
        this.gridSize = 12;
        this.ships = [
            { id: 1, cells: [[0, 0], [0, 1]], name: '1x2' },
            { id: 2, cells: [[0, 0], [0, 1], [0, 2]], name: '1x3' },
            { id: 3, cells: [[0, 0], [0, 1], [0, 2], [0, 3]], name: '1x4' },
            { id: 4, cells: [[0, 0], [0, 1], [1, 0], [1, 1]], name: '2x2' },
            { id: 5, cells: [[0, 0], [1, 0], [1, 1]], name: 'L1' },
            { id: 6, cells: [[0, 0], [0, 1], [1, 0]], name: 'L2' },
            { id: 7, cells: [[0, 0], [0, 1], [0, 2]], name: '1x3-2' }
        ];
        
        this.board = [];
        this.revealed = [];
        this.shipCells = new Set();
        this.foundShips = new Set();
        this.moves = 0;
        this.timeAttackMode = false;
        this.remainingMoves = 15;
        
        this.leaderboard = new LeaderboardManager();
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeGame();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.movesDisplay = document.getElementById('moves');
        this.foundShipsDisplay = document.getElementById('foundShips');
        this.remainingMovesDisplay = document.getElementById('remainingMoves');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.timeAttackBtn = document.getElementById('timeAttackBtn');
        this.winModal = document.getElementById('winModal');
        this.loseModal = document.getElementById('loseModal');
        this.finalMoves = document.getElementById('finalMoves');
        this.themeToggle = document.getElementById('themeToggle');
        
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.initializeGame());
        this.timeAttackBtn.addEventListener('click', () => this.toggleTimeAttack());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        document.querySelectorAll('.modal-backdrop, .close-modal').forEach(el => {
            el.addEventListener('click', () => {
                this.hideModals();
                this.initializeGame();
            });
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    toggleTimeAttack() {
        this.timeAttackMode = !this.timeAttackMode;
        this.timeAttackBtn.textContent = this.timeAttackMode ? 
            '⏱️ Time Attack: ON' : '⏱️ Time Attack: OFF';
        
        const leaderboardSection = document.getElementById('leaderboardSection');
        if (this.timeAttackMode) {
            leaderboardSection.style.display = 'block';
            this.loadLeaderboard();
        } else {
            leaderboardSection.style.display = 'none';
        }
        
        this.initializeGame();
    }

    initializeGame() {
        this.board = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
        this.revealed = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(false));
        this.shipCells = new Set();
        this.foundShips = new Set();
        this.moves = 0;
        this.remainingMoves = 15;
        
        this.placeShips();
        this.renderBoard();
        this.updateStats();
        this.hideModals();
    }

    placeShips() {
        const placedShips = [];
        
        for (const ship of this.ships) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 1000) {
                attempts++;
                
                const rotation = Math.floor(Math.random() * 4);
                const rotatedShip = this.rotateShip(ship.cells, rotation);
                
                const maxRow = this.gridSize - Math.max(...rotatedShip.map(c => c[0]));
                const maxCol = this.gridSize - Math.max(...rotatedShip.map(c => c[1]));
                
                const startRow = Math.floor(Math.random() * maxRow);
                const startCol = Math.floor(Math.random() * maxCol);
                
                const absoluteCells = rotatedShip.map(([r, c]) => [r + startRow, c + startCol]);
                
                if (this.canPlaceShip(absoluteCells, placedShips)) {
                    placedShips.push({ id: ship.id, cells: absoluteCells });
                    absoluteCells.forEach(([r, c]) => {
                        this.board[r][c] = ship.id;
                        this.shipCells.add(`${r},${c}`);
                    });
                    placed = true;
                }
            }
        }
    }

    rotateShip(cells, rotation) {
        let result = cells.map(c => [...c]);
        
        for (let i = 0; i < rotation; i++) {
            result = result.map(([r, c]) => [c, -r]);
        }
        
        const minRow = Math.min(...result.map(c => c[0]));
        const minCol = Math.min(...result.map(c => c[1]));
        
        return result.map(([r, c]) => [r - minRow, c - minCol]);
    }

    canPlaceShip(cells, placedShips) {
        for (const [r, c] of cells) {
            if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize) {
                return false;
            }
            
            if (this.board[r][c] !== 0) {
                return false;
            }
        }
        
        for (const [r, c] of cells) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    
                    if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize) {
                        if (this.board[nr][nc] !== 0) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                if (this.revealed[r][c]) {
                    cell.classList.add('revealed');
                    
                    if (this.board[r][c] > 0) {
                        cell.classList.add('ship');
                        cell.textContent = '🚀';
                    } else {
                        const distance = this.calculateDistance(r, c);
                        if (distance === 0) {
                            cell.classList.add('empty');
                            cell.textContent = '·';
                        } else {
                            cell.classList.add('number');
                            cell.textContent = distance;
                        }
                    }
                } else {
                    cell.addEventListener('click', () => this.handleCellClick(r, c));
                }
                
                this.gameBoard.appendChild(cell);
            }
        }
    }

    handleCellClick(row, col) {
        if (this.revealed[row][col]) return;
        
        this.moves++;
        if (this.timeAttackMode) {
            this.remainingMoves--;
        }
        
        this.revealed[row][col] = true;
        
        if (this.board[row][col] > 0) {
            const shipId = this.board[row][col];
            
            if (!this.foundShips.has(shipId)) {
                this.revealEntireShip(shipId);
                this.foundShips.add(shipId);
                
                if (this.timeAttackMode) {
                    this.remainingMoves += 5;
                }
                
                if (this.checkWin()) {
                    this.showWinModal();
                    return;
                }
            }
        }
        
        if (this.timeAttackMode && this.remainingMoves <= 0) {
            this.showLoseModal();
            return;
        }
        
        this.renderBoard();
        this.updateStats();
    }

    revealEntireShip(shipId) {
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.board[r][c] === shipId) {
                    this.revealed[r][c] = true;
                }
            }
        }
    }

    calculateDistance(row, col) {
        const queue = [[row, col, 0]];
        const visited = new Set([`${row},${col}`]);
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        
        while (queue.length > 0) {
            const [r, c, dist] = queue.shift();
            
            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;
                
                if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize) {
                    const key = `${nr},${nc}`;
                    
                    if (!visited.has(key)) {
                        if (this.board[nr][nc] > 0) {
                            return dist + 1;
                        }
                        
                        visited.add(key);
                        queue.push([nr, nc, dist + 1]);
                    }
                }
            }
        }
        
        return 0;
    }

    checkWin() {
        return this.foundShips.size === this.ships.length;
    }

    updateStats() {
        this.movesDisplay.textContent = this.moves;
        this.foundShipsDisplay.textContent = `${this.foundShips.size} / ${this.ships.length}`;
        
        if (this.timeAttackMode) {
            this.remainingMovesDisplay.textContent = this.remainingMoves;
            document.getElementById('remainingMovesBox').style.display = 'block';
        } else {
            document.getElementById('remainingMovesBox').style.display = 'none';
        }
    }

    showWinModal() {
        this.finalMoves.textContent = this.moves;
        this.winModal.classList.add('show');
        
        if (this.timeAttackMode) {
            setTimeout(() => {
                this.leaderboard.submitScore(this.moves);
            }, 500);
        }
    }

    showLoseModal() {
        this.loseModal.classList.add('show');
    }

    hideModals() {
        this.winModal.classList.remove('show');
        this.loseModal.classList.remove('show');
    }

    async loadLeaderboard() {
        const leaderboardContent = document.getElementById('leaderboardContent');
        const personalBestBox = document.getElementById('personalBest');
        const personalBestValue = document.getElementById('personalBestValue');

        try {
            const data = await this.leaderboard.getLeaderboard(10);
            
            if (data.length === 0) {
                leaderboardContent.innerHTML = '<p class="no-data">Nincs még adat a toplistán</p>';
            } else {
                let html = '<table class="leaderboard-table"><thead><tr><th>Helyezés</th><th>Név</th><th>Lépések</th></tr></thead><tbody>';
                
                data.forEach((entry, index) => {
                    const isCurrentPlayer = entry.name === this.leaderboard.getPlayerName();
                    const rowClass = isCurrentPlayer ? 'current-player' : '';
                    html += `<tr class="${rowClass}">
                        <td>${index + 1}.</td>
                        <td>${entry.name}</td>
                        <td>${entry.moves}</td>
                    </tr>`;
                });
                
                html += '</tbody></table>';
                leaderboardContent.innerHTML = html;
            }

            const personalBest = this.leaderboard.getPersonalBest();
            if (personalBest) {
                personalBestValue.textContent = personalBest;
                personalBestBox.style.display = 'block';
            }
        } catch (error) {
            leaderboardContent.innerHTML = '<p class="error-text">❌ Hiba a toplista betöltésekor</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SpaceshipGame();
});
