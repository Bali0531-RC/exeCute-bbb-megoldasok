// Óra
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('current-time').textContent = timeString;
}
setInterval(updateTime, 1000);
updateTime(); 

// Bemutatkozás megjelenítése/elrejtése
function toggleIntro(id) {
    const intro = document.getElementById(id);
    if (intro.style.display === 'none') {
        intro.style.display = 'block';
    } else {
        intro.style.display = 'none';
    }
}

// Képek kezelése
let images = ["image1.jpg", "image2.jpg", "image3.jpg", "image4.jpg"];
let currentIndex = 0;

// Overlay megnyitása
document.getElementById('openOverlay').addEventListener('click', function() {
    document.getElementById('imageOverlay').style.display = 'flex';
    showImage();
});

// Overlay bezárása
document.getElementById('closeOverlay').addEventListener('click', function() {
    document.getElementById('imageOverlay').style.display = 'none';
});

// Következő kép megjelenítése
document.getElementById('nextImage').addEventListener('click', function() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage();
});

// Kép megjelenítése
function showImage() {
    const imgElement = document.getElementById('overlayImage');
    imgElement.src = images[currentIndex];
}

// Vissza gomb kezelése
document.getElementById('visszaGomb').addEventListener('click', function() {
    window.location.href = '../index.html';
});