const sorok = 5;
const oszlopok = 5;
let palya = [];
let jatekosHelyzet = { x: 0, y: 0 };
let osszesGyumolcs = 0;
let hatraLevoLepesek = 10;
let legjobbPontszam = 0;
let teleportHasznalt = false;
let resetHasznalt = false;
let teleportAktiv = true;
let jatekVege = false;

function jatekAllapotBetoltese() {
    const mentettAllapot = JSON.parse(localStorage.getItem('jatekAllapot'));
    if (mentettAllapot) {
        palya = mentettAllapot.palya;
        jatekosHelyzet = mentettAllapot.jatekosHelyzet;
        osszesGyumolcs = mentettAllapot.osszesGyumolcs;
        hatraLevoLepesek = mentettAllapot.hatraLevoLepesek;
        legjobbPontszam = mentettAllapot.legjobbPontszam;
        teleportHasznalt = mentettAllapot.teleportHasznalt;
        resetHasznalt = mentettAllapot.resetHasznalt;
        teleportAktiv = mentettAllapot.teleportAktiv;
        jatekVege = mentettAllapot.jatekVege;
        palyaFrissitese();
        document.getElementById('gyumolcs-szam').innerText = osszesGyumolcs;
        document.getElementById('hatra-levo-lepesek').innerText = hatraLevoLepesek;
        document.getElementById('legjobb-pontszam').innerText = legjobbPontszam;
    } else {
        palyaLetrehozasa();
    }
}

function jatekAllapotMentese() {
    const jatekAllapot = {
        palya,
        jatekosHelyzet,
        osszesGyumolcs,
        hatraLevoLepesek,
        legjobbPontszam,
        teleportHasznalt,
        resetHasznalt,
        teleportAktiv,
        jatekVege
    };
    localStorage.setItem('jatekAllapot', JSON.stringify(jatekAllapot));
}

function palyaLetrehozasa() {
    const palyaKontener = document.getElementById('palya-kontener');
    palyaKontener.innerHTML = '';

    palya = [];
    for (let i = 0; i < sorok; i++) {
        let sor = [];
        for (let j = 0; j < oszlopok; j++) {
            const mezohivatas = Math.floor(Math.random() * 11);
            sor.push(mezohivatas);

            const mezok = document.createElement('div');
            mezok.className = 'mezohivatas gyumolcsfa';
            mezok.id = `mezohivatas-${i}-${j}`;
            mezok.innerText = mezohivatas > 0 ? '📦' : '📬'; // Bezárt láda emoji (📦) vagy kinyitott láda emoji (📬)
            mezok.onclick = () => mezohivatasKattintas(i, j);
            palyaKontener.appendChild(mezok);
        }
        palya.push(sor);
        palyaKontener.appendChild(document.createElement('br'));
    }

    teleportAktiv = true;
    jatekVege = false;
    palyaFrissitese();
    jatekAllapotMentese();
}

function mezohivatasKattintas(x, y) {
    if (!jatekVege && (teleportAktiv || mozdithato(x, y))) {
        jatekosMozgatas(x, y);
    }
}

function mozdithato(x, y) {
    return (
        (x === jatekosHelyzet.x && Math.abs(y - jatekosHelyzet.y) === 1) ||
        (y === jatekosHelyzet.y && Math.abs(x - jatekosHelyzet.x) === 1)
    );
}

