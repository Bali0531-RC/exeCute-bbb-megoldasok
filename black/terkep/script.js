const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let workshops = [];
let selectedBatteryType = null;
const serviceRadius = 100;
let availableFactories = { A: 3, B: 3, C: 3 };

const levels = [
    {
        name: '1. pálya',
        cities: [
            { x: 100, y: 100, batteryType: 'A' },
            { x: 220, y: 220, batteryType: 'A' },
            { x: 400, y: 150, batteryType: 'C' },
            { x: 500, y: 200, batteryType: 'C' },
            { x: 200, y: 400, batteryType: 'B' },
            { x: 450, y: 500, batteryType: 'B' }
        ],
        factories: { A: 1, B: 2, C: 1 } 
    },
    {
        name: '2. pálya',
        cities: [
            { x: 150, y: 150, batteryType: 'A' },
            { x: 450, y: 450, batteryType: 'A' },
            { x: 450, y: 150, batteryType: 'B' },
            { x: 300, y: 300, batteryType: 'B' },
            { x: 150, y: 450, batteryType: 'C' }
        ],
        factories: { A: 2, B: 2, C: 1 }
    },
    {
        name: '3. pálya',
        cities: [
            { x: 500, y: 100, batteryType: 'A' },
            { x: 100, y: 100, batteryType: 'B' },
            { x: 200, y: 500, batteryType: 'B' },
            { x: 300, y: 400, batteryType: 'C' },
            { x: 400, y: 500, batteryType: 'C' }
        ],
        factories: { A: 1, B: 2, C: 1 }
    }
];

let currentLevel = 0;
let cities = levels[currentLevel].cities;

function checkCitySatisfaction() {
    let allCitiesSatisfied = true;

    cities.forEach(city => {
        let citySatisfied = false;
        workshops.forEach(workshop => {
            const distance = Math.sqrt(Math.pow(workshop.x - city.x, 2) + Math.pow(workshop.y - city.y, 2));
            if (distance <= serviceRadius && workshop.batteryType === city.batteryType) {
                citySatisfied = true;
            }
        });

        city.satisfied = citySatisfied;
        if (!citySatisfied) {
            allCitiesSatisfied = false;
        }
    });

    return allCitiesSatisfied;
}

function drawCities() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cities.forEach(city => {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = city.batteryType === 'A' ? 'red' : city.batteryType === 'B' ? 'green' : 'blue';
        ctx.fill();
        ctx.strokeStyle = city.satisfied ? '#ffffff' : 'red';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(city.batteryType, city.x, city.y);
    });
}

function drawWorkshops() {
    workshops.forEach(workshop => {
        ctx.beginPath();
        ctx.arc(workshop.x, workshop.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'gray';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(workshop.batteryType, workshop.x, workshop.y);

        ctx.beginPath();
        ctx.arc(workshop.x, workshop.y, serviceRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'lightgray';
        ctx.stroke();
    });
}

function drawGame() {
    drawCities();
    drawWorkshops();
    const allCitiesSatisfied = checkCitySatisfaction();

    if (allCitiesSatisfied) {
        alert('Minden város ki van szolgálva! Gratulálok!');
    }
}

function updateFactoryCount() {
    document.getElementById('countA').textContent = availableFactories.A;
    document.getElementById('countB').textContent = availableFactories.B;
    document.getElementById('countC').textContent = availableFactories.C;
}

canvas.addEventListener('click', (event) => {
    if (selectedBatteryType && availableFactories[selectedBatteryType] > 0) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        workshops.push({ x, y, batteryType: selectedBatteryType });
        availableFactories[selectedBatteryType]--;
        updateFactoryCount();
        checkCitySatisfaction(); 
        drawGame();
    } else {
        alert('Nincs elérhető műhely ebből a típusból.');
    }
});

document.getElementById('levelSelect').addEventListener('change', (event) => {
    currentLevel = parseInt(event.target.value);
    cities = levels[currentLevel].cities;
    resetGame();
});

document.getElementById('reset').addEventListener('click', () => {
    resetGame();
});

function resetGame() {
    workshops = [];
    availableFactories = { ...levels[currentLevel].factories };
    updateFactoryCount();
    drawGame();
}

document.getElementById('chooseA').addEventListener('click', () => selectedBatteryType = 'A');
document.getElementById('chooseB').addEventListener('click', () => selectedBatteryType = 'B');
document.getElementById('chooseC').addEventListener('click', () => selectedBatteryType = 'C');

resetGame();