
document.getElementById('evaluateBtn').addEventListener('click', evaluateBinary);
document.getElementById('generateBtn').addEventListener('click', generateRandomBinary);

function evaluateBinary() {
    const input = document.getElementById('binaryInput').value.trim();
    const errorDiv = document.getElementById('errorMsg');
    const statsDiv = document.getElementById('statistics');


    if (!/^[01]+$/.test(input)) {
        errorDiv.textContent = "Hiba: Csak '0' és '1' karaktereket fogadhat el.";
        statsDiv.style.display = 'none';
        return;
    }

    errorDiv.textContent = "";
    statsDiv.style.display = 'block';


    const countOnes = (input.match(/1/g) || []).length;
    const countZeros = (input.match(/0/g) || []).length;


    const longestOnes = Math.max(...input.split('0').map(s => s.length));


    const longestZeros = Math.max(...input.split('1').map(s => s.length));

    let longestAlt = 1;
    let currentAlt = 1;
    for (let i = 1; i < input.length; i++) {
        if (input[i] !== input[i - 1]) {
            currentAlt++;
            if (currentAlt > longestAlt) longestAlt = currentAlt;
        } else {
            currentAlt = 1;
        }
    }

 
    let longestRepeated = 0;
    for (let len = 2; len <= Math.floor(input.length / 2); len++) {
        for (let i = 0; i <= input.length - len * 2; i++) {
            const substr = input.substring(i, i + len);
            const regex = new RegExp(substr, 'g');
            const matches = input.match(regex);
            if (matches && matches.length >= 2 && len > longestRepeated) {
                longestRepeated = len;
            }
        }
    }


    document.getElementById('countOnes').textContent = `'1'-es karakterek száma: ${countOnes}`;
    document.getElementById('countZeros').textContent = `'0'-ás karakterek száma: ${countZeros}`;
    document.getElementById('longestOnes').textContent = `Leghosszabb '1'-es sorozat: ${longestOnes}`;
    document.getElementById('longestZeros').textContent = `Leghosszabb '0'-ás sorozat: ${longestZeros}`;
    document.getElementById('longestAlternating').textContent = `Leghosszabb váltakozó sorozat: ${longestAlt}`;
    document.getElementById('longestRepeated').textContent = `Leghosszabb ismétlődő részsorozat: ${longestRepeated}`;
}

function generateRandomBinary() {
    let length = prompt("Add meg a bináris sorozat hosszát:");
    if (length === null) return;
    length = parseInt(length);
    if (isNaN(length) || length <= 0) {
        alert("Kérlek, adj meg egy érvényes pozitív számot.");
        return;
    }
    let binary = '';
    for (let i = 0; i < length; i++) {
        binary += Math.random() < 0.5 ? '0' : '1';
    }
    document.getElementById('binaryInput').value = binary;
}
document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = '../../index.html';
});