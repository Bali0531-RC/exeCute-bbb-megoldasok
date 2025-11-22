const FEJLESZTES_ROI = {
    mining_speed: 8,
    capacity: 12,
    move_speed: 18
};

class FeladatMegoldo {
    constructor() {
        this.aktualisFeladat = null;
        this.aktualisData = null;
        this.aktualisHash = null;
    }

    feladatBetoltes(taskData, hash) {
        this.aktualisFeladat = taskData;
        this.aktualisData = taskData;
        this.aktualisHash = hash;
    }

    kerdesekMegoldasa() {
        if (!this.aktualisFeladat || !this.aktualisFeladat.questions) {
            return [];
        }

        const valaszok = [];

        for (const kerdes of this.aktualisFeladat.questions) {
            const valasz = this.egyKerdesMegoldasa(kerdes);
            valaszok.push({
                id: kerdes.ID,
                answer: valasz
            });
        }

        return valaszok;
    }

    egyKerdesMegoldasa(kerdes) {
        console.log('egyKerdesMegoldasa hívva:', kerdes);
        
        const tipus = kerdes.question_type;
        const params = kerdes.params;

        console.log('Kérdés típus:', tipus);
        console.log('Paraméterek:', params);

        if (tipus === 'COMP') {
            const eredmeny = this.szamitasiFeladat(params);
            console.log('COMP eredmény:', eredmeny);
            return eredmeny;
        }

        if (tipus === 'DISTANCE') {
            const eredmeny = this.tavolsagMatrixSzamitas(params);
            console.log('DISTANCE eredmény:', eredmeny);
            return eredmeny;
        }

        if (tipus === 'MINING') {
            const eredmeny = this.banyaszatMegoldas(params);
            console.log('MINING eredmény:', eredmeny);
            return eredmeny;
        }

        console.warn('Ismeretlen kérdés típus:', tipus);
        return null;
    }

    szamitasiFeladat(params) {
        if (params.type === 'DISTMATRIX' || params.type === 'DISTANCE') {
            console.log('DISTMATRIX típus felismerve, átirányítás tavolsagMatrixSzamitas-hoz');
            return this.tavolsagMatrixSzamitas(params);
        }
        
        if (params.type === 'MINING' || params.type === 'COMMANDS' || params.type === 'BASICMINING' || 
            params.type === 'UPGRADE' || params.type === 'BASICUPGRADE' || 
            params.type === 'MULTISHIP' || params.type === 'BASICMULTISHIP' ||
            params.type === 'SOLVEMAP') {
            console.log('MINING/UPGRADE/MULTISHIP/SOLVEMAP típus felismerve, átirányítás banyaszatMegoldas-hoz');
            return this.banyaszatMegoldas(params);
        }
        
        if (params.number1 !== undefined && params.number2 !== undefined) {
            const type = params.type || 'ADDITION';
            
            switch (type) {
                case 'ADDITION':
                    return params.number1 + params.number2;
                case 'SUBTRACTION':
                    return params.number1 - params.number2;
                case 'MULTIPLICATION':
                    return params.number1 * params.number2;
                case 'DIVISION':
                    return Math.floor(params.number1 / params.number2);
                default:
                    return params.number1 + params.number2;
            }
        }
        
        return null;
    }

    tavolsagSzamitas(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    tavolsagMatrixSzamitas(params) {
        console.log('tavolsagMatrixSzamitas hívva, params:', params);
        
        if (!params) {
            console.error('Nincs params!');
            return null;
        }
        
        if (!params.positions) {
            console.error('Nincs positions a params-ban!');
            console.log('Elérhető kulcsok:', Object.keys(params));
            return null;
        }
        
        if (!Array.isArray(params.positions)) {
            console.error('A positions nem tömb!');
            return null;
        }

        const poziciok = params.positions;
        console.log('Pozíciók száma:', poziciok.length);
        
        const n = poziciok.length;
        const matrix = [];

        for (let i = 0; i < n; i++) {
            const sor = [];
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    sor.push(0);
                } else {
                    const pos1 = poziciok[i];
                    const pos2 = poziciok[j];
                    const tavolsag = this.tavolsagSzamitas(pos1.x, pos1.y, pos2.x, pos2.y);
                    const kerekitett = Math.ceil(tavolsag);
                    console.log(`[${i}][${j}]: távolság=${tavolsag.toFixed(2)}, kerekítve=${kerekitett}`);
                    sor.push(kerekitett);
                }
            }
            matrix.push(sor);
        }

