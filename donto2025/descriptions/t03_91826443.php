
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta charset="UTF-8">
		<title>3. Feladat</title>
	</head>
	<body>
		<h1>3. feladat: Mozgás és bányászás</h1>
	
		Most átnézzük, hogy miként lehet egy hajót irányítani. Itt is 4 egyforma feladat van csak más adatokkal. A feladat megoldása nem kötelező, de segíthet tesztelni a parancsok helyes összeállítását.<br/>
		A távolságokhoz használni kell a 2. feladatban meghatározott távolság mátrixot (persze újból ki kell számolni)!<br/>
		Először is, a bemeneti adatok kibővültek új adatokkal: Minden pozícióhoz tároljuk, hogy ott milyen típusú objektum található. Ez jelenleg lehet "Base", ami a bázist jelöli, vagy "Asteroid", ami egy aszteroidát. Egyelőre csak egy bázis van, de később lehet majd több is. Az aszteroidákhoz ezen felül tartozik egy mennyiség, hogy mennyi ércet lehet belőlük kibányászni.<br/>
		A feladatokban egyelőre egy hajónk van, amelyik a bázisról indul. Ezt lehet a pozíciók közötti mozgásra, valamint bányászásra utasítani. A parancsokat a válaszban a "commands" kulcs alatt kell elküldeni. A "commands" tömbök tömbje. Jelen feladatban csak 1 irányítandó hajó van, azonban a későbbiekben lesz több is. Így a "commands" minden hajóhoz megadja az utasítások, parancsok tömbjét. Minden parancs egy objektum, amelyben "command" kulccsal jelölve szerepel a parancs típusa, valamint az egyes típusoknak lehetnek saját magadandó adataik.<br/>
		Egyelőre három fajta parancsunk van:
		<ul>
		<li>Kezdő pozíció megadása ("STARTFROM"): Minden hajó számára ez az első utasítás, amegy egy "position" paraméterrel megadja, hogy melyik heéyszínről indul a hajó. Fontos, hogy a hajónak bázisról kell indulnia! Ez a parancs nem vesz el kört.</li>
		<li>Mozgás ("MOVE"): Ezzel lehet a hajót mozgásra utasítani. Meg kell neki adni egy "position" paramétert is, amely a célpont helyszín indexe a pozíció listában.</li>
		<li>Bányászás ("MINE"): Amennyiben a hajó aszteroidán van, ezzel a parancsal tud bányászni. Hogy ne kelljen túl sokszor kiadni, van egy másik paramétere: "rounds", amivel meg kell adni, hogy hány körig bányásszon.</li>
		</ul>
		Például a következő utasítás sorozattal adható meg, hogy a hajó a 4. helyszínről induljon, menjen a 2. indexű helyre, ott bányásszon 3 körig, majd menjen az 1. indexű helyre, ott is bányásszon 2 körig, majd menjen a 4. indexű helyre (ez egy bázis, tehát itt le is lakra a rakományát), majd onnan tovább a 0. indexűre:<br/>
		<pre>
		[
		{"command":"STARTFROM","position":4},
		{"command":"MOVE","position":2},
		{"command":"MINE","rounds":3},
		{"command":"MOVE","position":1},
		{"command":"MINE","rounds":2},
		{"command":"MOVE","position":4},
		{"command":"MOVE","position":0},
		]
		</pre>
		<br/>
		A feladat (nem kötelező megoldást beküldeni, de lehet vele tesztelni az alap parancsok logikáját): utasítsátok a hajót arra, hogy minden aszteroidát teljesen bányásszon ki, és minden ércet vigyen vissza a bázisra. A parancsok sorozatán kívül még két információt kell ellenőrzés véljából megadni: "totalRounds" kulccsal el kell küldeni, hogy a kiadott parancsok összesen mennyi körig tartanak, valamint "totalMined" kulccsal azt is, hogy összesen mennyi ércet sikerült kibányászni.
		<br/>
		További információk:<br/>
		<ul>
		<li>Ha a hajó a bázisra lép, akkor minden nála lévő ércet lerak, ez nem kerül időbe (nem annyiba, hogy foglalkozzunk vele).</li>
		<li>A hajónak van egy kapacitása. Ez jelenleg 25, de később lehet majd fejleszteni. A bányászással nem tud e fölé menni.</li>
		<li>A hajónak van egy mozgási sebessége, ami jelenleg 10. Ez azt jelenti, hogy egy kör alatt ennyi távolságot tesz meg (tehát ha a mátrix 36-ot ír távolságnak, akkor 4 kör alatt ér oda.</li>
		<li>A hajónak van egy bányászási sebessége is, vagyis, hogy egy környi bányászással mennyi ércet tud felvenni (feltéve, hogy még nem fogyott ki az aszteroida, és a hajó sincs tele). Ez az érték jelenleg 15.</li>
		<li>A végrehajtás során felmerült problémákat a szerver a "feedback" mezőben adja vissza. Amennyiben valami olyan hiba van a parancsokban, ami semmiképp sem lehetne jó (pl. bázison akarunk bányászni, vagy érvénytelen pozícióra megyünk), akkor ezt egy hibával jelzi, és a későbbi parancsokat ki sem értékeli. Amennyiben a parancssban lévő hiba csak szituációs (pl. bányászni akarunk, de már tele a hajó vagy üres a bánya), akkor csak megjegyzést ír róla, és a hajónak az a köre elveszik, de a szimuláció folytatódik.</li>
		</ul>
	</body>
</html>

