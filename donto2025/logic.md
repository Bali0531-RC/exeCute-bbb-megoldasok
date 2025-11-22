# Bányászat Optimalizáló - V4.1 Dokumentáció

## 🎯 Rövid Összefoglaló

**Cél:** Maximális érc begyűjtése körökre és hajók számára optimalizálva.

**Módszer:** Ultra-agresszív greedy algoritmus többhajós koordinációval, hibrid fejlesztési stratégiával.

---

## 🧠 Algoritmus Logika

### 1️⃣ Hajó Választása
Minden körben minden hajó **a legjövedelmezőbb aszteroidát** választja:

```
Hatékonyság = (hozam/idő) × bónuszok
```

**Bónuszok prioritása:**
- 🔥 **Nagy aszteroidák** (√mennyiség/5)
- 🏠 **Bázis közelség** (2.0/visszaút)
- 📦 **Üres hajók előnyben** (1.4× vs 0.6×)
- 📏 **Rövid távolság** (1/(1+út/12))
- ✅ **Teli kapacitás kihasználás** (1.4× ha pontosan megtelik)

### 2️⃣ Fejlesztési Stratégia

**Hibrid mining-capacity sorrend:**
1. 🔨 **2× Mining** (70 érc) - gyors korai bányászat
2. 📦 **2× Capacity** (200 érc) - kevesebb visszamenet
3. 🔨 **3× Mining** (105 érc) - maxolás 
4. 📦 **1× Capacity** (100 érc) - finomhangolás
5. ⚡ **3× Speed** (210 érc) - gyors mozgás

**Start:** 50 kör hátra + 35 érc

**Tempó:** 1-5 upgrade/kör (vagyontól függően)

### 3️⃣ Hajóvásárlás

**Dinamikus skálázás (4-20 hajó):**
```
hajók = min(érc/1800, kör/55, érc/320, max 20)
```

**Vásárlás:** 160 kör hátralévő idő alatt

### 4️⃣ Időgazdálkodás

**Minden művelet előtt ellenőrzés:**
```
út + bányászat + visszaút ≤ hátralévő körök
```

✅ Garantált időbeni visszaérkezés!

---

## 🎨 Vizualizáció Funkciók

### Interaktív Térkép
- 🖱️ **Drag & zoom** - térkép navigáció egérrel
- 🟠 **Dinamikus aszteroidák** - valós idejű érc szintek
- 🔵 **Hajók követése** - élő pozíció és rakományszint
- 🟢 **Bázis megjelenítés** - automatikus kirakodási pontok

### Élő Statisztikák
- 📊 **Körök** / Összesen
- 🏆 **Begyűjtött érc** + százalék
- 🚢 **Hajók száma** + egyéni statisztikák
- ⚡ **Fejlesztések** (speed/capacity/mining)

### Parancs Log
- ⏱️ **Időbélyegzős** események
- 🎯 **Hajó-specifikus** műveletek
- ⚡ **Upgrade értesítések** (előtte/utána értékekkel)
- ⚠️ **Hibajelzések** (elégtelen érc, stb.)

### Lejátszás Vezérlés
- ▶️ **Play/Pause** - szüneteltethető animáció
- 🔄 **Reset** - újraindítás
- ⏩ **1-10× sebesség** - teszteléshez

---

## 📈 Teljesítmény Célok

| Térképméret | Hajók | Cél |
|------------|-------|-----|
| Kis (20-40) | 8-12 | 55%+ |
| Közepes (40-70) | 12-16 | 65%+ |
| Nagy (70+) | 16-20 | 75%+ |

---

## 🛠️ Technikai Részletek

- **Iterációk:** 4000 max
- **Komplexitás:** O(4000 × 20 × 50) ≈ 4M művelet
- **API parancsok:** STARTFROM, MOVE, MINE, UPGRADE, BUY_SHIP
- **Szerver:** Automatikus kirakodás bázison (nincs UNLOAD)