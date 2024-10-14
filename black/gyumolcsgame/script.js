const sorok = 5;
const oszlopok = 5;
let palya = [];
let jatekosHelyzet = null;
let osszesGyumolcs = 0;
let hatraLevoLepesek = 10;
let legjobbPontszam = parseInt(localStorage.getItem('legjobbPontszam')) || 0;
let teleportAktiv = false;
let gyumolcsSzuretAktiv = true;
let jatekVege = false;
let kezdoPozicioValasztva = false;
let eredetiPalya = [];

function jatekAllapotBetoltese() {
    palyaLetrehozasa();
}

function palyaLetrehozasa() {
    const palyaKontener = document.getElementById('palya-kontener');
    palyaKontener.innerHTML = '';

    palya = [];
    for (let i = 0; i < sorok; i++) {
        let sor = [];
        const sorElem = document.createElement('div');
        sorElem.className = 'sor';
        for (let j = 0; j < oszlopok; j++) {
            const gyumolcsSzam = Math.floor(Math.random() * 10) + 1;
            sor.push(gyumolcsSzam);

            const mezo = document.createElement('div');
            mezo.className = 'mezohivatas gyumolcsfa kezdo-mezo';
            mezo.id = `mezohivatas-${i}-${j}`;
            mezo.style.backgroundImage = gyumolcsSzam > 0 ? "url('https://cdn-icons-png.flaticon.com/512/415/415733.png')" : "url('https://cdn-icons-png.flaticon.com/512/489/489969.png')";
            mezo.innerText = '';
            if (gyumolcsSzam > 0) {
                const gyumolcsErtekElem = document.createElement('div');
                gyumolcsErtekElem.className = 'gyumolcs-ertek';
                gyumolcsErtekElem.innerText = gyumolcsSzam;
                mezo.appendChild(gyumolcsErtekElem);
            }
            mezo.onclick = () => {
                if (!jatekosHelyzet || (jatekosHelyzet.x === i && jatekosHelyzet.y === j)) {
                    kezdoPozicioValasztasa(i, j);
                }
            };
            sorElem.appendChild(mezo);
        }
        palya.push(sor);
        palyaKontener.appendChild(sorElem);
    }

    eredetiPalya = JSON.parse(JSON.stringify(palya));
    gyumolcsSzuretAktiv = true;
    jatekVege = false;
}

function palyaUjraprobalkozas() {
    palya = JSON.parse(JSON.stringify(eredetiPalya));
    osszesGyumolcs = 0;
    hatraLevoLepesek = 10;
    jatekosHelyzet = null;
    kezdoPozicioValasztva = false;
    teleportAktiv = false;
    gyumolcsSzuretAktiv = true;
    jatekVege = false;
    document.getElementById('gyumolcs-szam').innerText = osszesGyumolcs;
    document.getElementById('hatra-levo-lepesek').innerText = hatraLevoLepesek;
    document.getElementById('teleport-gomb').disabled = false;
    document.getElementById('gyumolcs-szuret-gomb').disabled = false;
    palyaLetrehozasa();
    palyaFrissitese(); // Hozzáadva a kattinthatóság visszaállításához
}

function kezdoPozicioValasztasa(x, y) {
    if (!kezdoPozicioValasztva) {
        jatekosHelyzet = { x, y };
        gyumolcsSzuletes(x, y);
        kezdoPozicioValasztva = true;
        palyaFrissitese();
        document.getElementById('hatra-levo-lepesek').innerText = hatraLevoLepesek;
    }
}

