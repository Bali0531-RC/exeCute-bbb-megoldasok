document.getElementById('setDrawTypeBtn').addEventListener('click', function() {
    const totalNumbers = parseInt(document.getElementById('totalNumbers').value);
    const drawNumbers = parseInt(document.getElementById('drawNumbers').value);
    const ticketContainer = document.getElementById('ticketContainer');
    const drawBtn = document.getElementById('drawBtn');
    const resultDiv = document.getElementById('result');

    ticketContainer.innerHTML = '';
    drawBtn.style.display = 'none';
    resultDiv.innerHTML = '';

    if (isNaN(totalNumbers) || isNaN(drawNumbers) || totalNumbers < 1 || drawNumbers < 1 || drawNumbers > totalNumbers) {
        alert('Hibás értékek. Kérem, adja meg a helyes számokat.');
        return;
    }

    for (let i = 0; i < drawNumbers; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = totalNumbers.toString();
        input.placeholder = `Szám ${i + 1}`;
        input.classList.add('ticket-number');
        ticketContainer.appendChild(input);
    }

    drawBtn.style.display = 'block';
});

document.getElementById('drawBtn').addEventListener('click', function() {
    const totalNumbers = parseInt(document.getElementById('totalNumbers').value);
    const drawNumbers = parseInt(document.getElementById('drawNumbers').value);
    const ticketInputs = Array.from(document.getElementsByClassName('ticket-number'));
    const ticketNumbers = ticketInputs.map(input => parseInt(input.value));
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';


    for (let i = 0; i < ticketNumbers.length; i++) {
        const num = ticketNumbers[i];
        if (isNaN(num) || num < 1 || num > totalNumbers) {
            alert(`Kérem, adja meg a helyes számot a(z) ${i + 1}. mezőben (1-${totalNumbers}).`);
            return;
        }

        for (let j = 0; j < i; j++) {
            if (ticketNumbers[j] === num) {
                alert(`A(z) ${i + 1}. szám ismétlődik a(z) ${j + 1}. mezőben.`);
                return;
            }
        }
    }


    const drawnNumbers = [];
    while (drawnNumbers.length < drawNumbers) {
        const randomNum = Math.floor(Math.random() * totalNumbers) + 1;
        if (!drawnNumbers.includes(randomNum)) {
            drawnNumbers.push(randomNum);
        }
    }

    // Számoljuk meg a találatokat
    const matches = ticketNumbers.filter(num => drawnNumbers.includes(num)).length;

    // Eredmények megjelenítése
    resultDiv.innerHTML = `<p>Sorsolt számok: ${drawnNumbers.join(', ')}</p>`;
    resultDiv.innerHTML += `<p>Találatok száma: ${matches}</p>`;
});

document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = '../../index.html';
});