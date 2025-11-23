
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta charset="UTF-8">
		<title>4. Feladat</title>
	</head>
	<body>
		<h1>4. feladat: Fejlesztések</h1>
	
		Ez a feladat azt ismerteti, hogy miként lehet a hajók 3 tulajdonságát (mozgási sebesség, kapacitás, bányászási sebesség) fejleszteni. A feladat megoldása nem kötelező, de segíthet tesztelni a fejlesztések helyes implementálását.<br/>
		A távolságokhoz használni kell a 2. feladatban meghatározott távolság mátrixot (persze újból ki kell számolni)! Ezen felül célszerű ismerni a 3. feladatból az utasítások szerkezetét, hiszen itt azt bővítjük ki egy új utasítással.<br/>
		Ahhoz, hogy egy hajót fejlesszünk, annak a hajónak egy bázison kell lennie, és kiadnia az "UPGRADE" utasítást, amely mellé az "attribute" paraméterrel megadja, hogy melyik tulajdonságot szeretné fejleszteni: "move_speed", "capacity" vagy "mining_speed". Pl.: {"command": "UPGRADE", "attribute": "capacity"}. A fejlesztés minden esetben 1 kört vesz el.<br/>
		További feltétel, hogy rendelkezni kell elég raktárban lévő érccel. Amikor egy hajó bázisra lép, leteszi a nála lévő érceket raktárba. Az ércek tárolását nem kell bázisokra bontani, mehet az egész egy közös kupacba (az érceket a bázisok könnyen tudják egymás között küldözgetni).<br/>
		További információk:<br/>
		<ul>
		<li>Minden tulajdonságot maximum 5 alkalommal lehet egy hajón fejleszteni.</li>
		<li>A hajók mozgási sebessége alapból 10. Minden fejlesztés 70 ércbe kerül és 4 értékkel növeli a sebességet.</li>
		<li>A hajók kapacitása alapból 25. Minden fejlesztés 100 ércbe kerül és 15 értékkel növeli a kapacitást.</li>
		<li>A hajók bányászási sebessége alapból 15. Minden fejlesztés 35 ércbe kerül és 8 értékkel növeli a sebességet.</li>
		</ul>

		A feladat, hogy a hajó mindhárom tulajdonságát a maximum értékre fejlesszétek. Az utasítás sorozat mellé küldjétek el az össze bányászott ércet és a körök számát (ahogy a 3. feladetban is), valamint "stockQuantity" kulccsal a raktárban lévő ércek számát is, ami a teljes végrehajtás után ott marad.
	</body>
</html>

