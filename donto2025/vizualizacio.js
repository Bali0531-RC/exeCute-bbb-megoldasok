class VizualizacioApp {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark';
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.feladatData = null;
        this.megoldas = null;
        this.animacioState = {
            kor: 0,
            maxKor: 0,
            playing: false,
            speed: 5,
            hajok: [],
            raktar: 0,
            fejlesztesek: { move_speed: 0, capacity: 0, mining_speed: 0 },
            osszeErc: 0
        };
        
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        this.init();
    }

    init() {
        this.initTheme();
        this.bindEvents();
        this.initCanvasControls();
        this.feladatokBetoltese();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    initCanvasControls() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.dragOffsetX = this.offsetX;
            this.dragOffsetY = this.offsetY;
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.dragStartX;
            const dy = e.clientY - this.dragStartY;
            this.offsetX = this.dragOffsetX + dx;
            this.offsetY = this.dragOffsetY + dy;
            this.render();
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = this.scale * zoomFactor;
            
            if (newScale >= 0.1 && newScale <= 10) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                this.offsetX = mouseX - (mouseX - this.offsetX) * zoomFactor;
                this.offsetY = mouseY - (mouseY - this.offsetY) * zoomFactor;
                this.scale = newScale;
                
                this.render();
            }
        });
        
        this.canvas.style.cursor = 'grab';
    }

    initTheme() {
        this.applyTheme(this.theme);
        
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme(this.theme);
            localStorage.setItem('theme', this.theme);
            this.render();
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
        document.getElementById('backButton')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('kodBeallitasBtn')?.addEventListener('click', () => {
            this.csapatKodBeallitas();
        });

        document.getElementById('betoltesBtn')?.addEventListener('click', () => {
            this.feladatBetoltes();
        });

        document.getElementById('playBtn')?.addEventListener('click', () => {
            this.play();
        });

        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            this.pause();
        });

        document.getElementById('resetBtn')?.addEventListener('click', () => {
            this.reset();
        });

        document.getElementById('sebessegSlider')?.addEventListener('input', (e) => {
            this.animacioState.speed = parseInt(e.target.value);
            document.getElementById('sebessegLabel').textContent = `${this.animacioState.speed}x`;
        });
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        this.canvas.width = width;
        this.canvas.height = Math.min(600, width * 0.75);
        this.render();
    }

    csapatKodBeallitas() {
        const kod = prompt('Add meg a csapat kódot:');
        if (kod && kod.trim()) {
            api.setTeamcode(kod.trim());
            this.feladatokBetoltese();
        }
    }

    async feladatokBetoltese() {
        const select = document.getElementById('feladatSelect');
        
        if (!api.getTeamcode()) {
            select.innerHTML = '<option value="">🔒 Kérlek állítsd be a csapat kódot!</option>';
            return;
        }

        try {
            const response = await api.osszesFeladatLekerdezes();
            const feladatok = response.data.task_list || [];
            
            const select = document.getElementById('feladatSelect');
            select.innerHTML = '<option value="">Válassz feladatot...</option>';
            
            feladatok.forEach(f => {
                if (f.state !== 'LOCKED' && f.ID >= 6) {
                    const option = document.createElement('option');
                    option.value = f.ID;
                    option.textContent = `Feladat ${f.ID} (${f.state})`;
                    select.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Hiba a feladatok betöltésekor:', error);
        }
    }

    async feladatBetoltes() {
        const select = document.getElementById('feladatSelect');
        const taskId = select.value;
        
        if (!taskId) {
            alert('Válassz ki egy feladatot!');
            return;
        }

        try {
            const response = await api.feladatLekerdezes(taskId);
            this.feladatData = response.data;
            
            const kerdes = this.feladatData.questions[0];
            if (!kerdes || !kerdes.params) {
                alert('Hibás feladat struktúra!');
                return;
            }

            megoldo.feladatBetoltes(this.feladatData, response.hash);
            this.megoldas = megoldo.tobbHajoMegoldas(kerdes.params);
            
            this.initAnimacio(kerdes.params);
            this.render();
            
            document.getElementById('playBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('resetBtn').disabled = false;
            
            this.logParancs('Feladat betöltve', '✅');
        } catch (error) {
            console.error('Hiba a feladat betöltésekor:', error);
            alert('Hiba történt: ' + error.message);
        }
    }

    initAnimacio(params) {
        const poziciok = params.positions;
        const bazisok = poziciok.filter(p => p.type === 'Base');
        const aszteroidak = poziciok.filter(p => p.type === 'Asteroid');
        
        this.animacioState.osszeErc = aszteroidak.reduce((sum, a) => sum + (a.quantity || a.amount || 0), 0);
        this.animacioState.maxKor = params.roundLimit || 1000;
        this.animacioState.kor = 0;
        this.animacioState.raktar = 0;
        this.animacioState.fejlesztesek = { move_speed: 0, capacity: 0, mining_speed: 0 };
        this.animacioState.alapHajoSebesseg = params.shipSpeed || 10;
        this.animacioState.alapHajoKapacitas = params.shipCapacity || 25;
        this.animacioState.alapBanyaszSebesseg = params.mineSpeed || 15;
        
        this.animacioState.aszteroridaMennyisegek = {};
        aszteroidak.forEach((a, idx) => {
            const asztIdx = poziciok.indexOf(a);
            this.animacioState.aszteroridaMennyisegek[asztIdx] = a.quantity || a.amount || 0;
        });
        
        this.animacioState.hajok = [];
        const hajokSzama = this.megoldas.commands ? this.megoldas.commands.length : (params.shipCount || 1);
        
        for (let i = 0; i < hajokSzama; i++) {
            const startPos = bazisok[i % bazisok.length];
            this.animacioState.hajok.push({
                id: i,
                x: startPos.x,
                y: startPos.y,
                targetX: startPos.x,
                targetY: startPos.y,
                rakomany: 0,
                maxRakomany: params.shipCapacity || 25,
                sebesseg: params.shipSpeed || 10,
                banyaszSebesseg: params.mineSpeed || 15,
                pozicioIndex: poziciok.indexOf(startPos),
                parancsIndex: 0,
                parancsok: this.megoldas.commands[i] || []
            });
        }
        
        this.calculateViewport(poziciok);
        this.frissitStatisztikak();
    }

    calculateViewport(poziciok) {
        if (poziciok.length === 0) return;
        
        const xs = poziciok.map(p => p.x);
        const ys = poziciok.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        const width = maxX - minX;
        const height = maxY - minY;
        const padding = 50;
        
        const scaleX = (this.canvas.width - padding * 2) / width;
        const scaleY = (this.canvas.height - padding * 2) / height;
        this.scale = Math.min(scaleX, scaleY, 5);
        
        this.offsetX = padding - minX * this.scale + (this.canvas.width - width * this.scale) / 2;
        this.offsetY = padding - minY * this.scale + (this.canvas.height - height * this.scale) / 2;
    }

    render() {
        if (!this.feladatData) {
            this.renderPlaceholder();
            return;
        }

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const kerdes = this.feladatData.questions[0];
        const poziciok = kerdes.params.positions;
        
        this.renderGrid();
        this.renderPoziciok(poziciok);
        this.renderHajok();
    }

    renderPlaceholder() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = this.theme === 'dark' ? '#2a2a3e' : '#e0e0e0';
        ctx.font = '24px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Válassz és tölts be egy feladatot', this.canvas.width / 2, this.canvas.height / 2);
        ctx.font = '16px Inter';
        ctx.fillStyle = this.theme === 'dark' ? '#666' : '#999';
        ctx.fillText('a bal oldali panelről', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    renderGrid() {
        const ctx = this.ctx;
        const gridSize = 50 * this.scale;
        
        ctx.strokeStyle = this.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    renderPoziciok(poziciok) {
        const ctx = this.ctx;
        
        poziciok.forEach((poz, idx) => {
            const x = poz.x * this.scale + this.offsetX;
            const y = poz.y * this.scale + this.offsetY;
            
            if (poz.type === 'Base') {
                ctx.fillStyle = this.theme === 'dark' ? '#4CAF50' : '#2E7D32';
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = this.theme === 'dark' ? '#66BB6A' : '#43A047';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                ctx.fillStyle = this.theme === 'dark' ? '#E8F5E9' : '#1B5E20';
                ctx.font = 'bold 10px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('B', x, y);
                
            } else if (poz.type === 'Asteroid') {
                const aktualisMennyiseg = this.animacioState.aszteroridaMennyisegek[idx] || 0;
                const eredetiMennyiseg = poz.quantity || poz.amount || 0;
                const radius = Math.max(8, Math.min(20, eredetiMennyiseg / 50));
                
                const szazalek = eredetiMennyiseg > 0 ? aktualisMennyiseg / eredetiMennyiseg : 0;
                const szin = szazalek > 0.5 ? '#FF9800' : szazalek > 0 ? '#FF5722' : '#424242';
                
                ctx.fillStyle = this.theme === 'dark' ? szin : (szazalek > 0 ? '#F57C00' : '#616161');
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = this.theme === 'dark' ? '#FFF3E0' : '#E65100';
                ctx.font = 'bold 9px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.floor(aktualisMennyiseg), x, y);
            }
            
            ctx.fillStyle = this.theme === 'dark' ? '#888' : '#666';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(idx, x, y + 25);
        });
    }

    renderHajok() {
        const ctx = this.ctx;
        
        this.animacioState.hajok.forEach((hajo, idx) => {
            const x = hajo.x * this.scale + this.offsetX;
            const y = hajo.y * this.scale + this.offsetY;
            
            ctx.fillStyle = this.theme === 'dark' ? '#2196F3' : '#1565C0';
            ctx.beginPath();
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x - 8, y + 8);
            ctx.lineTo(x + 8, y + 8);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = this.theme === 'dark' ? '#64B5F6' : '#0D47A1';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            if (hajo.rakomany > 0) {
                const rakomanySzazalek = hajo.rakomany / hajo.maxRakomany;
                ctx.fillStyle = '#FFC107';
                ctx.fillRect(x - 6, y + 10, 12 * rakomanySzazalek, 3);
            }
            
            ctx.fillStyle = this.theme === 'dark' ? '#E3F2FD' : '#0D47A1';
            ctx.font = 'bold 9px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(idx, x, y + 20);
        });
    }

    play() {
        this.animacioState.playing = true;
        this.animate();
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
    }

    pause() {
        this.animacioState.playing = false;
        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }

    reset() {
        this.pause();
        const kerdes = this.feladatData.questions[0];
        this.initAnimacio(kerdes.params);
        this.render();
        document.getElementById('playBtn').disabled = false;
    }

    animate() {
        if (!this.animacioState.playing) return;
        
        if (this.animacioState.kor >= this.animacioState.maxKor) {
            this.pause();
            this.logParancs('Animáció befejezve', '✅');
            return;
        }
        
        this.animacioState.kor++;
        this.executeKor();
        this.render();
        this.frissitStatisztikak();
        
        const delay = 1000 / this.animacioState.speed;
        setTimeout(() => this.animate(), delay);
    }

    executeKor() {
        this.animacioState.hajok.forEach((hajo, idx) => {
            if (hajo.parancsIndex >= hajo.parancsok.length) return;
            
            const parancs = hajo.parancsok[hajo.parancsIndex];
            
            if (parancs.command === 'STARTFROM') {
                hajo.pozicioIndex = parancs.position;
                hajo.parancsIndex++;
            } else if (parancs.command === 'MOVE') {
                const kerdes = this.feladatData.questions[0];
                const cel = kerdes.params.positions[parancs.position];
                hajo.targetX = cel.x;
                hajo.targetY = cel.y;
                
                const dx = hajo.targetX - hajo.x;
                const dy = hajo.targetY - hajo.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 1) {
                    hajo.x = hajo.targetX;
                    hajo.y = hajo.targetY;
                    hajo.pozicioIndex = parancs.position;
                    
                    if (cel.type === 'Base' && hajo.rakomany > 0) {
                        this.animacioState.raktar += hajo.rakomany;
                        this.logParancs(`Hajó ${idx} kirakodott ${hajo.rakomany} ércet a bázisra`, '📦');
                        hajo.rakomany = 0;
                    }
                    
                    hajo.parancsIndex++;
                    this.logParancs(`Hajó ${idx} megérkezett ${parancs.position}`, '🚢');
                } else {
                    const speed = Math.max(1, (hajo.sebesseg || 10) / 5);
                    hajo.x += (dx / dist) * speed;
                    hajo.y += (dy / dist) * speed;
                }
            } else if (parancs.command === 'MINE') {
                if (!parancs.initBanyaszat) {
                    parancs.initBanyaszat = true;
                    const banyaszSebesseg = hajo.banyaszSebesseg || 15;
                    const osszesKor = parancs.rounds;
                    const maxBanyaszat = banyaszSebesseg * osszesKor;
                    const banyaszatMenny = Math.min(maxBanyaszat, hajo.maxRakomany - hajo.rakomany);
                    const asztIdx = hajo.pozicioIndex;
                    const elerheto = this.animacioState.aszteroridaMennyisegek[asztIdx] || 0;
                    const tenylegBanyaszott = Math.min(banyaszatMenny, elerheto);
                    
                    hajo.rakomany += tenylegBanyaszott;
                    this.animacioState.aszteroridaMennyisegek[asztIdx] -= tenylegBanyaszott;
                    
                    this.logParancs(`Hajó ${idx} bányászat: ${tenylegBanyaszott} érc (${osszesKor} kör)`, '⛏️');
                }
                
                parancs.rounds--;
                if (parancs.rounds <= 0) {
                    hajo.parancsIndex++;
                    delete parancs.initBanyaszat;
                }
            } else if (parancs.command === 'UNLOAD') {
                this.animacioState.raktar += hajo.rakomany;
                this.logParancs(`Hajó ${idx} kirakodott ${hajo.rakomany} ércet`, '📦');
                hajo.rakomany = 0;
                hajo.parancsIndex++;
            } else if (parancs.command === 'UPGRADE') {
                const attr = parancs.attribute;
                const KOLTSEGEK = { move_speed: 70, capacity: 100, mining_speed: 35 };
                const ERTEKEK = { move_speed: 4, capacity: 15, mining_speed: 8 };
                const cost = KOLTSEGEK[attr] || 0;
                
                if (this.animacioState.raktar >= cost) {
                    this.animacioState.raktar -= cost;
                    this.animacioState.fejlesztesek[attr]++;
                    
                    const ertek = ERTEKEK[attr] || 0;
                    if (attr === 'capacity') {
                        this.animacioState.alapHajoKapacitas += ertek;
                        this.animacioState.hajok.forEach(h => h.maxRakomany = this.animacioState.alapHajoKapacitas);
                    } else if (attr === 'move_speed') {
                        this.animacioState.alapHajoSebesseg += ertek;
                        this.animacioState.hajok.forEach(h => h.sebesseg = this.animacioState.alapHajoSebesseg);
                    } else if (attr === 'mining_speed') {
                        this.animacioState.alapBanyaszSebesseg += ertek;
                        this.animacioState.hajok.forEach(h => h.banyaszSebesseg = this.animacioState.alapBanyaszSebesseg);
                    }
                    
                    this.logParancs(`Fejlesztés: ${attr} +${ertek} → Új érték: ${attr === 'capacity' ? this.animacioState.alapHajoKapacitas : attr === 'move_speed' ? this.animacioState.alapHajoSebesseg : this.animacioState.alapBanyaszSebesseg} (${cost} érc)`, '⚡');
                    this.frissitHajokLista();
                } else {
                    this.logParancs(`Fejlesztés sikertelen: ${attr} (${cost} érc, raktár: ${this.animacioState.raktar})`, '❌');
                }
                hajo.parancsIndex++;
            } else if (parancs.command === 'BUY_SHIP') {
                const cost = parancs.cost || 300;
                if (this.animacioState.raktar >= cost) {
                    this.animacioState.raktar -= cost;
                    this.logParancs(`Új hajó vásárlás (${cost} érc)`, '🚀');
                } else {
                    this.logParancs(`Hajó vásárlás sikertelen (${cost} érc, raktár: ${this.animacioState.raktar})`, '❌');
                }
                hajo.parancsIndex++;
            } else {
                hajo.parancsIndex++;
            }
        });
    }

    frissitStatisztikak() {
        document.getElementById('statKor').textContent = `${this.animacioState.kor} / ${this.animacioState.maxKor}`;
        document.getElementById('statRaktar').textContent = `${this.animacioState.raktar} érc`;
        document.getElementById('statHajok').textContent = this.animacioState.hajok.length;
        
        const f = this.animacioState.fejlesztesek;
        document.getElementById('statFejlesztesek').textContent = `${f.move_speed}/${f.capacity}/${f.mining_speed}`;
        
        const szazalek = this.animacioState.osszeErc > 0 
            ? ((this.animacioState.raktar / this.animacioState.osszeErc) * 100).toFixed(1)
            : 0;
        document.getElementById('statSzazalek').textContent = `${szazalek}%`;
        
        this.frissitHajokLista();
    }

    frissitHajokLista() {
        const container = document.getElementById('hajokLista');
        container.innerHTML = '';
        
        this.animacioState.hajok.forEach((hajo, idx) => {
            const div = document.createElement('div');
            div.className = 'ship-item';
            div.innerHTML = `
                <div class="ship-item-header">
                    <span class="ship-item-name">Hajó ${idx}</span>
                    <span class="ship-item-cargo">${hajo.rakomany}/${hajo.maxRakomany} 📦</span>
                </div>
                <div class="ship-item-stats">
                    <span>Poz: (${hajo.x.toFixed(0)}, ${hajo.y.toFixed(0)})</span>
                    <span>Parancs: ${hajo.parancsIndex}/${hajo.parancsok.length}</span>
                </div>
                <div class="ship-item-stats">
                    <span>💨 ${hajo.sebesseg.toFixed(0)}</span>
                    <span>📦 ${hajo.maxRakomany}</span>
                    <span>⛏️ ${hajo.banyaszSebesseg.toFixed(0)}</span>
                </div>
            `;
            container.appendChild(div);
        });
    }

    logParancs(uzenet, icon = '📝') {
        const logContainer = document.getElementById('parancsLog');
        const entry = document.createElement('div');
        entry.className = 'log-entry current';
        entry.innerHTML = `
            <span class="timestamp">[${this.animacioState.kor}]</span>
            ${icon} ${uzenet}
        `;
        
        if (logContainer.children.length > 0) {
            logContainer.children[0].classList.remove('current');
        }
        
        logContainer.insertBefore(entry, logContainer.firstChild);
        
        if (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }
}

if (typeof megoldo === 'undefined') {
    const megoldo = new FeladatMegoldo();
}

document.addEventListener('DOMContentLoaded', () => {
    new VizualizacioApp();
});