        console.log('Kész mátrix:', matrix);
        return matrix;
    }

    banyaszatMegoldas(params) {
        console.log('banyaszatMegoldas hívva:', params);
        
        if (!params.positions || !Array.isArray(params.positions)) {
            console.error('Hiányzó positions!');
            return null;
        }

        if (params.type === 'UPGRADE' || params.type === 'BASICUPGRADE') {
            return this.fejlesztesekMegoldas(params);
        }

        if (params.type === 'MULTISHIP' || params.type === 'BASICMULTISHIP') {
            return this.tobbHajoMegoldas(params);
        }

        if (params.type === 'SOLVEMAP' && (params.shipCount || 1) > 1) {
            return this.tobbHajoMegoldas({ ...params, targetShipCount: params.shipCount });
        }

        const poziciok = params.positions;
        const hajokSzama = params.shipCount || params.ships || 1;
        const hajoKapacitas = params.shipCapacity || 25;
        const hajoSebesseg = params.shipSpeed || 10;
        const banyaszSebesseg = params.mineSpeed || 15;

        const bazisIndex = poziciok.findIndex(p => p.type === 'Base');
        const aszteroidak = poziciok
            .map((p, idx) => ({ 
                ...p, 
                index: idx,
                mennyiseg: p.quantity || p.amount || 0
            }))
            .filter(p => p.type === 'Asteroid');

        console.log(`Bázis index: ${bazisIndex}`);
        console.log(`Aszteroidák:`, aszteroidak);

        const tavolsagMatrix = this.tavolsagMatrixSzamitas({ positions: poziciok });

        const parancsok = [];
        let osszesKor = 0;
        let osszesBanyaszott = 0;
        let jelenlegiRakomany = 0;
        let jelenlegiPozicio = bazisIndex;

        parancsok.push({
            command: 'STARTFROM',
            position: bazisIndex
        });

        const marBanyaszott = new Set();
        const aszteroridaMennyisegek = {};
        aszteroidak.forEach(a => {
            aszteroridaMennyisegek[a.index] = a.mennyiseg;
        });

        while (marBanyaszott.size < aszteroidak.length) {
            let legkozelebbiAszteroida = null;
            let legkisebbTavolsag = Infinity;

            for (const aszteroida of aszteroidak) {
                if (aszteroridaMennyisegek[aszteroida.index] <= 0) {
                    marBanyaszott.add(aszteroida.index);
                    continue;
                }
                if (marBanyaszott.has(aszteroida.index)) continue;

                const tavolsag = tavolsagMatrix[jelenlegiPozicio][aszteroida.index];
                if (tavolsag < legkisebbTavolsag) {
                    legkisebbTavolsag = tavolsag;
                    legkozelebbiAszteroida = aszteroida;
                }
            }

            if (!legkozelebbiAszteroida) break;

            parancsok.push({
                command: 'MOVE',
                position: legkozelebbiAszteroida.index
            });
            const mozgasKorok = Math.ceil(legkisebbTavolsag / hajoSebesseg);
            osszesKor += mozgasKorok;
            jelenlegiPozicio = legkozelebbiAszteroida.index;

            const hianyzikAKapacitashoz = hajoKapacitas - jelenlegiRakomany;
            const meglevOErc = aszteroridaMennyisegek[legkozelebbiAszteroida.index];
            const banyaszhatoMennyiseg = Math.min(meglevOErc, hianyzikAKapacitashoz);
            
            let korokSzama = 1;
            while ((korokSzama + 1) * banyaszSebesseg <= banyaszhatoMennyiseg) {
                korokSzama++;
            }
            
            console.log(`DEBUG: rakomany=${jelenlegiRakomany}, kapacitas=${hajoKapacitas}, hianyzik=${hianyzikAKapacitashoz}, erc=${meglevOErc}, banyaszhato=${banyaszhatoMennyiseg}, sebesseg=${banyaszSebesseg}, korok=${korokSzama}`);
            console.log(`DEBUG ellenőrzés: ${korokSzama} kör * ${banyaszSebesseg} = ${korokSzama * banyaszSebesseg}, hianyzik: ${hianyzikAKapacitashoz}, ellenőrzés: ${(korokSzama-1)*banyaszSebesseg} < ${hianyzikAKapacitashoz}`);

            if (korokSzama > 0 && banyaszhatoMennyiseg > 0) {
                parancsok.push({
                    command: 'MINE',
                    rounds: korokSzama
                });
                osszesKor += korokSzama;
                
                const tenylegBanyaszott = Math.min(
                    korokSzama * banyaszSebesseg, 
                    banyaszhatoMennyiseg, 
                    hianyzikAKapacitashoz
                );
                jelenlegiRakomany += tenylegBanyaszott;
                osszesBanyaszott += tenylegBanyaszott;
                aszteroridaMennyisegek[legkozelebbiAszteroida.index] -= tenylegBanyaszott;
                
                console.log(`Bányászás: ${tenylegBanyaszott} érc, ${korokSzama} kör, maradt: ${aszteroridaMennyisegek[legkozelebbiAszteroida.index]}, új rakomány: ${jelenlegiRakomany}`);
            }

            if (aszteroridaMennyisegek[legkozelebbiAszteroida.index] <= 0) {
                marBanyaszott.add(legkozelebbiAszteroida.index);
            }

            if (jelenlegiRakomany >= hajoKapacitas || marBanyaszott.size === aszteroidak.length) {
                parancsok.push({
                    command: 'MOVE',
                    position: bazisIndex
                });
                const visszaKorok = Math.ceil(tavolsagMatrix[jelenlegiPozicio][bazisIndex] / hajoSebesseg);
                osszesKor += visszaKorok;
                jelenlegiPozicio = bazisIndex;
                jelenlegiRakomany = 0;
                
                console.log(`Visszatérés a bázisrál, körök: ${visszaKorok}`);
            }
        }

        const eredmeny = {
            commands: [parancsok],
            totalRounds: osszesKor,
            totalMined: osszesBanyaszott
        };

        console.log('Bányászat megoldás:', eredmeny);
        return eredmeny;
    }

    banyaszatOptimalizalas(palyaData) {
        console.log('banyaszatOptimalizalas hívva:', palyaData);
        if (!palyaData) return [];
        
        const hajok = palyaData.ships || [];
        const aszteroidak = palyaData.asteroids || [];
        const idoLimit = palyaData.timeLimit || 100;
        
        const parancsok = [];
        
        for (let hajoIndex = 0; hajoIndex < hajok.length; hajoIndex++) {
            const hajo = hajok[hajoIndex];
            
            const legkozelebbiAszteroida = this.legkozelebbiAszteroidaKeresese(hajo, aszteroidak);
            
            if (legkozelebbiAszteroida) {
                parancsok.push({
                    ship: hajoIndex,
                    action: 'MOVE',
                    target: legkozelebbiAszteroida.id
                });
                
                parancsok.push({
                    ship: hajoIndex,
                    action: 'MINE',
                    target: legkozelebbiAszteroida.id
                });
                
                parancsok.push({
                    ship: hajoIndex,
                    action: 'RETURN'
                });
            }
        }
        
        return parancsok;
    }

    legkozelebbiAszteroidaKeresese(hajo, aszteroidak) {
        if (!aszteroidak || aszteroidak.length === 0) return null;
        
        let legkozelebbi = null;
        let legkisebbTavolsag = Infinity;
        
        for (const aszteroida of aszteroidak) {
            if (aszteroida.ore <= 0) continue;
            
            const tavolsag = this.tavolsagSzamitas(
                hajo.x || 0, 
                hajo.y || 0, 
                aszteroida.x || 0, 
                aszteroida.y || 0
            );
            
            if (tavolsag < legkisebbTavolsag) {
                legkisebbTavolsag = tavolsag;
                legkozelebbi = aszteroida;
            }
        }
        
        return legkozelebbi;
    }

    fejlesztesekMegoldas(params) {
        console.log('fejlesztesekMegoldas hívva:', params);
        
        const poziciok = params.positions;
        const bazisIndex = poziciok.findIndex(p => p.type === 'Base');
        const aszteroidak = poziciok
            .map((p, idx) => ({ 
                ...p, 
                index: idx,
                mennyiseg: p.quantity || p.amount || 0
            }))
            .filter(p => p.type === 'Asteroid');

        const tavolsagMatrix = this.tavolsagMatrixSzamitas({ positions: poziciok });

        const FEJLESZTES_KOLTSEG = {
            move_speed: 70,
            capacity: 100,
            mining_speed: 35
        };

        const FEJLESZTES_ERTEKEK = {
            move_speed: 4,
            capacity: 15,
            mining_speed: 8
        };

        const FEJLESZTES_ROI = {
            mining_speed: 8,
            capacity: 18,
            move_speed: 13
        };

        const MAX_FEJLESZTES = 5;
        const OSSZES_FEJLESZTES_KOLTSEG = 
            FEJLESZTES_KOLTSEG.move_speed * MAX_FEJLESZTES +
            FEJLESZTES_KOLTSEG.capacity * MAX_FEJLESZTES +
            FEJLESZTES_KOLTSEG.mining_speed * MAX_FEJLESZTES;

        console.log(`Összes fejlesztés költség: ${OSSZES_FEJLESZTES_KOLTSEG}`);

        let hajoSebesseg = 10;
        let hajoKapacitas = 25;
        let banyaszSebesseg = 15;

        const parancsok = [];
        let osszesKor = 0;
        let osszesBanyaszott = 0;
        let raktar = 0;
        let jelenlegiRakomany = 0;
        let jelenlegiPozicio = bazisIndex;

        parancsok.push({
            command: 'STARTFROM',
            position: bazisIndex
        });

        const aszteroridaMennyisegek = {};
        aszteroidak.forEach(a => {
            aszteroridaMennyisegek[a.index] = a.mennyiseg;
        });

        const fejlesztesek = {
            move_speed: 0,
            capacity: 0,
            mining_speed: 0
        };

        while (raktar < OSSZES_FEJLESZTES_KOLTSEG) {
            let legkozelebbiAszteroida = null;
            let legkisebbTavolsag = Infinity;

            for (const aszteroida of aszteroidak) {
                if (aszteroridaMennyisegek[aszteroida.index] <= 0) continue;

                const tavolsag = tavolsagMatrix[jelenlegiPozicio][aszteroida.index];
                if (tavolsag < legkisebbTavolsag) {
                    legkisebbTavolsag = tavolsag;
                    legkozelebbiAszteroida = aszteroida;
                }
            }

            if (!legkozelebbiAszteroida) break;

            parancsok.push({
                command: 'MOVE',
                position: legkozelebbiAszteroida.index
            });
            osszesKor += Math.ceil(legkisebbTavolsag / hajoSebesseg);
            jelenlegiPozicio = legkozelebbiAszteroida.index;

            const hianyzikAKapacitashoz = hajoKapacitas - jelenlegiRakomany;
            const meglevOErc = aszteroridaMennyisegek[legkozelebbiAszteroida.index];
            const banyaszhatoMennyiseg = Math.min(meglevOErc, hianyzikAKapacitashoz);
            
            let korokSzama = 1;
            while ((korokSzama + 1) * banyaszSebesseg <= banyaszhatoMennyiseg) {
                korokSzama++;
            }

            if (korokSzama > 0 && banyaszhatoMennyiseg > 0) {
                parancsok.push({
                    command: 'MINE',
                    rounds: korokSzama
                });
                osszesKor += korokSzama;
                
                const tenylegBanyaszott = Math.min(
                    korokSzama * banyaszSebesseg, 
                    banyaszhatoMennyiseg, 
                    hianyzikAKapacitashoz
                );
                jelenlegiRakomany += tenylegBanyaszott;
                osszesBanyaszott += tenylegBanyaszott;
                aszteroridaMennyisegek[legkozelebbiAszteroida.index] -= tenylegBanyaszott;
            }

            if (jelenlegiRakomany >= hajoKapacitas) {
                parancsok.push({
                    command: 'MOVE',
                    position: bazisIndex
                });
                const visszaKorok = Math.ceil(tavolsagMatrix[jelenlegiPozicio][bazisIndex] / hajoSebesseg);
                osszesKor += visszaKorok;
                jelenlegiPozicio = bazisIndex;
                raktar += jelenlegiRakomany;
                jelenlegiRakomany = 0;

                while (raktar >= FEJLESZTES_KOLTSEG.mining_speed && fejlesztesek.mining_speed < MAX_FEJLESZTES) {
                    parancsok.push({
                        command: 'UPGRADE',
                        attribute: 'mining_speed'
                    });
                    osszesKor += 1;
                    raktar -= FEJLESZTES_KOLTSEG.mining_speed;
                    fejlesztesek.mining_speed++;
                    banyaszSebesseg += FEJLESZTES_ERTEKEK.mining_speed;
                    console.log(`Fejlesztés: mining_speed -> ${banyaszSebesseg}`);
                }

                while (raktar >= FEJLESZTES_KOLTSEG.move_speed && fejlesztesek.move_speed < MAX_FEJLESZTES) {
                    parancsok.push({
                        command: 'UPGRADE',
                        attribute: 'move_speed'
                    });
                    osszesKor += 1;
                    raktar -= FEJLESZTES_KOLTSEG.move_speed;
                    fejlesztesek.move_speed++;
                    hajoSebesseg += FEJLESZTES_ERTEKEK.move_speed;
                    console.log(`Fejlesztés: move_speed -> ${hajoSebesseg}`);
                }

                while (raktar >= FEJLESZTES_KOLTSEG.capacity && fejlesztesek.capacity < MAX_FEJLESZTES) {
                    parancsok.push({
                        command: 'UPGRADE',
                        attribute: 'capacity'
                    });
                    osszesKor += 1;
                    raktar -= FEJLESZTES_KOLTSEG.capacity;
                    fejlesztesek.capacity++;
                    hajoKapacitas += FEJLESZTES_ERTEKEK.capacity;
                    console.log(`Fejlesztés: capacity -> ${hajoKapacitas}`);
                }

                if (fejlesztesek.move_speed >= MAX_FEJLESZTES && 
                    fejlesztesek.capacity >= MAX_FEJLESZTES && 
                    fejlesztesek.mining_speed >= MAX_FEJLESZTES) {
                    console.log('Minden fejlesztés kész!');
                    break;
                }
            }
        }

        if (jelenlegiRakomany > 0 && jelenlegiPozicio !== bazisIndex) {
            parancsok.push({
                command: 'MOVE',
                position: bazisIndex
            });
            const visszaKorok = Math.ceil(tavolsagMatrix[jelenlegiPozicio][bazisIndex] / hajoSebesseg);
            osszesKor += visszaKorok;
            raktar += jelenlegiRakomany;
            jelenlegiRakomany = 0;
        }

        const eredmeny = {
            commands: [parancsok],
            totalRounds: osszesKor,
            totalMined: osszesBanyaszott,
            stockQuantity: raktar
        };

        console.log('Fejlesztések megoldás:', eredmeny);
        console.log('Végső fejlesztések:', fejlesztesek);
        return eredmeny;
    }

    tobbHajoMegoldas(params) {
        console.log('tobbHajoMegoldas hívva:', params);
        
        const poziciok = params.positions;
        const kezdoHajokSzama = params.shipCount || params.ships || 1;
        const hajoKoltseg = 300;
        const korLimit = params.roundLimit || Infinity;
        const normalizaltKorLimit = Number.isFinite(korLimit) ? korLimit : 600;
        
        const bazisok = poziciok
            .map((p, idx) => ({ ...p, index: idx }))
            .filter(p => p.type === 'Base');
        
        const aszteroidak = poziciok
            .map((p, idx) => ({ 
                ...p, 
                index: idx,
                mennyiseg: p.quantity || p.amount || 0
            }))
            .filter(p => p.type === 'Asteroid');
        
        const osszesErc = aszteroidak.reduce((sum, a) => sum + a.mennyiseg, 0);
        const atlagTavolsag = aszteroidak.length > 0 
            ? aszteroidak.reduce((sum, a) => sum + this.tavolsagSzamitas(bazisok[0].x, bazisok[0].y, a.x, a.y), 0) / aszteroidak.length
            : 100;
        
        const ercAlapuHajok = Math.ceil(osszesErc / 1100);
        const idoAlapuHajok = Math.ceil(korLimit / 38);
        const koltsegAlapuHajok = Math.floor(osszesErc / 240);
        
        const optimalisHajokSzama = Math.min(
            Math.max(ercAlapuHajok, 6),
            idoAlapuHajok,
            koltsegAlapuHajok,
            28
        );
        const celHajokSzama = Math.min(18, Math.max(4, kezdoHajokSzama, optimalisHajokSzama));
        
        console.log(`📊 Pálya elemzés: ${osszesErc} érc, átlag távolság: ${atlagTavolsag.toFixed(1)}`);
        console.log(`🚢 Optimális hajók: ${celHajokSzama}, Kezdő: ${kezdoHajokSzama}, Kör limit: ${korLimit}`);

        console.log(`Kezdő hajók: ${kezdoHajokSzama}, Cél: ${celHajokSzama} hajó, Kör limit: ${korLimit}`);
        console.log(`Bázisok: ${bazisok.length}, Aszteroidák: ${aszteroidak.length}`);

        const tavolsagMatrix = this.tavolsagMatrixSzamitas({ positions: poziciok });
        
        const FEJLESZTES_KOLTSEG = {
            move_speed: 70,
            capacity: 100,
            mining_speed: 35
        };

        const FEJLESZTES_ERTEKEK = {
            move_speed: 4,
            capacity: 15,
            mining_speed: 8
        };

        const MAX_FEJLESZTES = 5;

        let globalHajoSebesseg = params.shipSpeed || 10;
        let globalHajoKapacitas = params.shipCapacity || 25;
        let globalBanyaszSebesseg = params.mineSpeed || 15;

        const fejlesztesek = {
            move_speed: 0,
            capacity: 0,
            mining_speed: 0
        };

        const bazisErcElemzes = bazisok.map(bazis => {
            let sulyozottErc = 0;
            for (const a of aszteroidak) {
                const tavolsag = tavolsagMatrix[bazis.index][a.index];
                if (tavolsag < 200) {
                    const sulyozas = 1 / (1 + tavolsag / 50);
                    sulyozottErc += a.mennyiseg * sulyozas;
                }
            }
            return { bazis, osszesErc: sulyozottErc, index: bazis.index };
        });
        
        bazisErcElemzes.sort((a, b) => b.osszesErc - a.osszesErc);
        
        const hajok = [];
        for (let i = 0; i < kezdoHajokSzama; i++) {
            const bazis = bazisErcElemzes[i % bazisErcElemzes.length].bazis;
            hajok.push({
                parancsok: [{
                    command: 'STARTFROM',
                    position: bazis.index
                }],
                pozicio: bazis.index,
                rakomany: 0,
                sebesseg: globalHajoSebesseg,
                kapacitas: globalHajoKapacitas,
                banyaszSebesseg: globalBanyaszSebesseg,
                elerheto: 0,
                elteltKor: 0,
                preferaltBazis: bazis.index
            });
        }

        const aszteroridaMennyisegek = {};
        aszteroidak.forEach(a => {
            aszteroridaMennyisegek[a.index] = a.mennyiseg;
        });

        let raktar = 0;
        const ujHajok = [];
        let iteracio = 0;
        const maxIteracio = 4000;

        while (iteracio < maxIteracio) {
            iteracio++;
            let vanMunka = false;
            
            const osszesKor = this.osszesKorSzamitas(hajok);
            
            if (osszesKor >= korLimit) {
                console.log(`⚠️ Elértük a kör limitet (${korLimit}), leállítás`);
                break;
            }

            for (const hajo of hajok) {
                const hajoKor = this.hajoKorSzamitas(hajo);
                const hatralevKorok = korLimit - hajoKor;
                
                if (hatralevKorok <= 0) {
                    continue;
                }
                
                const legkozelebbiBazis = this.legkozelebbiBazisKeresese(hajo.pozicio, bazisok, tavolsagMatrix);
                const minimalVisszaKor = legkozelebbiBazis
                    ? Math.ceil(tavolsagMatrix[hajo.pozicio][legkozelebbiBazis.index] / hajo.sebesseg)
                    : Infinity;
                const rakottseg = hajo.kapacitas > 0 ? hajo.rakomany / hajo.kapacitas : 0;
                const dinamikusLeadKuszob = !Number.isFinite(minimalVisszaKor)
                    ? 0.9
                    : minimalVisszaKor <= 4
                        ? 0.68
                        : minimalVisszaKor <= 7
                            ? 0.78
                            : 0.85;
                const kesoVissza = hatralevKorok <= minimalVisszaKor + Math.max(5, Math.ceil(minimalVisszaKor * 0.7));

                if (legkozelebbiBazis && (rakottseg >= dinamikusLeadKuszob || kesoVissza)) {
                    let celBazis = legkozelebbiBazis;
                    
                    if (rakottseg >= 0.9) {
                        const jelenlegiBazisErc = this.bazisKornyezetiErc(
                            celBazis.index,
                            tavolsagMatrix,
                            aszteroridaMennyisegek,
                            aszteroidak
                        );
                        for (const bazisInfo of bazisErcElemzes) {
                            const bazis = bazisInfo.bazis;
                            const tavolsag = tavolsagMatrix[hajo.pozicio][bazis.index];
                            const legkozelebbiTavolsag = tavolsagMatrix[hajo.pozicio][celBazis.index];
                            const ujBazisErc = this.bazisKornyezetiErc(
                                bazis.index,
                                tavolsagMatrix,
                                aszteroridaMennyisegek,
                                aszteroidak
                            );
                            if (ujBazisErc > jelenlegiBazisErc * 1.8 && tavolsag < legkozelebbiTavolsag * 1.2) {
                                celBazis = bazis;
                                hajo.preferaltBazis = bazis.index;
                                console.log(`🔄 Bázisváltás: ${jelenlegiBazisErc.toFixed(0)} → ${ujBazisErc.toFixed(0)} érc`);
                                break;
                            }
                        }
                    }
                    
                    if (hajo.pozicio !== celBazis.index) {
                        const visszaUtKorok = Math.ceil(tavolsagMatrix[hajo.pozicio][celBazis.index] / hajo.sebesseg);
                        if (hajoKor + visszaUtKorok <= korLimit) {
                            hajo.parancsok.push({
                                command: 'MOVE',
                                position: celBazis.index
                            });
                            hajo.pozicio = celBazis.index;
                            this.hajoIdoNovelese(hajo, visszaUtKorok);
                            raktar += hajo.rakomany;
                            hajo.rakomany = 0;
                            vanMunka = true;
                        }
                    } else if (hajo.rakomany > 0) {
                        raktar += hajo.rakomany;
                        hajo.rakomany = 0;
                        vanMunka = true;
                    }
                    continue;
                }

                let legkozelebbiAszteroida = null;
                let legjobbErtek = -Infinity;
                const dinamikusLimit = Number.isFinite(korLimit) ? korLimit : 400;
                const kozelKorLimit = Math.max(6, Math.min(24, Math.floor(dinamikusLimit * 0.05)));
                const panicMod = hatralevKorok < Math.max(50, normalizaltKorLimit * 0.25);
                let legjobbKozeli = null;
                let legjobbKozeliErtek = -Infinity;

                for (const aszteroida of aszteroidak) {
                    if (aszteroridaMennyisegek[aszteroida.index] <= 0) continue;
                    
                    const tavolsag = tavolsagMatrix[hajo.pozicio][aszteroida.index];
                    const legkozelebbiBazis = this.legkozelebbiBazisKeresese(aszteroida.index, bazisok, tavolsagMatrix);
                    const bazisig = tavolsagMatrix[aszteroida.index][legkozelebbiBazis.index];
                    
                    const mozgasKor = Math.ceil(tavolsag / hajo.sebesseg);
                    
                    const elerheto = aszteroridaMennyisegek[aszteroida.index];
                    const maxBanyaszhato = Math.min(elerheto, hajo.kapacitas - hajo.rakomany);
                    const banyaszKorok = Math.max(1, Math.ceil(maxBanyaszhato / hajo.banyaszSebesseg));
                    const visszaKor = Math.ceil(bazisig / hajo.sebesseg);
                    
                    const osszesIdo = mozgasKor + banyaszKorok + visszaKor;
                    
                    if (hajoKor + osszesIdo > korLimit) {
                        continue;
                    }
                    
                    const hozam = maxBanyaszhato;
                    const idoKoltseg = Math.max(1, mozgasKor + banyaszKorok);
                    const bazisBonus = 2.5 / (visszaKor + 1);
                    const mennyisegBonus = Math.sqrt(elerheto) / 6;
                    const rakomanyBonus = hajo.rakomany > 0 ? 0.5 : 1.5;
                    const tavolsagBuntetes = 1 / (1 + mozgasKor / 10);
                    const teljesKapacitasBonus = (maxBanyaszhato >= hajo.kapacitas - hajo.rakomany) ? 1.5 : 1.0;
                    
                    const szabad = hajo.kapacitas - hajo.rakomany;
                    const tobbMintKapacitas = elerheto >= szabad ? 3.0 : 1.0;
                    
                    const kisErcBuntetes = (elerheto < 50 && hajo.rakomany > 0) ? 0.3 : 1.0;
                    
                    const kozeliBonus = mozgasKor <= 5 ? 1.8 : mozgasKor <= 10 ? 1.3 : 1.0;
                    
                    const hatekonyErtek = (hozam / idoKoltseg) * (1 + bazisBonus + mennyisegBonus) * rakomanyBonus * tavolsagBuntetes * teljesKapacitasBonus * tobbMintKapacitas * kisErcBuntetes * kozeliBonus;
                    
                    if (mozgasKor <= kozelKorLimit && hatekonyErtek > legjobbKozeliErtek) {
                        legjobbKozeliErtek = hatekonyErtek;
                        legjobbKozeli = aszteroida;
                    }

                    if (hatekonyErtek > legjobbErtek) {
                        legjobbErtek = hatekonyErtek;
                        legkozelebbiAszteroida = aszteroida;
                    }
                }

                let valasztottAszteroida = legkozelebbiAszteroida;
                let valasztottErtek = legjobbErtek;
                if (legjobbKozeli) {
                    const tavValasztott = valasztottAszteroida
                        ? Math.ceil(tavolsagMatrix[hajo.pozicio][valasztottAszteroida.index] / hajo.sebesseg)
                        : Infinity;
                    const ertekArany = valasztottErtek === 0 ? 1 : legjobbKozeliErtek / Math.max(1e-6, valasztottErtek);
                    if (
                        !valasztottAszteroida ||
                        (tavValasztott > kozelKorLimit * 1.5 && ertekArany >= 0.6) ||
                        tavValasztott > kozelKorLimit * 2.5
                    ) {
                        valasztottAszteroida = legjobbKozeli;
                        valasztottErtek = legjobbKozeliErtek;
                    }
                }

                if (!valasztottAszteroida && panicMod) {
                    let panicCel = null;
                    let panicErtek = -Infinity;
                    for (const aszteroida of aszteroidak) {
                        if (aszteroridaMennyisegek[aszteroida.index] <= 0) continue;
                        const szabad = hajo.kapacitas - hajo.rakomany;
                        if (szabad <= 0) {
                            break;
                        }
                        const mozgasKor = Math.ceil(tavolsagMatrix[hajo.pozicio][aszteroida.index] / hajo.sebesseg);
                        const panicBazis = this.legkozelebbiBazisKeresese(aszteroida.index, bazisok, tavolsagMatrix);
                        if (!panicBazis) {
                            continue;
                        }
                        const visszaKor = Math.ceil(tavolsagMatrix[aszteroida.index][panicBazis.index] / hajo.sebesseg);
                        const panicMennyiseg = Math.min(szabad, aszteroridaMennyisegek[aszteroida.index]);
                        if (panicMennyiseg <= 0) continue;
                        const banyaszKor = Math.max(1, Math.ceil(panicMennyiseg / hajo.banyaszSebesseg));
                        const osszesIdo = mozgasKor + banyaszKor + visszaKor;
                        if (hajoKor + osszesIdo > korLimit) {
                            continue;
                        }
                        const ertek = panicMennyiseg / Math.max(1, osszesIdo);
                        if (ertek > panicErtek) {
                            panicErtek = ertek;
                            panicCel = aszteroida;
                        }
                    }
                    if (panicCel) {
                        valasztottAszteroida = panicCel;
                        legjobbErtek = panicErtek;
                    }
                }

                if (valasztottAszteroida) {
                    vanMunka = true;
                    
                    if (hajo.pozicio !== valasztottAszteroida.index) {
                        const mozgasKor = Math.ceil(tavolsagMatrix[hajo.pozicio][valasztottAszteroida.index] / hajo.sebesseg);
                        hajo.parancsok.push({
                            command: 'MOVE',
                            position: valasztottAszteroida.index
                        });
                        hajo.pozicio = valasztottAszteroida.index;
                        this.hajoIdoNovelese(hajo, mozgasKor);
                    }

                    const szabad = hajo.kapacitas - hajo.rakomany;
                    const elerheto = aszteroridaMennyisegek[valasztottAszteroida.index];
                    const banyaszhato = Math.min(szabad, elerheto);
                    
                    if (banyaszhato > 0) {
                        let korok = Math.max(1, Math.ceil(banyaszhato / hajo.banyaszSebesseg));
                        const ujHajoKor = this.hajoKorSzamitas(hajo);
                        const maradekKor = korLimit - ujHajoKor;
                        if (maradekKor <= 0) {
                            continue;
                        }
                        if (korok > maradekKor) {
                            korok = maradekKor;
                        }
                        
                        hajo.parancsok.push({
                            command: 'MINE',
                            rounds: korok
                        });
                        this.hajoIdoNovelese(hajo, korok);
                        
                        const valodiBanyaszott = Math.min(banyaszhato, korok * hajo.banyaszSebesseg);
                        
                        hajo.rakomany += valodiBanyaszott;
                        aszteroridaMennyisegek[valasztottAszteroida.index] -= valodiBanyaszott;
                    }
                } else {
                    if (hajo.rakomany > 0) {
                        const legkozelebbiBazis = this.legkozelebbiBazisKeresese(hajo.pozicio, bazisok, tavolsagMatrix);
                        
                        if (legkozelebbiBazis) {
                            const visszaUtKorok = Math.ceil(tavolsagMatrix[hajo.pozicio][legkozelebbiBazis.index] / hajo.sebesseg);
                            
                            if (hajoKor + visszaUtKorok <= korLimit && hajo.pozicio !== legkozelebbiBazis.index) {
                                hajo.parancsok.push({
                                    command: 'MOVE',
                                    position: legkozelebbiBazis.index
                                });
                                hajo.pozicio = legkozelebbiBazis.index;
                                this.hajoIdoNovelese(hajo, visszaUtKorok);
                                raktar += hajo.rakomany;
                                hajo.rakomany = 0;
                                vanMunka = true;
                            }
                        }
                    }
                }

                const bazison = bazisok.some(b => b.index === hajo.pozicio);
                
                if (hajo.rakomany === 0 && bazison) {
                    const aktualisKor = this.osszesKorSzamitas(hajok);
                    const hatralevKorok = korLimit - aktualisKor;
                    const becsultFuvarKor = Math.max(
                        12,
                        Math.ceil((atlagTavolsag / Math.max(1, globalHajoSebesseg)) * 2) +
                        Math.ceil(globalHajoKapacitas / Math.max(1, globalBanyaszSebesseg))
                    );
                    const ujHajoMegterulesKor = Math.max(50, becsultFuvarKor + 8);
                    
                    while (raktar >= hajoKoltseg && hajok.length < celHajokSzama && hatralevKorok > ujHajoMegterulesKor) {
                        const ujHajoKor = aktualisKor;
                        ujHajok.push(ujHajoKor);
                        raktar -= hajoKoltseg;
                        
                        hajo.parancsok.push({
                            command: 'BUY_SHIP',
                            cost: hajoKoltseg
                        });
                        
                        const bazis = bazisErcElemzes[hajok.length % bazisErcElemzes.length].bazis;
                        hajok.push({
                            parancsok: [{
                                command: 'STARTFROM',
                                position: bazis.index
                            }],
                            pozicio: bazis.index,
                            rakomany: 0,
                            sebesseg: globalHajoSebesseg,
                            kapacitas: globalHajoKapacitas,
                            banyaszSebesseg: globalBanyaszSebesseg,
                            elerheto: ujHajoKor + 1,
                            elteltKor: ujHajoKor + 1,
                            preferaltBazis: bazis.index
                        });
                        
                        vanMunka = true;
                        console.log(`✅ Új hajó ${hajok.length - 1} vásárlás: ${ujHajoKor}. kör, Raktár: ${raktar}`);
                        
                        if (raktar < hajoKoltseg * 1.5) break;
                    }
                    
                    const koraiFejlesztes = aktualisKor >= 100 && raktar >= 20;
                    const fejlesztesAktivalva = (raktar >= 100 && (hajok.length >= celHajokSzama || hatralevKorok <= ujHajoMegterulesKor)) || koraiFejlesztes;
                    if (fejlesztesAktivalva) {
                        const kapacitasDominancia = globalHajoKapacitas < 100 || (globalHajoKapacitas / Math.max(1, globalBanyaszSebesseg)) < (atlagTavolsag / Math.max(1, globalHajoSebesseg));
                        const fejlesztesiSorrend = kapacitasDominancia
                            ? [
                                { attr: 'capacity', koltseg: FEJLESZTES_KOLTSEG.capacity, max: MAX_FEJLESZTES },
                                { attr: 'mining_speed', koltseg: FEJLESZTES_KOLTSEG.mining_speed, max: MAX_FEJLESZTES },
                                { attr: 'move_speed', koltseg: FEJLESZTES_KOLTSEG.move_speed, max: MAX_FEJLESZTES }
                            ]
                            : [
                                { attr: 'mining_speed', koltseg: FEJLESZTES_KOLTSEG.mining_speed, max: MAX_FEJLESZTES },
                                { attr: 'capacity', koltseg: FEJLESZTES_KOLTSEG.capacity, max: MAX_FEJLESZTES },
                                { attr: 'move_speed', koltseg: FEJLESZTES_KOLTSEG.move_speed, max: MAX_FEJLESZTES }
                            ];
                        let fejlesztesekSzama = 0;
                        const maxFejlesztesEgyKorben = raktar > 400 ? 3 : raktar > 250 ? 2 : 1;
                        for (const fejl of fejlesztesiSorrend) {
                            if (fejlesztesekSzama >= maxFejlesztesEgyKorben) break;
                            const minimalKorIgeny = FEJLESZTES_ROI[fejl.attr] + fejlesztesek[fejl.attr] * 3;
                            if (!koraiFejlesztes && hatralevKorok <= minimalKorIgeny) {
                                continue;
                            }
                            while (fejlesztesek[fejl.attr] < fejl.max && raktar >= fejl.koltseg && fejlesztesekSzama < maxFejlesztesEgyKorben) {
                                hajo.parancsok.push({
                                    command: 'UPGRADE',
                                    attribute: fejl.attr
                                });
                                this.hajoIdoNovelese(hajo, 1);
                                raktar -= fejl.koltseg;
                                fejlesztesek[fejl.attr]++;
                                fejlesztesekSzama++;
                                if (fejl.attr === 'mining_speed') {
                                    globalBanyaszSebesseg += FEJLESZTES_ERTEKEK.mining_speed;
                                    hajok.forEach(h => h.banyaszSebesseg = globalBanyaszSebesseg);
                                } else if (fejl.attr === 'capacity') {
                                    globalHajoKapacitas += FEJLESZTES_ERTEKEK.capacity;
                                    hajok.forEach(h => h.kapacitas = globalHajoKapacitas);
                                } else if (fejl.attr === 'move_speed') {
                                    globalHajoSebesseg += FEJLESZTES_ERTEKEK.move_speed;
                                    hajok.forEach(h => h.sebesseg = globalHajoSebesseg);
                                }
                                vanMunka = true;
                            }
                        }
                        while (fejlesztesek.mining_speed < MAX_FEJLESZTES && raktar >= FEJLESZTES_KOLTSEG.mining_speed && hatralevKorok > FEJLESZTES_ROI.mining_speed + fejlesztesek.mining_speed * 3 && raktar > 200) {
                            hajo.parancsok.push({
                                command: 'UPGRADE',
                                attribute: 'mining_speed'
                            });
                            this.hajoIdoNovelese(hajo, 1);
                            raktar -= FEJLESZTES_KOLTSEG.mining_speed;
                            fejlesztesek.mining_speed++;
                            globalBanyaszSebesseg += FEJLESZTES_ERTEKEK.mining_speed;
                            hajok.forEach(h => h.banyaszSebesseg = globalBanyaszSebesseg);
                            vanMunka = true;
                        }
                    }
                }
            }

            if (!vanMunka) {
                console.log('✅ Nincs több munka, optimalizáció befejezve');
                break;
            }
        }

        for (const hajo of hajok) {
            if (hajo.rakomany > 0) {
                const hajoKor = this.hajoKorSzamitas(hajo);
                const legkozelebbiBazis = this.legkozelebbiBazisKeresese(hajo.pozicio, bazisok, tavolsagMatrix);
                
                if (legkozelebbiBazis) {
                    const visszaUtKorok = Math.ceil(tavolsagMatrix[hajo.pozicio][legkozelebbiBazis.index] / hajo.sebesseg);
                    
                    if (hajoKor + visszaUtKorok <= korLimit && hajo.pozicio !== legkozelebbiBazis.index) {
                        hajo.parancsok.push({
                            command: 'MOVE',
                            position: legkozelebbiBazis.index
                        });
                        this.hajoIdoNovelese(hajo, visszaUtKorok);
                        raktar += hajo.rakomany;
                        hajo.rakomany = 0;
                    }
                }
            }
        }

        const osszesKor = this.osszesKorSzamitas(hajok);

        const eredmeny = {
            commands: hajok.map(h => h.parancsok),
            newShips: ujHajok,
            totalRounds: osszesKor,
            stockQuantity: raktar
        };

        console.log(`✅ Végső: ${hajok.length} hajó, ${raktar} raktár, ${osszesKor}/${korLimit} kör`);
        console.log(`📊 Fejlesztések: speed=${fejlesztesek.move_speed}, capacity=${fejlesztesek.capacity}, mining=${fejlesztesek.mining_speed}`);
        
        return eredmeny;
    }

    legkozelebbiBazisKeresese(jelenlegiPozicio, bazisok, tavolsagMatrix) {
        let legkozelebbi = null;
        let legkisebbTavolsag = Infinity;

        for (const bazis of bazisok) {
            const tavolsag = tavolsagMatrix[jelenlegiPozicio][bazis.index];
            if (tavolsag < legkisebbTavolsag) {
                legkisebbTavolsag = tavolsag;
                legkozelebbi = bazis;
            }
        }

        return legkozelebbi;
    }

    bazisKornyezetiErc(bazisIndex, tavolsagMatrix, aszteroridaMennyisegek, aszteroidak) {
        let osszeg = 0;
        for (const aszteroida of aszteroidak) {
            const aktualisMennyiseg = aszteroridaMennyisegek[aszteroida.index] || 0;
            if (aktualisMennyiseg <= 0) {
                continue;
            }
            const tavolsag = tavolsagMatrix[bazisIndex][aszteroida.index];
            if (tavolsag > 220) {
                continue;
            }
            const suly = 1 / (1 + tavolsag / 60);
            osszeg += aktualisMennyiseg * suly;
        }
        return osszeg;
    }

    hajoIdoNovelese(hajo, korok) {
        const aktualis = this.hajoKorSzamitas(hajo);
        hajo.elteltKor = aktualis + korok;
        return hajo.elteltKor;
    }

    hajoKorSzamitas(hajo) {
        const alap = hajo.elerheto || 0;
        if (typeof hajo.elteltKor !== 'number' || hajo.elteltKor < alap) {
            hajo.elteltKor = alap;
        }
        return hajo.elteltKor;
    }

    osszesKorSzamitas(hajok) {
        let maxKor = 0;
        for (const hajo of hajok) {
            const kor = this.hajoKorSzamitas(hajo);
            if (kor > maxKor) {
                maxKor = kor;
            }
        }
        return maxKor;
    }
}

const megoldo = new FeladatMegoldo();
