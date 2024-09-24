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

    const savedTheme = localStorage.getItem('theme') || 'dark';

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

function osszegzes(adatok) {
    const osszesMennyiseg = adatok.reduce((acc, curr) => acc + curr.mennyiseg, 0);
    const osszesKoltseg = adatok.reduce((acc, curr) => acc + curr.osszeg, 0);
    const utolsoKilometerora = adatok.length > 0 ? adatok[adatok.length - 1].kilometerora : 0;

    document.getElementById('osszesMennyiseg').textContent = osszesMennyiseg;
    document.getElementById('osszesKoltseg').textContent = osszesKoltseg;
    document.getElementById('utolsoKilometerora').textContent = utolsoKilometerora;
}
