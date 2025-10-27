class MiningGame {
    constructor() {
        this.iron = 0;
        this.clickPower = 1;
        this.clickRadius = 0;
        this.minerCost = 50;
        this.minerCount = 0;
        this.minerPower = 1;
        this.minerRadius = 100;
        this.baseCost = 50000;
        this.testMode = false;
        this.endlessMode = false;
        this.endlessGoal = 50000;
        
        this.asteroidValueMultiplier = 1.0;
        this.asteroidSpawnRate = 2000;
        
        this.productionHistory = [];
        this.lastProductionTime = Date.now();
        
        this.asteroids = [];
        this.miners = [];
        this.placingMiner = false;
        
        this.bases = [];
        this.placingBase = false;
        this.baseLevel = 1;
        
        this.theme = localStorage.getItem('theme') || 'dark';
        
        this.upgrades = {
            clickPower: { level: 0, baseCost: 10, multiplier: 1.5 },
            clickRadius: { level: 0, baseCost: 25, multiplier: 1.5 },
            minerPower: { level: 0, baseCost: 50, multiplier: 1.5 },
            minerRadius: { level: 0, baseCost: 75, multiplier: 1.5 },
            asteroidValue: { level: 0, baseCost: 100, multiplier: 1.6 },
            spawnRate: { level: 0, baseCost: 150, multiplier: 1.7 }
        };
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.loadGame();
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Rendszeres canvas méret ellenőrzés (zoom változásokhoz)
        setInterval(() => this.resizeCanvas(), 500);
        
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
                
                // Ha reset flag van, ne töltsük be a mentést
                if (data.resetFlag) {
                    localStorage.removeItem('miningGameSave');
                    return;
                }
                
                this.iron = data.iron || 0;
                this.clickPower = data.clickPower || 1;
                this.clickRadius = data.clickRadius || 0;
                this.minerPower = data.minerPower || 1;
                this.minerRadius = data.minerRadius || 100;
                this.minerCount = data.minerCount || 0;
                this.minerCost = data.minerCost || 50;
                this.miners = data.miners || [];
                this.upgrades = data.upgrades || this.upgrades;
                this.endlessMode = data.endlessMode || false;
                this.endlessGoal = data.endlessGoal || 50000;
                this.asteroidValueMultiplier = data.asteroidValueMultiplier || 1.0;
                this.asteroidSpawnRate = data.asteroidSpawnRate || 2000;
                this.baseCost = data.baseCost || 50000;
                this.bases = data.bases || [];
                this.baseLevel = data.baseLevel || 1;
                
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
                minerCount: this.minerCount,
                minerCost: this.minerCost,
                miners: this.miners,
                upgrades: this.upgrades,
                endlessMode: this.endlessMode,
                endlessGoal: this.endlessGoal,
                asteroidValueMultiplier: this.asteroidValueMultiplier,
                asteroidSpawnRate: this.asteroidSpawnRate,
                baseCost: this.baseCost,
                bases: this.bases,
                baseLevel: this.baseLevel,
                timestamp: Date.now()
            };
            localStorage.setItem('miningGameSave', JSON.stringify(saveData));
        } catch (e) {
            console.error('Hiba a játék mentésekor:', e);
        }
    }
    
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
        }, 5000);
    }
    
    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const newWidth = rect.width;
        const newHeight = rect.height;
        
        // Csak akkor frissítsük ha tényleg változott a méret
        if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
        }
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
            this.startPlacingBase();
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
        
        document.getElementById('upgrade-asteroidValue')?.addEventListener('click', () => {
            this.buyUpgrade('asteroidValue');
        });
        
        document.getElementById('upgrade-spawnRate')?.addEventListener('click', () => {
            this.buyUpgrade('spawnRate');
        });
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.placingMiner) {
            this.placeMiner(x, y);
        } else if (this.placingBase) {
            this.placeBase(x, y);
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
            
            this.minerCount++;
            this.minerCost = Math.floor(50 * Math.pow(1.15, this.minerCount));
            
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
                case 'asteroidValue':
                    this.asteroidValueMultiplier += 0.25;
                    break;
                case 'spawnRate':
                    this.asteroidSpawnRate = Math.max(200, Math.floor(this.asteroidSpawnRate * 0.85));
                    this.restartAsteroidSpawner();
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
            this.upgrades.asteroidValue.baseCost = 1;
            this.upgrades.spawnRate.baseCost = 1;
            
            document.getElementById('testModeBtn').style.background = 'var(--gradient-accent)';
        } else {
            this.minerCost = 50;
            this.baseCost = 50000;
            this.upgrades.clickPower.baseCost = 10;
            this.upgrades.clickRadius.baseCost = 25;
            this.upgrades.minerPower.baseCost = 50;
            this.upgrades.minerRadius.baseCost = 75;
            this.upgrades.asteroidValue.baseCost = 100;
            this.upgrades.spawnRate.baseCost = 150;
            
            document.getElementById('testModeBtn').style.background = '';
        }
        
        this.updateUI();
    }
    
    completeBase() {
        if (this.iron >= this.baseCost) {
            this.showWinModal();
        }
    }
    
    startPlacingBase() {
        if (this.iron >= this.baseCost) {
            // Ha még nincs bázis, akkor rakjunk le egyet
            if (this.bases.length === 0 && !this.placingBase) {
                this.placingBase = true;
                this.canvas.classList.add('placing-base');
                document.getElementById('completeBaseBtn').textContent = '📍 Kattints a térképre a bázis lerakásához!';
            } else if (this.bases.length > 0) {
                // Ha már van bázis, akkor fejlesszük
                this.upgradeBase();
            }
        }
    }
    
    placeBase(x, y) {
        if (this.iron >= this.baseCost && this.bases.length === 0) {
            this.iron -= this.baseCost;
            
            // Bázis boostok szintjétől függően
            const boosts = this.calculateBaseBoosts(1);
            
            this.bases.push({
                x: x,
                y: y,
                level: 1,
                radius: 80,
                boosts: boosts
            });
            
            // Alkalmazzuk a boostokat
            this.applyBaseBoosts(boosts);
            
            this.placingBase = false;
            this.canvas.classList.remove('placing-base');
            
            // Endless mode aktiválása
            this.endlessMode = true;
            this.baseCost = this.baseCost * 2;
            this.baseLevel = 2;
            
            this.saveGame();
            this.updateUI();
        }
    }
    
    upgradeBase() {
        if (this.iron >= this.baseCost && this.bases.length > 0) {
            this.iron -= this.baseCost;
            
            // Frissítjük az első (egyetlen) bázist
            const base = this.bases[0];
            base.level++;
            
            // Új boostok kiszámítása
            const boosts = this.calculateBaseBoosts(base.level);
            base.boosts = boosts;
            
            // Alkalmazzuk az új boostokat
            this.applyBaseBoosts(boosts);
            
            // Következő szint költsége
            this.baseCost = this.baseCost * 2;
            this.baseLevel = base.level + 1;
            
            this.saveGame();
            this.updateUI();
        }
    }
    
    calculateBaseBoosts(level) {
        // Minden szint jobb boostokat ad
        return {
            clickPower: 5 * level,
            spawnRateBonus: 0.25 * level, // 25% gyorsabb spawn per szint
            asteroidValueBonus: 0.25 * level, // 25% több vas per szint
            minerPowerBonus: 2 * level // +2 vas/s a bányászoknak per szint
        };
    }
    
    applyBaseBoosts(boosts) {
        // Kattintás erő növelése
        this.clickPower += boosts.clickPower;
        
        // Aszteroida érték növelése
        this.asteroidValueMultiplier += boosts.asteroidValueBonus;
        
        // Spawn rate növelése
        const spawnRateReduction = 1 - boosts.spawnRateBonus;
        this.asteroidSpawnRate = Math.max(200, Math.floor(this.asteroidSpawnRate * spawnRateReduction));
        this.restartAsteroidSpawner();
        
        // Bányász erő növelése
        this.minerPower += boosts.minerPowerBonus;
        this.miners.forEach(m => m.power = this.minerPower);
    }
    
    showWinModal() {
        document.getElementById('finalIron').textContent = Math.floor(this.iron);
        document.getElementById('finalMiners').textContent = this.miners.length;
        
        if (this.endlessMode) {
            document.getElementById('winMessage').textContent = `🎉 Elérted a(z) ${this.baseCost} vasos célt!`;
            document.getElementById('modeChoiceButtons').style.display = 'flex';
            document.getElementById('endlessInfo').style.display = 'none';
            document.getElementById('endlessFooter').style.display = 'none';
            
            const nextGoal = this.baseCost * 2;
            document.getElementById('continueEndlessBtn').innerHTML = `♾️ Tovább (cél: ${nextGoal} vas)`;
        } else {
            document.getElementById('winMessage').textContent = '🎉 Gratulálok! Sikeresen összegyűjtötted az alaphoz szükséges vasat!';
            document.getElementById('modeChoiceButtons').style.display = 'flex';
            document.getElementById('endlessInfo').style.display = 'none';
            document.getElementById('endlessFooter').style.display = 'none';
            document.getElementById('continueEndlessBtn').innerHTML = '♾️ Endless Mode (folytatás)';
        }
        
        document.getElementById('winModal').classList.add('show');
    }
    
    startEndlessMode() {
        if (!this.endlessMode) {
            this.endlessMode = true;
            this.baseCost = this.baseCost * 2;
        } else {
            this.baseCost = this.baseCost * 2;
        }
        document.getElementById('winModal').classList.remove('show');
        this.saveGame();
        this.updateUI();
    }
    
    exitEndlessMode() {
        this.restart();
    }
    
    restart() {
        // Leállítjuk az auto-save-t hogy ne írja felül a reset flag-et
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Beállítjuk a reset flag-et a mentésben
        const resetSave = {
            resetFlag: true,
            iron: 0,
            clickPower: 1,
            clickRadius: 0,
            minerPower: 1,
            minerRadius: 100,
            minerCount: 0,
            minerCost: 50,
            miners: [],
            bases: [],
            baseLevel: 1,
            baseCost: 50000,
            upgrades: {
                clickPower: { level: 0, baseCost: 10, multiplier: 1.5 },
                clickRadius: { level: 0, baseCost: 25, multiplier: 1.5 },
                minerPower: { level: 0, baseCost: 50, multiplier: 1.5 },
                minerRadius: { level: 0, baseCost: 75, multiplier: 1.5 },
                asteroidValue: { level: 0, baseCost: 100, multiplier: 1.6 },
                spawnRate: { level: 0, baseCost: 150, multiplier: 1.7 }
            },
            endlessMode: false,
            endlessGoal: 50000,
            asteroidValueMultiplier: 1.0,
            asteroidSpawnRate: 2000
        };
        localStorage.setItem('miningGameSave', JSON.stringify(resetSave));
        
        // Kis késleltetés hogy biztosan mentve legyen
        setTimeout(() => {
            location.reload();
        }, 100);
    }
    
    spawnAsteroids() {
        this.asteroidSpawnerInterval = setInterval(() => {
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
                    iron: Math.floor((10 + Math.floor(Math.random() * 20)) * this.asteroidValueMultiplier)
                });
            }
        }, this.asteroidSpawnRate);
    }
    
    restartAsteroidSpawner() {
        if (this.asteroidSpawnerInterval) {
            clearInterval(this.asteroidSpawnerInterval);
        }
        this.spawnAsteroids();
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
                    
                    // Termelés tracking
                    this.productionHistory.push({
                        amount: mined,
                        timestamp: now
                    });
                }
            }
        });
        
        // Tisztítsuk ki a 60 másodpercnél régebbi bejegyzéseket
        const cutoffTime = now - 60000;
        this.productionHistory = this.productionHistory.filter(entry => entry.timestamp > cutoffTime);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBases();
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
    
    drawBases() {
        this.bases.forEach(base => {
            this.ctx.save();
            
            // Külső kör (boostok hatósugara)
            this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(base.x, base.y, base.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Bázis épület
            this.ctx.fillStyle = '#10b981';
            this.ctx.beginPath();
            this.ctx.arc(base.x, base.y, 25, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Bázis ikon
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 28px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🏢', base.x, base.y);
            
            // Szint megjelenítése
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Inter';
            this.ctx.fillText(`Lv.${base.level}`, base.x, base.y + 40);
            
            this.ctx.restore();
        });
    }
    
    updateUI() {
        document.getElementById('ironCount').textContent = Math.floor(this.iron);
        document.getElementById('clickPower').textContent = this.clickPower;
        document.getElementById('minerCost').textContent = this.minerCost;
        document.getElementById('minerCount').textContent = this.miners.length;
        
        // Bázisok száma és jelenlegi szint
        const baseCountEl = document.getElementById('baseCount');
        if (baseCountEl) {
            if (this.bases.length > 0) {
                baseCountEl.textContent = `Lv.${this.bases[0].level}`;
            } else {
                baseCountEl.textContent = '0';
            }
        }
        
        const nextBaseLevelEl = document.getElementById('nextBaseLevel');
        if (nextBaseLevelEl) {
            if (this.bases.length > 0) {
                nextBaseLevelEl.textContent = this.bases[0].level + 1;
            } else {
                nextBaseLevelEl.textContent = '1';
            }
        }
        
        // Következő bázis boostjainak megjelenítése
        const baseBoostsListEl = document.getElementById('baseBoostsList');
        if (baseBoostsListEl && this.iron >= this.baseCost * 0.5) {
            const nextLevel = this.bases.length > 0 ? this.bases[0].level + 1 : 1;
            const nextBoosts = this.calculateBaseBoosts(nextLevel);
            baseBoostsListEl.innerHTML = `
                <p style="color: var(--accent-color); margin: 0.25rem 0;"><strong>Következő boostok (Lv.${nextLevel}):</strong></p>
                <p style="margin: 0.25rem 0;">💪 +${nextBoosts.clickPower} vas/kattintás</p>
                <p style="margin: 0.25rem 0;">⏱️ +${(nextBoosts.spawnRateBonus * 100).toFixed(0)}% spawn sebesség</p>
                <p style="margin: 0.25rem 0;">💎 +${(nextBoosts.asteroidValueBonus * 100).toFixed(0)}% aszteroida érték</p>
                <p style="margin: 0.25rem 0;">⚡ +${nextBoosts.minerPowerBonus} vas/s bányászoknak</p>
            `;
        } else if (baseBoostsListEl) {
            baseBoostsListEl.innerHTML = '';
        }
        
        // Számoljuk ki az elmúlt 60 mp termelését
        const productionLast60s = this.productionHistory.reduce((sum, entry) => sum + entry.amount, 0);
        const productionRate = Math.round(productionLast60s / 60);
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
        
        // Bázis gomb szövege
        if (this.placingBase) {
            completeBtn.innerHTML = '<span class="btn-icon">📍</span> Kattints a térképre!';
        } else if (this.bases.length === 0) {
            completeBtn.innerHTML = `<span class="btn-icon">🏢</span><span class="btn-text">Bázis építése</span><span class="btn-cost" id="baseCostDisplay">${this.baseCost}</span><span class="btn-icon">⚙️</span>`;
        } else {
            completeBtn.innerHTML = `<span class="btn-icon">⬆️</span><span class="btn-text">Bázis fejlesztés (Lv.${this.baseLevel})</span><span class="btn-cost" id="baseCostDisplay">${this.baseCost}</span><span class="btn-icon">⚙️</span>`;
        }
        
        const baseCostDisplay = document.getElementById('baseCostDisplay');
        if (baseCostDisplay) baseCostDisplay.textContent = this.baseCost;
        
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

let zeneJatszo;

function onYouTubeIframeAPIReady() {
    console.log('🎬 YouTube API betöltve');
    zeneJatszo = new ZeneJatszo();
    zeneJatszo.jatszoInicializalas();
}

document.addEventListener('DOMContentLoaded', () => {
    new MiningGame();
    
    // YouTube API fallback ha már betöltve van
    if (window.YT && window.YT.Player) {
        onYouTubeIframeAPIReady();
    }
    
    // Zene gomb kezelése
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (zeneJatszo) {
                zeneJatszo.zeneValt();
            } else {
                console.warn('⚠️ Zenelejátszó még nem inicializálódott');
            }
        });
    }
});