function jatekosMozgatas(ujX, ujY) {
    jatekosHelyzet = { x: ujX, y: ujY };
    gyumolcsSzuletes(ujX, ujY);
    
    if (!teleportHasznalt && !teleportAktiv) {
        hatraLevoLepesek--;
    }

    document.getElementById('hatra-levo-lepesek').innerText = hatraLevoLepesek;
    teleportAktiv = false;
    palyaFrissitese();
    jatekAllapotMentese();

    if (hatraLevoLepesek <= 0) { // Ha a lépések száma 0, befejezzük a játékot
        jatekVegeKezelese();
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
            const mezok = document.getElementById(`mezohivatas-${i}-${j}`);
            mezok.classList.remove('jatekos', 'mozdithato', 'nem-mozdithato');
            
            mezok.innerText = palya[i][j] > 0 ? '📦' : '📬'; // Bezárt láda emoji vagy kinyitott láda emoji
            
            if (i === jatekosHelyzet.x && j === jatekosHelyzet.y) {
                mezok.classList.add('jatekos');
            } else if (teleportAktiv || mozdithato(i, j)) {
                mezok.classList.add('mozdithato');
                mezok.onclick = () => mezohivatasKattintas(i, j);
            } else {
                mezok.classList.add('nem-mozdithato');
                mezok.onclick = null;
            }

            if (palya[i][j] === 0) {
                mezok.classList.remove('gyumolcsfa');
                mezok.classList.add('ures-fa');
            } else {
                mezok.classList.add('gyumolcsfa');
                mezok.classList.remove('ures-fa');
            }
        }
    }
    document.getElementById(`mezohivatas-${jatekosHelyzet.x}-${jatekosHelyzet.y}`).classList.add('jatekos');
}

function jatekVegeKezelese() {
    alert('Játék vége! Pontszámod: ' + osszesGyumolcs);
    if (osszesGyumolcs > legjobbPontszam) {
        legjobbPontszam = osszesGyumolcs;
        document.getElementById('legjobb-pontszam').innerText = legjobbPontszam;
    }
    jatekVege = true;
    jatekAllapotMentese();
}

function teleportKepessegHasznalata() {
    teleportAktiv = true;
    document.getElementById('teleport-gomb').style.display = 'none';
    palyaFrissitese();
}

function palyaUjratoltese() {
    for (let i = 0; i < sorok; i++) {
        for (let j = 0; j < oszlopok; j++) {
            palya[i][j] = Math.floor(Math.random() * 11);
        }
    }
    resetHasznalt = true;
    document.getElementById('reset-palya-gomb').style.display = 'none';
    palyaFrissitese();
    jatekAllapotMentese();
}

function jatekUjrainditasa() {
    osszesGyumolcs = 0;
    hatraLevoLepesek = 10;
    jatekosHelyzet = { x: 0, y: 0 };
    teleportHasznalt = false;
    resetHasznalt = false;
    teleportAktiv = true;
    jatekVege = false;
    document.getElementById('gyumolcs-szam').innerText = osszesGyumolcs;
    document.getElementById('hatra-levo-lepesek').innerText = hatraLevoLepesek;
    document.getElementById('teleport-gomb').style.display = 'inline';
    document.getElementById('reset-palya-gomb').style.display = 'inline';
    palyaLetrehozasa();
    jatekAllapotMentese();
}

document.addEventListener('keydown', function(event) {
    if (!jatekVege) {
        if (event.key === 'ArrowUp' && mozdithato(jatekosHelyzet.x - 1, jatekosHelyzet.y)) {
            jatekosMozgatas(jatekosHelyzet.x - 1, jatekosHelyzet.y);
        } else if (event.key === 'ArrowDown' && mozdithato(jatekosHelyzet.x + 1, jatekosHelyzet.y)) {
            jatekosMozgatas(jatekosHelyzet.x + 1, jatekosHelyzet.y);
        } else if (event.key === 'ArrowLeft' && mozdithato(jatekosHelyzet.x, jatekosHelyzet.y - 1)) {
            jatekosMozgatas(jatekosHelyzet.x, jatekosHelyzet.y - 1);
        } else if (event.key === 'ArrowRight' && mozdithato(jatekosHelyzet.x, jatekosHelyzet.y + 1)) {
            jatekosMozgatas(jatekosHelyzet.x, jatekosHelyzet.y + 1);
        }
    }
});

window.onload = function() {
    jatekAllapotBetoltese();
    const mentettLegjobbPontszam = localStorage.getItem('legjobbPontszam');
    if (mentettLegjobbPontszam) {
        legjobbPontszam = parseInt(mentettLegjobbPontszam);
        document.getElementById('legjobb-pontszam').innerText = legjobbPontszam;
    }
};
