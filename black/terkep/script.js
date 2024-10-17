const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let workshops = [];
let selectedBatteryType = null;
const serviceRadius = 100;

let availableFactories = { A: 0, B: 0, C: 0 };
let selectedTask = null;

// A városok száma és akkumulátor típusok
const cityCount = 5;
const batteryTypes = ['A', 'B', 'C'];

// Kérdések nehézség alapján
const easyQuestions = [
    { question: 'Mennyi 2+2?', answer: '4' },
    { question: 'Mennyi 1+6?', answer: '7' },
    { question: 'Mennyi 5+3?', answer: '8' }
];

const mediumQuestions = [
    { question: 'Mennyi 10*5?', answer: '50' },
    { question: 'Mennyi 12*3?', answer: '36' },
    { question: 'Mennyi 25/5?', answer: '5' }
];

const hardQuestions = [
    { question: 'Mennyi 2^8?', answer: '256' },
    { question: 'Mennyi 3^4?', answer: '81' },
    { question: 'Mennyi a 10^3?', answer: '1000' }
];

// Véletlenszerű városok generálása a canvas méretei alapján
function generateRandomCities() {
    const cities = [];
    
    for (let i = 0; i < cityCount; i++) {
        const randomX = Math.floor(Math.random() * (canvas.width - 40)) + 20; // 20-tól max width-ig
        const randomY = Math.floor(Math.random() * (canvas.height - 40)) + 20; // 20-tól max height-ig
        const randomBatteryType = batteryTypes[Math.floor(Math.random() * batteryTypes.length)];
        
        cities.push({x: randomX, y: randomY, batteryType: randomBatteryType});
    }

    return cities;
}

// Kezdetben generáljuk a városokat
let cities = generateRandomCities();

// Véletlenszerűen választ ki egy kérdést a megadott kérdéskészletből
function getRandomQuestion(questions) {
    return questions[Math.floor(Math.random() * questions.length)];
}

// Véletlenszerűen választ egy gyárat (A, B, vagy C)
function getRandomFactory() {
    const factories = ['A', 'B', 'C'];
    return factories[Math.floor(Math.random() * factories.length)];
}

// Véletlenszerűen választ két gyárat a nehéz kérdésnél
function getTwoRandomFactories() {
    const factory1 = getRandomFactory();
    let factory2 = getRandomFactory();
    
    // Biztosítjuk, hogy a két gyár különböző legyen
    while (factory1 === factory2) {
        factory2 = getRandomFactory();
    }

    return [factory1, factory2];
}

// Városok kirajzolása
function drawCities() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cities.forEach(city => {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = city.batteryType === 'A' ? 'red' :
                        city.batteryType === 'B' ? 'green' : 'blue';
        ctx.fill();
        ctx.stroke();
        ctx.fillText(city.batteryType, city.x - 5, city.y - 15);
    });
}

// Műhelyek kirajzolása
function drawWorkshops() {
    workshops.forEach(workshop => {
        ctx.beginPath();
        ctx.arc(workshop.x, workshop.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'gray';
        ctx.fill();
        ctx.stroke();
        ctx.fillText(workshop.batteryType, workshop.x - 5, workshop.y - 15);

        ctx.beginPath();
        ctx.arc(workshop.x, workshop.y, serviceRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'lightgray';
        ctx.stroke();
    });
}

function drawGame() {
    drawCities();
    drawWorkshops();
}

function openTaskForm(task, difficulty) {
    selectedTask = task;

    document.getElementById('taskTitle').textContent = `${difficulty} feladat`;
    document.getElementById('taskQuestion').textContent = task.question;
    document.getElementById('overlay').style.display = 'flex';
}

// Feladatok ellenőrzése
function checkAnswer(event) {
    event.preventDefault();
    const userAnswer = document.getElementById('answer').value;
    if (userAnswer === selectedTask.answer) {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('answer').value = '';

        let positions = [];

        // Könnyű és közepes kérdéseknél egy gyárat adunk
        if (selectedTask.difficulty === 'easy' || selectedTask.difficulty === 'medium') {
            const randomFactory = getRandomFactory();
            availableFactories[randomFactory]++;
            alert(`Helyes válasz! Nyeremény: ${randomFactory} típusú gyár. Most elhelyezheted a gyárat, amikor szeretnéd.`);
        } 
        // Nehéz kérdéseknél két gyárat adunk
        else if (selectedTask.difficulty === 'hard') {
            const [factory1, factory2] = getTwoRandomFactories();
            availableFactories[factory1]++;
            availableFactories[factory2]++;
            alert(`Helyes válasz! Nyeremény: ${factory1} és ${factory2} típusú gyár. Most elhelyezheted a gyárakat, amikor szeretnéd.`);
        }

        updateFactoryCount();
    } else {
        alert('Rossz válasz, próbáld újra!');
    }
}

function updateFactoryCount() {
    document.getElementById('countA').textContent = availableFactories.A;
    document.getElementById('countB').textContent = availableFactories.B;
    document.getElementById('countC').textContent = availableFactories.C;
}

function resetGame() {
    workshops.length = 0;
    availableFactories = { A: 0, B: 0, C: 0 };
    cities = generateRandomCities(); // Új véletlenszerű városok generálása
    updateFactoryCount();
    drawGame();
}

// Feladatok gombok megnyomásakor
document.getElementById('task1').addEventListener('click', () => {
    const randomTask = getRandomQuestion(easyQuestions);
    randomTask.difficulty = 'easy';
    openTaskForm(randomTask, 'Könnyű');
});

document.getElementById('task2').addEventListener('click', () => {
    const randomTask = getRandomQuestion(mediumQuestions);
    randomTask.difficulty = 'medium';
    openTaskForm(randomTask, 'Közepes');
});

document.getElementById('task3').addEventListener('click', () => {
    const randomTask = getRandomQuestion(hardQuestions);
    randomTask.difficulty = 'hard';
    openTaskForm(randomTask, 'Nehéz');
});

document.getElementById('reset').addEventListener('click', resetGame);
document.getElementById('questionForm').addEventListener('submit', checkAnswer);

document.getElementById('chooseA').addEventListener('click', () => selectedBatteryType = 'A');
document.getElementById('chooseB').addEventListener('click', () => selectedBatteryType = 'B');
document.getElementById('chooseC').addEventListener('click', () => selectedBatteryType = 'C');

canvas.addEventListener('click', (event) => {
    if (selectedBatteryType && availableFactories[selectedBatteryType] > 0) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        workshops.push({ x, y, batteryType: selectedBatteryType });
        availableFactories[selectedBatteryType]--;
        updateFactoryCount();
        drawGame();
    } else {
        alert('Nincs elérhető gyár ebből a típusból.');
    }
});

// Kezdő kirajzolás
drawGame();
