document.getElementById('renderBtn').addEventListener('click', function() {
    const mapInput = document.getElementById('mapInput').value;
    const mapResult = document.getElementById('mapResult');
    mapResult.innerHTML = '';

    const inputArray = mapInput.trim().split(/\s+/).filter(item => item !== '');
    if (inputArray.length < 3) {
        alert('Kérem, adja meg a térkép leírását.');
        return;
    }

    const width = parseInt(inputArray[0]);
    const height = parseInt(inputArray[1]);
    const data = inputArray.slice(2);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        alert('Hibás szélesség vagy magasság érték.');
        return;
    }

    if (data.length !== width * height) {
        alert('A megadott adatok száma nem megfelelő.');
        return;
    }

    let index = 0;
    for (let y = 0; y < height; y++) {
        const row = document.createElement('div');
        row.style.display = 'block';
        for (let x = 0; x < width; x++) {
            const cellValue = data[index];
            const cell = document.createElement('div');
            cell.classList.add('map-cell');
            if (cellValue === '0') {
                cell.classList.add('map-white');
            } else if (cellValue === '1') {
                cell.classList.add('map-black');
            } else {
                alert('Hibás cella érték: ' + cellValue);
                return;
            }
            row.appendChild(cell);
            index++;
        }
        mapResult.appendChild(row);
    }
});

document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = '../../index.html';
});