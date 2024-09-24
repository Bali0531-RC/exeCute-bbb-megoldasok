// Adatok betöltése a localStorage-ból
let adatok = JSON.parse(localStorage.getItem('tankolasAdatok')) || [];

function switchTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');

    // Save theme preference
    const newTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
}

// Adatok betöltése és megjelenítése
document.addEventListener('DOMContentLoaded', () => {
    megjelenitTankolasAdatok(adatok);
    osszegzes(adatok);
    // DOM elements
    const themeToggle = document.getElementById('themeToggle');

    // Apply saved theme
    let savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        savedTheme = 'dark'; // Default to dark theme
        localStorage.setItem('theme', 'dark');
    }

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // Event listener for the theme toggle button
    themeToggle.addEventListener('click', switchTheme);

    // Adatbevitel kezelése
    document.getElementById('tankolasForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const datum = document.getElementById('datum').value;

        // Év ellenőrzése
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

        // Új adat hozzáadása a listához
        adatok.push(ujAdat);

        // A frissített adatokat mentjük a localStorage-ba
        localStorage.setItem('tankolasAdatok', JSON.stringify(adatok));

        // Megjelenítés és összegzés frissítése
        megjelenitTankolasAdatok(adatok);
        osszegzes(adatok);
    });

    // Törlés gomb kezelése
    document.getElementById('törlésGomb').addEventListener('click', function() {
        if (confirm("Biztosan törölni szeretnéd az összes adatot?")) {
            adatok = [];
            localStorage.removeItem('tankolasAdatok');
            megjelenitTankolasAdatok(adatok);
            osszegzes(adatok);
        }
    });

    // Vissza gomb kezelése
    document.getElementById('visszaGomb').addEventListener('click', function() {
        window.location.href = '../index.html'; 
    });

    // Restrict year to 4 digits
    document.getElementById('datum').addEventListener('input', function(e) {
        const value = e.target.value;
        // Extract the year part
        const parts = value.split('T')[0].split('-');
        const year = parts[0];
        if (year.length > 4) {
            // Limit the year to 4 characters
            parts[0] = year.slice(0, 4);
            e.target.value = parts.join('-') + (value.includes('T') ? 'T' + value.split('T')[1] : '');
        }
    });
});

// Tankolási adatok megjelenítése
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

// Összegzés
function osszegzes(adatok) {
    const osszesMennyiseg = adatok.reduce((acc, curr) => acc + curr.mennyiseg, 0);
    const osszesKoltseg = adatok.reduce((acc, curr) => acc + curr.osszeg, 0);
    const utolsoKilometerora = adatok.length > 0 ? adatok[adatok.length - 1].kilometerora : 0;

    document.getElementById('osszesMennyiseg').textContent = osszesMennyiseg;
    document.getElementById('osszesKoltseg').textContent = osszesKoltseg;
    document.getElementById('utolsoKilometerora').textContent = utolsoKilometerora;
}
