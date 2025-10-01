document.getElementById('submitBtn').addEventListener('click', function() {
    const numberInput = document.getElementById('userNumber').value;
    const num = parseInt(numberInput);
    const errorMsg = document.getElementById('errorMsg');
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    errorMsg.textContent = '';

    if (num < 2 || num > 100 || isNaN(num)) {
        errorMsg.textContent = 'A számnak 2 és 100 között kell lennie!';
        return;
    }

    function countDivisors(n) {
        let count = 0;
        for (let i = 1; i <= n; i++) {
            if (n % i === 0) {
                count++;
            }
        }
        return count;
    }

    const numDivisors = countDivisors(num);

    const numbersWithFewerDivisors = [];
    for (let i = 2; i <= 100; i++) {
        if (i === num) continue;
        let divisors = countDivisors(i);
        if (divisors < numDivisors) {
            numbersWithFewerDivisors.push(i);
        }
    }

    if (numbersWithFewerDivisors.length > 0) {
        resultDiv.innerHTML = '<p>A következő számoknak kevesebb osztója van mint a megadott számnak:</p>';
        resultDiv.innerHTML += '<p>' + numbersWithFewerDivisors.join(', ') + '</p>';
    } else {
        resultDiv.innerHTML = '<p>Nincs olyan szám 2 és 100 között, aminek kevesebb osztója van, mint a megadott számnak.</p>';
    }
});
document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = '../../index.html';
});