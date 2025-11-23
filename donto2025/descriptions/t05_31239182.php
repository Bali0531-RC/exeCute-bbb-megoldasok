
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta charset="UTF-8">
		<title>5. Feladat</title>
	</head>
	<body>
		<h1>5. feladat: Több hajó</h1>
	
		Az utolsó mechanika, amivel számolni kell a feladat során, hogy egyszerre több hajót is lehet irányítani, és van lehetőség új hajók beszerzésére is. A feladat megoldása nem kötelező, de érdemes rá figyelmet fordítani, mert egyszerre több hajó parancsait megtervezni jelentősen nehezebb, mint csak egy hajóval számolni. Illetve az érdekesség kedvéért itt kettő bázis is van.<br/>
		Habár több hajót kezelni logikailag jóval nehezebb, mint egyet, a parancsok átadása a szervernek nem nehéz. Ahogy a 3. feladat is leírta, az elküldött "commands" tömb minden hajóhoz tartalmazza az utasítások tömbjét. Tehát ha 3 hajó van, akkor 3 elemű lesz a tömb, ahol minden elem egy tömb az adott hajó utasításaival.<br/>
		Mi a helyzet a hajók számával? Lehet, hogy más feladatoknál feltűnt, hogy a szerver a paraméterek között küld egy "shipCount" paramétert is. Ez adja meg, hogy kezdetben mennyi hajóval indulunk. Ezen felül azonban extra hajókat is lehet venni. Ez olyan utasítás, amit nem meglévő hajók hajtanak végre, hanem a bázisok. Ezért az új hajók vásárlásait nem a "commands"-ban található utasítások közé kell tenni, hanem egy külön "newShips" tömbben kell elküldeni. A tömb minden eleme csak egy szám, amik azt mondják meg, hogy melyik körökben veszünk új hajót. <b>FONTOS! hogy a körök számozása a játék elején 0-tól kezdődik!</b> Az új hajók saját sort kapnak a "commands" tömbben, ugyanúgy, mint az eleve meglévő hajók is. Az ő utasítás soruzatukat is a kezdő bázis megadásával ("STARTFROM" utasítás) kell kezdeni, így látszólag semmi eltérés nem lesz a többi hajóhoz képest (kivéve, hogy a végrehajtási sor csak azután kezdődik el, miután a hajót megvettük).

		További információk:<br/>
		<ul>
		<li>Minden új hajó költsége 300 érc.</li>
		<li>Az új hajó vásárlása mindig az adott kör legelső lépése, mielőtt bármelyik hajó cselekedne. A hajó megépítése 1 körig tart. Így ha a 150. körben veszünk egy új hajót, akkor az a 149. kör végi raktárkészletből költekezik, a 150 körben még nem elérhető (akkor épül), és a 151. körtől kezdve használható (akkor kerül az első utasítása által adott bázisra, majd hajtja végre az első utasítását.</li>
		<li>Egy körben akár több hajó is vehető.</li>
		<li>A hajók utasítása a hajók sorrendjében történnek. Így például, ha két hajó ugyanazon az aszteroidán bányászik ugyanabban a körben, akkor a kisebb indexű hajó hajtja ezt végre először. Ezt azt is jelenti, hogy ha nincs már elég érc mindkettőnek, akkor az első tud sikeresen bányászni, a második már csak időt pazarol. Az új hajók mindig a sor végére kerülnek.</li>
		</ul>

		Ebben a feladatban 2 hajóval indultok, és a cél, hogy az utasítás sorozat végén legyen legalább 10. Minden más lényegtelen. Ellenőrzésképp küldjétek el a körök számát, valamint a végén raktárban maradt ércek mennyiségét is ("totalRounds" és "stockQuantity", ahogy més feladatokban is).
	</body>
</html>

