# BBB 2025 Döntő - Optimális Bányászat Algoritmus
## Prezentáció (5 dia)

---

## 1. DIA: Probléma és Megoldás Áttekintése

### Algoritmus Típusa
- **Greedy algoritmus iteratív optimalizációval**
- 4000 iterációs ciklus
- Dinamikus hajókezelés (4-20 hajó)
- Real-time priorizálás hatékonysági értékek alapján

---

## 2. DIA: Hajó Menedzsment Stratégia

### Dinamikus Hajószám Kalkuláció
A rendszer 3 szempont alapján határozza meg az optimális hajószámot:

```
Érc alapú:     hajók = érc ÷ 1400
Idő alapú:     hajók = körök ÷ 45
Költség alapú: hajók = érc ÷ 280
```

**Végső hajószám**: `min(max(érc/1400, 5), kör/45, érc/280, 22)`

### Hajóvásárlás Időzítése - **ELSŐ PRIORITÁS!**
- **Stratégia**: Hajók MINDIG előbb, mint fejlesztések
- **Feltétel**: Raktár ≥ 300 érc ÉS hátralevő körök > 120
- **Limit**: Maximum 22 hajó
- **Védelem**: Raktár ≥ 1.8× hajó költség megmarad
- **Kritikus**: Fejlesztéseket CSAK akkor, ha elég hajó van VAGY kevés idő maradt

### Miért Agresszív?
- Korai hajóvásárlás = több kör párhuzamos bányászatra
- Több hajó = gyorsabb ércgyűjtés = korábbi fejlesztések
- Visszacsatolási hurok: több érc → több hajó → még több érc

---

## 3. DIA: Fejlesztési Stratégia (Hibrid Megközelítés)

### Prioritási Sorrend
**FONTOS: Fejlesztések CSAK ha elég hajó van!**

**Fázis 1-2: Capacity-First (Hatékonyság)**
1. **2× mining_speed** (+16 sebesség, 70 érc)
2. **3× capacity** (+45 kapacitás, 300 érc) - PRIORITÁS!

**Fázis 3-5: Kiegyensúlyozott Maxolás**
3. **3× mining_speed** (+24 sebesség, 105 érc) → **TOTAL: 5×**
4. **1× capacity** (+15 kapacitás, 100 érc) → **TOTAL: 4×**
5. **5× move_speed** (+20 sebesség, 350 érc)

### Fejlesztés Végrehajtása
**Feltétel**: Hajó a bázison ÉS üres ÉS raktár ≥ 60 érc ÉS (elég hajó VAGY kevés idő)
- **Okos batch**: Gazdagságtól függően 1-4 upgrade/kör
  - Raktár > 600 → 4 upgrade
  - Raktár > 400 → 3 upgrade
  - Raktár > 200 → 2 upgrade
  - Alapeset → 1 upgrade
- **Extra mining**: Csak ha raktár > 200 ÉS 60+ kör hátra
---

## 4. DIA: Aszteroida Kiválasztási Algoritmus

### 5 Komponensű Hatékonysági Formula

Minden aszteroidára kiszámoljuk az alábbi értéket:

```
Hatékonyság = (Hozam ÷ IdőKöltség) × 
              (1 + BázisBonus + MennyiségBonus) × 
              RakományBonus × 
              TávolságBüntetés × 
              TeljesKapacitásBonus
```

### Komponensek Részletesen

**1. Alap Hatékonyság**
- `Hozam = min(elérhető érc, szabad kapacitás)`
- `IdőKöltség = mozgási körök + bányászási körök`

**2. BázisBonus** = `2.5 ÷ (visszaút körök + 1)`
- Közeli aszteroidák ERŐS előnyben
- 25% erősebb V4.1-hez képest

**3. MennyiségBonus** = `√(elérhető érc) ÷ 4`
- Nagy aszteroidák MAXIMÁLIS preferálása
- 25% erősebb súlyozás

**4. RakományBonus**
- Üres hajó: **1.5** (AZONNAL kezdj új utat!)
- Részben teli: **0.5** (fejezd be GYORSAN)
- 50% különbség → ultra-határozott döntések

**5. TávolságBüntetés** = `1 ÷ (1 + mozgás ÷ 15)`
- Távoli aszteroidák KOMOLY büntetése
- 25% szigorúbb

**6. TeljesKapacitásBonus**
- Teli hajó lesz: **1.5**
- Részben telik: **1.0**
- 11% magasabb preferencia → teljes töltés prioritás

### Döntési Folyamat
1. Minden elérhető aszteroidára kiszámoljuk a hatékonysági értéket
2. A legmagasabb értékű aszteroida nyer
3. Ha tele a hajó → vissza a bázisra
4. Ha nincs jó aszteroida → vissza a bázisra

---

## 5. DIA: Algoritmus Teljesítmény és Összegzés

### Számítási Komplexitás
- **Időbeli**: O(iterációk × hajók × aszteroidák) ≈ O(4000 × 20 × 50) = O(4M)
- **Térbeli**: O(hajók + aszteroidák + távolságmátrix) ≈ O(n²)
- **Real-time**: ~100-300ms JavaScript futás böngészőben

### Verzió Evolúció
**V5.0 → V5.1 (Okos Hajó-Prioritás)**
- **KRITIKUS FIX**: Hajóvásárlás ELŐRE került a fejlesztések elé
- Hajók: 25 → 22 (realisztikusabb)
- Hajóvásárlás: 100 kör → 120 kör, védelem 1.5× → 1.8×
- Fejlesztés küszöb: 20 érc → 60 érc (okosabb)
- Capacity-first: 2× → 3× (több érc/körút)
- Batch upgrade: max 6 → max 4 (visszafogottabb)
- Extra mining: 30 kör → 60 kör ÉS raktár > 200

### Kulcs Innovációk
✅ **Hajó-első stratégia** - Mindig hajók, aztán fejlesztések  
✅ **Capacity-prioritás** - 3× capacity a hatékonyságért  
✅ **Okos batch upgradeek** - Max 4, magas küszöbökkel  
✅ **Optimalizált formula** - 20-25% erősebb komponensek  
✅ **Realisztikus paraméterek** - 22 hajó, 120 kör limit  

### Következtetés
Az algoritmus **OKOS agresszív stratégiát** követ:
- **1. PRIORITÁS**: Maximum hajók (22) mielőtt fejlesztések
- **2. Capacity boost**: 3× kapacitás = kevesebb körút
- **3. Csak akkor fejleszt**: Ha elég hajó VAN vagy kevés idő
- **4. Magas küszöbök**: Raktár ≥ 60 érc fejlesztéshez

**Cél**: 24.6% → **45-55%** teljesítmény V5.1-gyel (stabil)