function gyumolcsSzuletes(x, y) {
    osszesGyumolcs += palya[x][y];
    palya[x][y] = 0;
    document.getElementById('gyumolcs-szam').innerText = osszesGyumolcs;
}
function palyaFrissitese() {
    for (let i = 0; i < sorok; i++) {
        for (let j = 0; j < oszlopok; j++) {
            const mezo = document.getElementById(`mezohivatas-${i}-${j}`);
            mezo.classList.remove('jatekos', 'mozdithato', 'kezdo-mezo');
            mezo.style.backgroundImage = palya[i][j] > 0 ? "url('https://cdn-icons-png.flaticon.com/512/415/415733.png')" : "url('https://cdn-icons-png.flaticon.com/512/489/489969.png')";
            mezo.innerText = '';
            mezo.onclick = null; // Minden mezőről eltávolítjuk az onclick eseményt

            if (palya[i][j] > 0) {
                const gyumolcsErtekElem = document.createElement('div');
                gyumolcsErtekElem.className = 'gyumolcs-ertek';
                gyumolcsErtekElem.innerText = palya[i][j];
                mezo.appendChild(gyumolcsErtekElem);
            }
            if (jatekosHelyzet && i === jatekosHelyzet.x && j === jatekosHelyzet.y) {
                mezo.classList.add('jatekos');
            } else if (!kezdoPozicioValasztva) {
                mezo.classList.add('kezdo-mezo');
            }

            // Visszaállítjuk az onclick eseményt
            mezo.onclick = () => {
                if (!jatekosHelyzet || (jatekosHelyzet.x === i && jatekosHelyzet.y === j)) {
                    kezdoPozicioValasztasa(i, j);
                }
            };
        }
    }

    if (jatekosHelyzet && !jatekVege) {
        const mozdithatoMezok = [];

        if (teleportAktiv) {
            for (let i = 0; i < sorok; i++) {
                for (let j = 0; j < oszlopok; j++) {
                    if (!(jatekosHelyzet && i === jatekosHelyzet.x && j === jatekosHelyzet.y)) {
                        mozdithatoMezok.push({ x: i, y: j });
                    }
                }
            }
        } else {
            mozdithatoMezok.push(
                { x: jatekosHelyzet.x - 1, y: jatekosHelyzet.y },
                { x: jatekosHelyzet.x + 1, y: jatekosHelyzet.y },
                { x: jatekosHelyzet.x, y: jatekosHelyzet.y - 1 },
                { x: jatekosHelyzet.x, y: jatekosHelyzet.y + 1 }
            );
        }

        mozdithatoMezok.forEach(({ x, y }) => {
            if (x >= 0 && x < sorok && y >= 0 && y < oszlopok) {
                const mezo = document.getElementById(`mezohivatas-${x}-${y}`);
                mezo.classList.add('mozdithato');
                mezo.onclick = () => jatekosMozgatas(x, y);
            }
        });
    }
}
function jatekosMozgatas(x, y) {
    if (kezdoPozicioValasztva && !jatekVege && hatraLevoLepesek > 0) {
        // Ellenőrizzük, hogy a célpont mozdítható-e
        const mezo = document.getElementById(`mezohivatas-${x}-${y}`);
        if (mezo.classList.contains('mozdithato')) {
            jatekosHelyzet = { x, y };
            gyumolcsSzuletes(x, y);
            hatraLevoLepesek--;
            document.getElementById('hatra-levo-lepesek').innerText = hatraLevoLepesek;

            // Képességek deaktiválása a használat után
            if (teleportAktiv) {
                teleportAktiv = false;
                document.getElementById('teleport-gomb').disabled = true;
            }

            palyaFrissitese();

            if (hatraLevoLepesek === 0) {
                jatekVegeKezelese();
            }
        }
    }
}
function jatekVegeKezelese() {
    alert('Játék vége! Pontszámod: ' + osszesGyumolcs);
    if (osszesGyumolcs > legjobbPontszam) {
        legjobbPontszam = osszesGyumolcs;
        document.getElementById('legjobb-pontszam').innerText = legjobbPontszam;
        localStorage.setItem('legjobbPontszam', legjobbPontszam.toString());
    }
    jatekVege = true;
}

function teleportKepessegHasznalata() {
    if (!jatekVege) {
        teleportAktiv = true;
        palyaFrissitese(); // Frissítjük a mezők állapotát, hogy minden mező mozdítható legyen
    }
}


function gyumolcsSzuretSzomszedosMezokrol() {
    if (gyumolcsSzuretAktiv && !jatekVege && jatekosHelyzet) {
        const szomszedosMezok = [
            { x: jatekosHelyzet.x - 1, y: jatekosHelyzet.y },
            { x: jatekosHelyzet.x + 1, y: jatekosHelyzet.y },
            { x: jatekosHelyzet.x, y: jatekosHelyzet.y - 1 },
            { x: jatekosHelyzet.x, y: jatekosHelyzet.y + 1 }
        ];
        szomszedosMezok.forEach(({ x, y }) => {
            if (x >= 0 && x < sorok && y >= 0 && y < oszlopok && palya[x][y] > 0) {
                osszesGyumolcs += 1;
                palya[x][y] = Math.max(0, palya[x][y] - 1);
            }
        });
        document.getElementById('gyumolcs-szam').innerText = osszesGyumolcs;
        gyumolcsSzuretAktiv = false;
        document.getElementById('gyumolcs-szuret-gomb').disabled = true;
        palyaFrissitese();
    }
}

function jatekUjrainditasa() {
    osszesGyumolcs = 0;
    hatraLevoLepesek = 10;
    jatekosHelyzet = null;
    teleportAktiv = false;
    gyumolcsSzuretAktiv = true;
    jatekVege = false;
    kezdoPozicioValasztva = false;
    document.getElementById('gyumolcs-szam').innerText = osszesGyumolcs;
    document.getElementById('hatra-levo-lepesek').innerText = hatraLevoLepesek;
    document.getElementById('teleport-gomb').disabled = false;
    document.getElementById('gyumolcs-szuret-gomb').disabled = false;
    palyaLetrehozasa();
}

window.onload = function() {
    legjobbPontszam = parseInt(localStorage.getItem('legjobbPontszam')) || 0;
    document.getElementById('legjobb-pontszam').innerText = legjobbPontszam;
    jatekAllapotBetoltese();
};
