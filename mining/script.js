class MiningGame {
    constructor() {
        this.iron = 0;
        this.clickPower = 1;
        this.clickRadius = 0;
        this.minerCost = 50;
        this.minerPower = 1;
        this.minerRadius = 100;
        this.baseCost = 50000;
        this.testMode = false;
        this.endlessMode = false;
        this.endlessGoal = 50000;
        
        this.asteroids = [];
        this.miners = [];
        this.placingMiner = false;
        
        this.theme = localStorage.getItem('theme') || 'dark';
        
        this.upgrades = {
            clickPower: { level: 0, baseCost: 10, multiplier: 1.5 },
            clickRadius: { level: 0, baseCost: 25, multiplier: 1.5 },
            minerPower: { level: 0, baseCost: 50, multiplier: 1.5 },
            minerRadius: { level: 0, baseCost: 75, multiplier: 1.5 }
        };
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.loadGame();
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.initTheme();
        this.bindEvents();
        this.spawnAsteroids();
        this.startGameLoop();
        this.startAutoSave();
        this.updateUI();
    }
    
    loadGame() {
        try {
            const savedGame = localStorage.getItem('miningGameSave');
            if (savedGame) {
                const data = JSON.parse(savedGame);
                this.iron = data.iron || 0;
                this.clickPower = data.clickPower || 1;
                this.clickRadius = data.clickRadius || 0;
                this.minerPower = data.minerPower || 1;
                this.minerRadius = data.minerRadius || 100;
                this.miners = data.miners || [];
                this.upgrades = data.upgrades || this.upgrades;
                this.endlessMode = data.endlessMode || false;
                this.endlessGoal = data.endlessGoal || 50000;
                
                if (this.endlessMode) {
                    this.baseCost = this.endlessGoal;
                }
            }
        } catch (e) {
            console.error('Hiba a játék betöltésekor:', e);
        }
    }
    
    saveGame() {
        try {
            const saveData = {
                iron: this.iron,
                clickPower: this.clickPower,
                clickRadius: this.clickRadius,
                minerPower: this.minerPower,
                minerRadius: this.minerRadius,
                miners: this.miners,
                upgrades: this.upgrades,
                endlessMode: this.endlessMode,
                endlessGoal: this.endlessGoal,
                timestamp: Date.now()
            };
            localStorage.setItem('miningGameSave', JSON.stringify(saveData));
        } catch (e) {
            console.error('Hiba a játék mentésekor:', e);
        }
    }
    
    startAutoSave() {
        setInterval(() => {
            this.saveGame();
        }, 5000);
    }
    
    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    initTheme() {
        this.applyTheme(this.theme);
        
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme(this.theme);
            localStorage.setItem('theme', this.theme);
        });
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('#themeToggle .icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        document.getElementById('placeMinerBtn')?.addEventListener('click', () => {
            if (this.iron >= this.minerCost && !this.placingMiner) {
                this.placingMiner = true;
                this.canvas.classList.add('placing');
                document.getElementById('placeMinerBtn').classList.add('placing');
            }
        });
        
        document.getElementById('testModeBtn')?.addEventListener('click', () => {
            this.toggleTestMode();
        });
        
        document.getElementById('completeBaseBtn')?.addEventListener('click', () => {
            this.completeBase();
        });
        
        document.getElementById('newGameBtn')?.addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('continueEndlessBtn')?.addEventListener('click', () => {
            this.startEndlessMode();
        });
        
        document.getElementById('exitEndlessBtn')?.addEventListener('click', () => {
            this.exitEndlessMode();
        });
        
        document.getElementById('upgrade-clickPower')?.addEventListener('click', () => {
            this.buyUpgrade('clickPower');
        });
        
        document.getElementById('upgrade-clickRadius')?.addEventListener('click', () => {
            this.buyUpgrade('clickRadius');
        });
        
        document.getElementById('upgrade-minerPower')?.addEventListener('click', () => {
            this.buyUpgrade('minerPower');
        });
        
        document.getElementById('upgrade-minerRadius')?.addEventListener('click', () => {
            this.buyUpgrade('minerRadius');
        });
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.placingMiner) {
            this.placeMiner(x, y);
        } else {
            this.mineAsteroids(x, y);
        }
    }
    
    placeMiner(x, y) {
        if (this.iron >= this.minerCost) {
            this.iron -= this.minerCost;
            this.miners.push({
                x: x,
                y: y,
                radius: this.minerRadius,
                power: this.minerPower,
                lastMine: Date.now()
            });
            
            this.placingMiner = false;
            this.canvas.classList.remove('placing');
            document.getElementById('placeMinerBtn').classList.remove('placing');
            this.updateUI();
        }
    }
    
    mineAsteroids(x, y) {
        const radius = this.clickRadius;
        let minedTotal = 0;
        
        this.asteroids.forEach(asteroid => {
            const dist = Math.hypot(asteroid.x - x, asteroid.y - y);
            if (dist <= asteroid.size + radius) {
                const mined = Math.min(this.clickPower, asteroid.iron);
                asteroid.iron -= mined;
                minedTotal += mined;
            }
        });
        
        if (minedTotal > 0) {
            this.iron += minedTotal;
            this.showClickEffect(x, y, minedTotal);
            this.updateUI();
        }
        
        this.asteroids = this.asteroids.filter(a => a.iron > 0);
    }
    
    showClickEffect(x, y, amount) {
        const effect = document.getElementById('clickEffect');
        effect.textContent = `+${amount} ⚙️`;
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        effect.classList.add('show');
        
        setTimeout(() => {
            effect.classList.remove('show');
        }, 500);
    }
    
    buyUpgrade(type) {
        const upgrade = this.upgrades[type];
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, upgrade.level));
        
        if (this.iron >= cost) {
            this.iron -= cost;
            upgrade.level++;
            
            switch(type) {
                case 'clickPower':
                    this.clickPower++;
                    break;
                case 'clickRadius':
                    this.clickRadius += 20;
                    break;
                case 'minerPower':
                    this.minerPower++;
                    this.miners.forEach(m => m.power = this.minerPower);
                    break;
                case 'minerRadius':
                    this.minerRadius += 30;
                    this.miners.forEach(m => m.radius = this.minerRadius);
                    break;
            }
            
            this.updateUI();
        }
    }
    
    toggleTestMode() {
        this.testMode = !this.testMode;
        
        if (this.testMode) {
            this.minerCost = 1;
            this.baseCost = 1;
            this.upgrades.clickPower.baseCost = 1;
            this.upgrades.clickRadius.baseCost = 1;
            this.upgrades.minerPower.baseCost = 1;
            this.upgrades.minerRadius.baseCost = 1;
            
            document.getElementById('testModeBtn').style.background = 'var(--gradient-accent)';
        } else {
            this.minerCost = 50;
            this.baseCost = 50000;
            this.upgrades.clickPower.baseCost = 10;
            this.upgrades.clickRadius.baseCost = 25;
            this.upgrades.minerPower.baseCost = 50;
            this.upgrades.minerRadius.baseCost = 75;
            
            document.getElementById('testModeBtn').style.background = '';
        }
        
        this.updateUI();
    }
    
    completeBase() {
        if (this.iron >= this.baseCost) {
            this.showWinModal();
        }
    }
    
    showWinModal() {
        document.getElementById('finalIron').textContent = Math.floor(this.iron);
        document.getElementById('finalMiners').textContent = this.miners.length;
        
        if (this.endlessMode) {
            document.getElementById('winMessage').textContent = `🎉 Elérted a(z) ${this.baseCost} vasos célt!`;
            document.getElementById('modeChoiceButtons').style.display = 'none';
            document.getElementById('endlessInfo').style.display = 'block';
            document.getElementById('endlessFooter').style.display = 'flex';
            
            this.endlessGoal = this.baseCost * 2;
            this.baseCost = this.endlessGoal;
            document.getElementById('nextGoal').textContent = this.endlessGoal;
        } else {
            document.getElementById('winMessage').textContent = '🎉 Gratulálok! Sikeresen összegyűjtötted az alaphoz szükséges vasat!';
            document.getElementById('modeChoiceButtons').style.display = 'flex';
            document.getElementById('endlessInfo').style.display = 'none';
            document.getElementById('endlessFooter').style.display = 'none';
        }
        
        document.getElementById('winModal').classList.add('show');
    }
    
    startEndlessMode() {
        this.endlessMode = true;
        this.endlessGoal = 100000;
        this.baseCost = this.endlessGoal;
        document.getElementById('winModal').classList.remove('show');
        this.saveGame();
        this.updateUI();
    }
    
    exitEndlessMode() {
        this.restart();
    }
    
    restart() {
        localStorage.removeItem('miningGameSave');
        location.reload();
    }
    
    spawnAsteroids() {
        setInterval(() => {
            if (this.asteroids.length < 10) {
                const edge = Math.floor(Math.random() * 4);
                let x, y, vx, vy;
                
                switch(edge) {
                    case 0:
                        x = Math.random() * this.canvas.width;
                        y = -30;
                        vx = (Math.random() - 0.5) * 2;
                        vy = Math.random() * 2 + 0.5;
                        break;
                    case 1:
                        x = this.canvas.width + 30;
                        y = Math.random() * this.canvas.height;
                        vx = -(Math.random() * 2 + 0.5);
                        vy = (Math.random() - 0.5) * 2;
                        break;
                    case 2:
                        x = Math.random() * this.canvas.width;
                        y = this.canvas.height + 30;
                        vx = (Math.random() - 0.5) * 2;
                        vy = -(Math.random() * 2 + 0.5);
                        break;
                    case 3:
                        x = -30;
                        y = Math.random() * this.canvas.height;
                        vx = Math.random() * 2 + 0.5;
                        vy = (Math.random() - 0.5) * 2;
                        break;
                }
                
                this.asteroids.push({
                    x: x,
                    y: y,
                    vx: vx,
                    vy: vy,
                    size: 15 + Math.random() * 15,
                    iron: 10 + Math.floor(Math.random() * 20)
                });
            }
        }, 2000);
    }
    
    updateAsteroids() {
        this.asteroids.forEach(asteroid => {
            asteroid.x += asteroid.vx;
            asteroid.y += asteroid.vy;
        });
        
        this.asteroids = this.asteroids.filter(asteroid => {
            return asteroid.x > -50 && asteroid.x < this.canvas.width + 50 &&
                   asteroid.y > -50 && asteroid.y < this.canvas.height + 50 &&
                   asteroid.iron > 0;
        });
    }
    
    updateMiners() {
        const now = Date.now();
        
        this.miners.forEach(miner => {
            if (now - miner.lastMine >= 1000) {
                const nearbyAsteroids = this.asteroids.filter(asteroid => {
                    const dist = Math.hypot(asteroid.x - miner.x, asteroid.y - miner.y);
                    return dist <= miner.radius && asteroid.iron > 0;
                });
                
                if (nearbyAsteroids.length > 0) {
                    const target = nearbyAsteroids[0];
                    const mined = Math.min(miner.power, target.iron);
                    target.iron -= mined;
                    this.iron += mined;
                    miner.lastMine = now;
                }
            }
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawAsteroids();
        this.drawMiners();
    }
    
    drawAsteroids() {
        this.asteroids.forEach(asteroid => {
            this.ctx.save();
            this.ctx.fillStyle = '#8b7355';
            this.ctx.beginPath();
            this.ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(asteroid.iron, asteroid.x, asteroid.y);
            this.ctx.restore();
        });
    }
    
    drawMiners() {
        this.miners.forEach(miner => {
            this.ctx.save();
            
            this.ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(miner.x, miner.y, miner.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.fillStyle = '#22d3ee';
            this.ctx.beginPath();
            this.ctx.arc(miner.x, miner.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🏗️', miner.x, miner.y);
            
            this.ctx.restore();
        });
    }
    
    updateUI() {
        document.getElementById('ironCount').textContent = Math.floor(this.iron);
        document.getElementById('clickPower').textContent = this.clickPower;
        document.getElementById('minerCost').textContent = this.minerCost;
        document.getElementById('minerCount').textContent = this.miners.length;
        
        const productionRate = this.miners.length * this.minerPower;
        document.getElementById('productionRate').textContent = productionRate;
        
        document.getElementById('asteroidCount').textContent = this.asteroids.length;
        
        const baseProgress = (this.iron / this.baseCost) * 100;
        document.getElementById('baseProgress').style.width = `${Math.min(baseProgress, 100)}%`;
        
        if (this.endlessMode) {
            document.getElementById('baseProgressText').textContent = `${Math.floor(this.iron)} / ${this.baseCost} (♾️ Endless)`;
        } else {
            document.getElementById('baseProgressText').textContent = `${Math.floor(this.iron)} / ${this.baseCost}`;
        }
        
        const completeBtn = document.getElementById('completeBaseBtn');
        completeBtn.disabled = this.iron < this.baseCost;
        
        const placeMinerBtn = document.getElementById('placeMinerBtn');
        placeMinerBtn.disabled = this.iron < this.minerCost;
        
        Object.keys(this.upgrades).forEach(type => {
            const upgrade = this.upgrades[type];
            const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, upgrade.level));
            const btn = document.getElementById(`upgrade-${type}`);
            const costEl = document.getElementById(`${type}Cost`);
            
            if (btn) btn.disabled = this.iron < cost;
            if (costEl) costEl.textContent = cost;
        });
        
        this.saveGame();
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.updateAsteroids();
            this.updateMiners();
            this.draw();
            this.updateUI();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MiningGame();
});
