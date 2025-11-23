class DontoApp {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark';
        this.aktualisFeladatId = null;
        this.feladatok = [];
        this.pontszamokKey = 'donto2025_pontszamok';
        this.init();
    }

    getPontszamok() {
        const data = localStorage.getItem(this.pontszamokKey);
        return data ? JSON.parse(data) : {};
    }

    setPontszam(feladatId, pont) {
        const pontszamok = this.getPontszamok();
        pontszamok[feladatId] = pont;
        localStorage.setItem(this.pontszamokKey, JSON.stringify(pontszamok));
    }

    getPontszam(feladatId) {
        const pontszamok = this.getPontszamok();
        return pontszamok[feladatId] || 0;
    }

    init() {
        this.initTheme();
        this.bindEvents();
        this.csapatKodEllenorzes();
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
        document.getElementById('backButton')?.addEventListener('click', () => {
            window.location.href = '../index.html';
        });

        document.getElementById('kodBeallitasBtn')?.addEventListener('click', () => {
            this.csapatKodBeallitas();
        });

        document.getElementById('vizualizacioBtn')?.addEventListener('click', () => {
            window.location.href = 'vizualizacio.html';
        });

        document.getElementById('tesztBtn')?.addEventListener('click', () => {
            this.tavolsagTeszt();
        });

        document.getElementById('frissitesBtn')?.addEventListener('click', () => {
            this.feladatokBetoltese();
        });

        document.getElementById('automatikusBtn')?.addEventListener('click', () => {
            this.automatikusMegoldas();
        });

        document.getElementById('kuldesBtn')?.addEventListener('click', () => {
            this.megoldasKuldes();
        });

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.tabValtas(tab.dataset.tab));
        });
    }

    csapatKodEllenorzes() {
        const mentettKod = api.getTeamcode();
        if (mentettKod) {
            document.getElementById('csapatKod').textContent = `Csapat kód: ${mentettKod.substring(0, 10)}...`;
            this.feladatokBetoltese();
        } else {
            setTimeout(() => this.csapatKodBeallitas(), 500);
        }
    }

    csapatKodBeallitas() {
        const kod = prompt('Add meg a csapat kódot:');
        if (kod && kod.trim()) {
            api.setTeamcode(kod.trim());
            document.getElementById('csapatKod').textContent = `Csapat kód: ${kod.substring(0, 10)}...`;
            this.feladatokBetoltese();
        }
    }

    async feladatokBetoltese() {
        if (!api.getTeamcode()) {
            alert('Először állítsd be a csapat kódot!');
            return;
        }

        const lista = document.getElementById('feladatLista');
        lista.innerHTML = '<p class="loading">⏳ Feladatok betöltése...</p>';

        try {
            const response = await api.osszesFeladatLekerdezes();
            this.feladatok = response.data.task_list || [];
            
            if (this.feladatok.length === 0) {
                lista.innerHTML = '<p class="loading">Nincsenek elérhető feladatok</p>';
                return;
            }

            lista.innerHTML = '';
            let osszPont = 0;
            this.feladatok.forEach(feladat => {
                const maxPont = feladat.points || 100;
                const bestScore = feladat.bestScore || 0;
                osszPont += bestScore;
                
                const item = document.createElement('div');
                item.className = `task-item ${feladat.state}`;
                item.innerHTML = `
                    <div class="task-item-title">Feladat ${feladat.ID}</div>
                    <div class="task-item-info">
                        Állapot: ${feladat.state}<br>
                        Pontszám: ${bestScore} / ${maxPont}
                    </div>
                `;
                
                if (feladat.state !== 'LOCKED') {
                    item.addEventListener('click', () => this.feladatBetoltese(feladat.ID));
                }
                
                lista.appendChild(item);
            });
            
            document.getElementById('osszPontszamErtek').textContent = osszPont;
            document.getElementById('osszPontszam').style.display = 'flex';
        } catch (error) {
            console.error('Hiba a feladatok betöltésekor:', error);
            lista.innerHTML = '<p class="loading error">❌ Hiba történt a betöltés során</p>';
            alert('Hiba történt a feladatok betöltésekor: ' + error.message);
        }
    }

    async feladatBetoltese(taskId) {
        this.aktualisFeladatId = taskId;
        
        document.querySelectorAll('.task-item').forEach(item => item.classList.remove('active'));
        event.currentTarget?.classList.add('active');

        try {
            const response = await api.feladatLekerdezes(taskId);
            const data = response.data;
            const hash = response.hash;

            megoldo.feladatBetoltes(data, hash);

            this.feladatReszletekMegjelenites(data);
            this.kerdesekMegjelenites(data.questions);
            
            document.getElementById('kuldesBtn').disabled = false;
        } catch (error) {
            console.error('Hiba a feladat betöltésekor:', error);
            alert('Hiba történt a feladat betöltésekor: ' + error.message);
        }
    }

    feladatReszletekMegjelenites(data) {
        const container = document.getElementById('feladatReszletek');
        const pont = this.getPontszam(data.ID);
        
        let html = `
            <h2>Feladat ${data.ID}</h2>
            <div class="info-panel">
                <p><strong>Állapot:</strong> ${data.state}</p>
                <p><strong>Pontszám:</strong> ${pont} / 100</p>
                <p><strong>Kísérletek:</strong> ${data.attempt}</p>
                <p><strong>Szint:</strong> ${data.level || 1}</p>
                <p><strong>Szakasz:</strong> ${data.stage || 1}</p>
            </div>
        `;

        if (data.description) {
            const descUrl = `https://bitkozpont.mik.uni-pannon.hu/2025/${data.description}`;
            html += `
                <div class="description-section" style="margin-top: 1.5rem;">
                    <h3>📄 Feladat leírás</h3>
                    <button class="btn btn-primary" onclick="window.open('${descUrl}', '_blank')" style="margin-top: 1rem;">
                        <span class="icon">🔗</span>
                        Leírás megnyitása új ablakban
                    </button>
                    <p style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
                        A leírás egy külső oldalon nyílik meg biztonsági okokból.
                    </p>
                </div>
            `;
        }

        if (data.questions && data.questions.length > 0) {
            html += `
                <div class="questions-preview" style="margin-top: 1.5rem;">
                    <h3>❓ Kérdések előnézet</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        Összesen ${data.questions.length} kérdés
                    </p>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    kerdesekMegjelenites(questions) {
        const container = document.getElementById('kerdesekLista');
        
        if (!questions || questions.length === 0) {
            container.innerHTML = '<p class="loading">Nincsenek kérdések ehhez a feladathoz</p>';
            return;
        }

        container.innerHTML = '';
        
        questions.forEach((kerdes, index) => {
            const div = document.createElement('div');
            div.className = 'kerdes-item';
            
            let paramsHtml = '';
            if (kerdes.params) {
                if (kerdes.params.number1 !== undefined && kerdes.params.number2 !== undefined) {
                    const op = this.getMuveletJel(kerdes.params.type);
                    paramsHtml = `
                        <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius-small); margin: 1rem 0;">
                            <p style="font-size: 1.2rem; text-align: center;">
                                <strong>${kerdes.params.number1}</strong> ${op} <strong>${kerdes.params.number2}</strong> = ?
                            </p>
                        </div>
                    `;
                } else if (kerdes.params.positions && Array.isArray(kerdes.params.positions)) {
                    const bazisok = kerdes.params.positions.filter(p => p.type === 'Base').length;
                    const aszteroidak = kerdes.params.positions.filter(p => p.type === 'Asteroid');
                    const osszesErc = aszteroidak.reduce((sum, a) => sum + (a.quantity || a.amount || 0), 0);
                    
                    if (kerdes.params.type === 'MINING' || kerdes.params.type === 'COMMANDS' || kerdes.params.type === 'BASICMINING') {
                        paramsHtml = `
                            <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius-small); margin: 1rem 0;">
                                <p><strong>🚀 Bányászat szimuláció</strong></p>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem;">
                                    <p>🏠 Bázisok: ${bazisok}</p>
                                    <p>☄️ Aszteroidák: ${aszteroidak.length}</p>
                                    <p>⛏️ Összes érc: ${osszesErc}</p>
                                    <p>🚢 Hajók: ${kerdes.params.shipCount || kerdes.params.ships || 1}</p>
                                    <p>📦 Kapacitás: ${kerdes.params.shipCapacity || 25}</p>
                                    <p>⚡ Sebesség: ${kerdes.params.shipSpeed || 10}</p>
                                    <p>⛏️ Bányász sebesség: ${kerdes.params.mineSpeed || 15}</p>
                                    <p>⏱️ Kör limit: ${kerdes.params.roundLimit || '∞'}</p>
                                </div>
                                <details style="margin-top: 0.75rem;">
                                    <summary style="cursor: pointer; color: var(--text-secondary);">📍 Pozíciók részletei</summary>
                                    <div style="max-height: 200px; overflow-y: auto; margin-top: 0.5rem;">
                                        ${kerdes.params.positions.map((pos, i) => {
                                            const erc = pos.quantity || pos.amount || 0;
                                            return `<p style="font-family: monospace; font-size: 0.85rem;">${i}: ${pos.type} (x=${pos.x}, y=${pos.y})${erc > 0 ? ` - ${erc} érc` : ''}</p>`;
                                        }).join('')}
                                    </div>
                                </details>
                                <p style="margin-top: 0.75rem; color: var(--text-muted); font-size: 0.85rem;">
                                    ℹ️ Válasz: {commands: [[parancsok]], totalRounds: X, totalMined: Y}
                                </p>
                            </div>
                        `;
                    } else if (kerdes.params.type === 'UPGRADE' || kerdes.params.type === 'BASICUPGRADE') {
                        paramsHtml = `
                            <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius-small); margin: 1rem 0;">
                                <p><strong>⚙️ Fejlesztési feladat</strong></p>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem;">
                                    <p>🏠 Bázisok: ${bazisok}</p>
                                    <p>☄️ Aszteroidák: ${aszteroidak.length}</p>
                                    <p>⛏️ Összes érc: ${osszesErc}</p>
                                    <p>🚢 Hajók: ${kerdes.params.shipCount || kerdes.params.ships || 1}</p>
                                </div>
                                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--border-radius-small); margin-top: 1rem;">
                                    <p style="font-weight: bold; margin-bottom: 0.5rem;">💰 Fejlesztési költségek (max 5x):</p>
                                    <p>⚡ Sebesség: 70 érc (+4 / fejlesztés)</p>
                                    <p>📦 Kapacitás: 100 érc (+15 / fejlesztés)</p>
                                    <p>⛏️ Bányász sebesség: 35 érc (+8 / fejlesztés)</p>
                                    <p style="margin-top: 0.5rem; font-weight: bold;">Összes költség: ${70*5 + 100*5 + 35*5} érc</p>
                                </div>
                                <details style="margin-top: 0.75rem;">
                                    <summary style="cursor: pointer; color: var(--text-secondary);">📍 Pozíciók részletei</summary>
                                    <div style="max-height: 200px; overflow-y: auto; margin-top: 0.5rem;">
                                        ${kerdes.params.positions.map((pos, i) => {
                                            const erc = pos.quantity || pos.amount || 0;
                                            return `<p style="font-family: monospace; font-size: 0.85rem;">${i}: ${pos.type} (x=${pos.x}, y=${pos.y})${erc > 0 ? ` - ${erc} érc` : ''}</p>`;
                                        }).join('')}
                                    </div>
                                </details>
                                <p style="margin-top: 0.75rem; color: var(--text-muted); font-size: 0.85rem;">
                                    ℹ️ Válasz: {commands: [[parancsok]], totalRounds: X, totalMined: Y, stockQuantity: Z}
                                </p>
                            </div>
                        `;
                    } else if (kerdes.params.type === 'MULTISHIP' || kerdes.params.type === 'BASICMULTISHIP') {
                        const celHajok = kerdes.params.targetShipCount || 10;
                        paramsHtml = `
                            <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius-small); margin: 1rem 0;">
                                <p><strong>🚀 Több hajó + hajó vásárlás</strong></p>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem;">
                                    <p>🏠 Bázisok: ${bazisok}</p>
                                    <p>☄️ Aszteroidák: ${aszteroidak.length}</p>
                                    <p>⛏️ Összes érc: ${osszesErc}</p>
                                    <p>🚢 Kezdő hajók: ${kerdes.params.shipCount || kerdes.params.ships || 1}</p>
                                    <p>🎯 Cél hajók: ${celHajok}</p>
                                    <p>💰 Új hajó ára: 300 érc</p>
                                    <p>📦 Kapacitás: ${kerdes.params.shipCapacity || 25}</p>
                                    <p>⚡ Sebesség: ${kerdes.params.shipSpeed || 10}</p>
                                    <p>⛏️ Bányász sebesség: ${kerdes.params.mineSpeed || 15}</p>
                                </div>
                                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--border-radius-small); margin-top: 1rem;">
                                    <p style="font-weight: bold; margin-bottom: 0.5rem;">📋 Új hajók vásárlása:</p>
                                    <p style="font-size: 0.9rem;">• Új hajó 1 körig épül</p>
                                    <p style="font-size: 0.9rem;">• Ha a 150. körben veszünk hajót → 151. körtől használható</p>
                                    <p style="font-size: 0.9rem;">• Több hajó is vehető egy körben</p>
                                    <p style="font-size: 0.9rem;">• Hajók utasításai sorrendben végrehajtódnak</p>
                                </div>
                                <details style="margin-top: 0.75rem;">
                                    <summary style="cursor: pointer; color: var(--text-secondary);">📍 Pozíciók részletei</summary>
                                    <div style="max-height: 200px; overflow-y: auto; margin-top: 0.5rem;">
                                        ${kerdes.params.positions.map((pos, i) => {
                                            const erc = pos.quantity || pos.amount || 0;
                                            return `<p style="font-family: monospace; font-size: 0.85rem;">${i}: ${pos.type} (x=${pos.x}, y=${pos.y})${erc > 0 ? ` - ${erc} érc` : ''}</p>`;
                                        }).join('')}
                                    </div>
                                </details>
                                <p style="margin-top: 0.75rem; color: var(--text-muted); font-size: 0.85rem;">
                                    ℹ️ Válasz: {commands: [[hajó1], [hajó2], ...], newShips: [körök], totalRounds: X, stockQuantity: Y}
                                </p>
                            </div>
                        `;
                    } else {
                        paramsHtml = `
                            <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius-small); margin: 1rem 0;">
                                <p><strong>Pozíciók (${kerdes.params.positions.length} helyszín):</strong></p>
                                <div style="max-height: 200px; overflow-y: auto; margin-top: 0.5rem;">
                                    ${kerdes.params.positions.map((pos, i) => 
                                        `<p style="font-family: monospace; font-size: 0.9rem;">${i}: x=${pos.x}, y=${pos.y}</p>`
                                    ).join('')}
                                </div>
                                <p style="margin-top: 0.75rem; color: var(--text-muted); font-size: 0.85rem;">
                                    ℹ️ Távolság mátrix számítás szükséges (felfelé kerekítve)
                                </p>
                            </div>
                        `;
                    }
                } else {
                    paramsHtml = `<pre>${JSON.stringify(kerdes.params, null, 2)}</pre>`;
                }
            }
            
            div.innerHTML = `
                <h4>❓ Kérdés ${index + 1} (ID: ${kerdes.ID})</h4>
                <p><strong>Típus:</strong> ${kerdes.question_type}</p>
                ${paramsHtml}
                <label>Válasz:</label>
                <textarea id="valasz_${kerdes.ID}" rows="6" placeholder="Írj be egy választ (JSON formátumban) vagy használd az automatikus megoldást..." style="width: 100%; padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--border-radius-small); color: var(--text-primary); font-family: monospace; font-size: 0.9rem;"></textarea>
            `;
            container.appendChild(div);
        });
    }

    getMuveletJel(type) {
        switch (type) {
            case 'ADDITION': return '+';
            case 'SUBTRACTION': return '-';
            case 'MULTIPLICATION': return '×';
            case 'DIVISION': return '÷';
            default: return '+';
        }
    }

    automatikusMegoldas() {
        if (!megoldo.aktualisFeladat || !megoldo.aktualisFeladat.questions) {
            alert('Nincs betöltött feladat!');
            return;
        }

        const questions = megoldo.aktualisFeladat.questions;
        let sikeres = 0;
        
        questions.forEach(kerdes => {
            const elem = document.getElementById(`valasz_${kerdes.ID}`);
            if (!elem) {
                console.error(`Nem található elem: valasz_${kerdes.ID}`);
                return;
            }

            const automatikusValasz = megoldo.egyKerdesMegoldasa(kerdes);
            console.log(`Kérdés ${kerdes.ID}:`, automatikusValasz);
            
            if (automatikusValasz !== null) {
                if (typeof automatikusValasz === 'object') {
                    elem.value = JSON.stringify(automatikusValasz);
                } else {
                    elem.value = automatikusValasz;
                }
                sikeres++;
            }
        });
        
        alert(`✅ ${sikeres}/${questions.length} válasz automatikusan kitöltve!`);
    }

    async megoldasKuldes() {
        if (!this.aktualisFeladatId) {
            alert('Nincs kiválasztott feladat!');
            return;
        }

        const valaszok = [];
        const questions = megoldo.aktualisFeladat.questions;

        for (const kerdes of questions) {
            const input = document.getElementById(`valasz_${kerdes.ID}`);
            if (!input) continue;

            let valasz = input.value.trim();
            
            if (!valasz) {
                alert(`Kérdés ${kerdes.ID}-hoz nincs megadva válasz!`);
                return;
            }

            try {
                if (valasz.startsWith('[') || valasz.startsWith('{')) {
                    valasz = JSON.parse(valasz);
                } else if (!isNaN(valasz) && valasz !== '') {
                    valasz = Number(valasz);
                }
            } catch (e) {
                alert(`Kérdés ${kerdes.ID} válasza hibás JSON formátum!`);
                return;
            }

            valaszok.push({
                id: kerdes.ID,
                answer: valasz
            });
        }

        try {
            const kuldesBtn = document.getElementById('kuldesBtn');
            kuldesBtn.disabled = true;
            kuldesBtn.innerHTML = '<span class="icon">⏳</span> Küldés...';
            
            const response = await api.valaszKuldes(
                this.aktualisFeladatId,
                megoldo.aktualisData,
                megoldo.aktualisHash,
                valaszok
            );

            this.eredmenyMegjelenites(response);
            await this.feladatokBetoltese();
            
            kuldesBtn.disabled = false;
            kuldesBtn.innerHTML = '<span class="icon">📤</span> Megoldás küldése';
        } catch (error) {
            console.error('Hiba a megoldás küldésekor:', error);
            alert('Hiba történt a megoldás küldésekor: ' + error.message);
            
            const kuldesBtn = document.getElementById('kuldesBtn');
            kuldesBtn.disabled = false;
            kuldesBtn.innerHTML = '<span class="icon">📤</span> Megoldás küldése';
        }
    }

    eredmenyMegjelenites(response) {
        const container = document.getElementById('eredmeny');
        
        const sikeres = response.status === 'success';
        container.className = `result ${sikeres ? 'success' : 'error'}`;
        
        let html = `<h3>${sikeres ? '✅ Sikeres beküldés!' : '❌ Hiba történt'}</h3>`;
        html += `<p style="font-size: 0.85rem; color: var(--text-muted);">Időpont: ${new Date().toLocaleTimeString('hu-HU')}</p>`;
        
        if (response.message) {
            html += `<p>${response.message}</p>`;
        }
        
        if (response.data && response.data.pointsEarned !== undefined) {
            const pont = response.data.pointsEarned;
            html += `<p><strong>🏆 Szerzett pontok:</strong> ${pont} / 100</p>`;
            
            if (this.aktualisFeladatId) {
                this.setPontszam(this.aktualisFeladatId, pont);
            }
        }
        
        if (response.data && response.data.feedback) {
            html += `<h4>📋 Visszajelzés:</h4>`;
            html += `<pre>${JSON.stringify(response.data.feedback, null, 2)}</pre>`;
        }
        
        container.innerHTML = html;
    }

    tabValtas(tabNev) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabNev}"]`)?.classList.add('active');
        document.getElementById(`${tabNev}Tab`)?.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DontoApp();
});
