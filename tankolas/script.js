let adatok = JSON.parse(localStorage.getItem('tankolasAdatok')) || [];

function switchTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');

    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    if (body.classList.contains('dark-theme')) {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
}

document.addEventListener('DOMContentLoaded', () => {
    megjelenitTankolasAdatok(adatok);
    osszegzes(adatok);
    haviOsszegzes(adatok);

    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Dátumszűrés
    document.getElementById('szuresGomb').addEventListener('click', () => {
        const kezdoDatum = document.getElementById('kezdoDatum').value;
        const vegDatum = document.getElementById('vegDatum').value;
        const szurtAdatok = szuresDatumSzerint(adatok, kezdoDatum, vegDatum);
        megjelenitTankolasAdatok(szurtAdatok);
        osszegzes(szurtAdatok);
    });

    // Távolságok számítása és hatékonyság megjelenítése
    const tavolsagok = tavolsagokSzamitasa(adatok);
    tavolsagokMegjelenitese(tavolsagok);

    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const themeToggle = document.getElementById('themeToggle');

    if (savedTheme === 'light') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        document.body.classList.add('dark-theme');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }

    themeToggle.addEventListener('click', switchTheme);

    document.getElementById('tankolasForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const datum = document.getElementById('datum').value;

        const ev = new Date(datum).getFullYear();
        if (ev < 1000 || ev > 9999) {
            alert("Az évnek 4 számjegyűnek kell lennie (1000-9999).");
            return;
        }

        const mennyiseg = parseFloat(document.getElementById('mennyiseg').value);
        const osszeg = parseFloat(document.getElementById('osszeg').value);
        const kilometerora = parseFloat(document.getElementById('kilometerora').value);

        const ujAdat = { 
            datum, 
            mennyiseg, 
            osszeg, 
            kilometerora 
        };

        adatok.push(ujAdat);

        localStorage.setItem('tankolasAdatok', JSON.stringify(adatok));

        megjelenitTankolasAdatok(adatok);
        osszegzes(adatok);
    });

    document.getElementById('törlésGomb').addEventListener('click', function() {
        if (confirm("Biztosan törölni szeretnéd az összes adatot?")) {
            adatok = [];
            localStorage.removeItem('tankolasAdatok');
            megjelenitTankolasAdatok(adatok);
            osszegzes(adatok);
        }
    });

    document.getElementById('visszaGomb').addEventListener('click', function() {
        window.location.href = '../index.html'; 
    });

    document.getElementById('datum').addEventListener('input', function(e) {
        const value = e.target.value;
        const parts = value.split('T')[0].split('-');
        const year = parts[0];
        if (year.length > 4) {
            parts[0] = year.slice(0, 4);
            e.target.value = parts.join('-') + (value.includes('T') ? 'T' + value.split('T')[1] : '');
        }
    });
});

function megjelenitTankolasAdatok(adatok) {
    const tankolasAdatokElem = document.getElementById('tankolasAdatok');
    tankolasAdatokElem.innerHTML = '';

    adatok.forEach(adat => {
        const datum = new Date(adat.datum);
        const elem = document.createElement('div');
        elem.textContent = `${datum.toLocaleString()} - ${adat.mennyiseg} liter - ${adat.osszeg} Ft - ${adat.kilometerora} km`;
        tankolasAdatokElem.appendChild(elem);
    });
}
function haviOsszegzes(adatok) {
    const haviAdatok = {};

    adatok.forEach(adat => {
        const datum = new Date(adat.datum);
        const honap = `${datum.getFullYear()}-${datum.getMonth() + 1}`; // Formátum: ÉÉÉÉ-HH

        if (!haviAdatok[honap]) {
            haviAdatok[honap] = { osszesKoltseg: 0, osszesMennyiseg: 0 };
        }

        haviAdatok[honap].osszesKoltseg += adat.osszeg;
        haviAdatok[honap].osszesMennyiseg += adat.mennyiseg;
    });

    const haviOsszegzesElem = document.getElementById('haviOsszegzes');
    haviOsszegzesElem.innerHTML = ''; // Előző adatok törlése

    for (const honap in haviAdatok) {
        const div = document.createElement('div');
        div.textContent = `Hónap: ${honap}, Összes költség: ${haviAdatok[honap].osszesKoltseg} Ft, Összes üzemanyag: ${haviAdatok[honap].osszesMennyiseg} liter`;
        haviOsszegzesElem.appendChild(div);
    }
}

function szuresDatumSzerint(adatok, kezdoDatum, vegDatum) {
    return adatok.filter(adat => {
        const datum = new Date(adat.datum);
        return datum >= new Date(kezdoDatum) && datum <= new Date(vegDatum);
    });
}

function tavolsagokSzamitasa(adatok) {
    const tavolsagok = [];
    for (let i = 1; i < adatok.length; i++) {
        const tavolsag = adatok[i].kilometerora - adatok[i - 1].kilometerora;
        const uzemanyag = adatok[i].mennyiseg;
        const fogyasztas = tavolsag / uzemanyag; // km/liter
        tavolsagok.push({ tavolsag, uzemanyag, fogyasztas, datum: adatok[i].datum });
    }

    return tavolsagok.sort((a, b) => b.fogyasztas - a.fogyasztas); // Rendezzük hatékonyság szerint
}

function tavolsagokMegjelenitese(tavolsagok) {
    const tavolsagokElem = document.getElementById('tavolsagok');
    tavolsagokElem.innerHTML = ''; // Előző adatok törlése

    tavolsagok.forEach(t => {
        const div = document.createElement('div');
        div.textContent = `Dátum: ${new Date(t.datum).toLocaleString()}, Távolság: ${t.tavolsag} km, Üzemanyag: ${t.uzemanyag} liter, Hatékonyság: ${t.fogyasztas.toFixed(2)} km/l`;
        tavolsagokElem.appendChild(div);
    });
}

function osszegzes(adatok) {
    const osszesMennyiseg = adatok.reduce((acc, curr) => acc + curr.mennyiseg, 0);
    const osszesKoltseg = adatok.reduce((acc, curr) => acc + curr.osszeg, 0);
    const utolsoKilometerora = adatok.length > 0 ? adatok[adatok.length - 1].kilometerora : 0;

    document.getElementById('osszesMennyiseg').textContent = osszesMennyiseg;
    document.getElementById('osszesKoltseg').textContent = osszesKoltseg;
    document.getElementById('utolsoKilometerora').textContent = utolsoKilometerora;
}
