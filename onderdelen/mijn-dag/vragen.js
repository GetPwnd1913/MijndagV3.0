// ---------- vragen van de dagbeschouwing ----------
const YNB = [["nee","Nee"],["beetje","Een beetje"],["ja","Ja"]];
const WHO = ["mezelf","iemand thuis","mijn familie","een vriend","mijn sponsor","een hulpverlener","iemand op werk/school","een onbekende"];
const FEELINGS = ["onrustig","gespannen","verdrietig","eenzaam","onzeker","boos","schuldig","beschaamd","moe","overweldigd","jaloers","opgelucht","rustig","blij"];
const COPING = ["mijn sponsor gebeld","iemand anders gebeld","erover gepraat","naar een meeting gegaan","naar buiten gegaan","afleiding gezocht","de situatie verlaten","gebeden of gemediteerd","de film doorgespoeld tot het eind","iets gegeten of gedronken","gewacht tot het overging","literatuur gelezen"];
const TRIGGERS = ["een plek","bepaalde mensen","geld","stress","verveling","eenzaamheid","boosheid","vermoeidheid","honger","muziek","social media","middelen zien of ruiken","een herinnering","een ruzie"];

// Each row: label (the question shown), lead (start of the sentence), items. Tapping builds one sentence per row.
const QUESTIONS = [
  {id:"q1", title:"Beschrijf wat je hebt gedaan vandaag. Wat waren je gevoelens hierbij. Hoe ging je hier mee om", type:"free",
   tip:"Loop je dag door van ’s ochtends tot ’s avonds. Schrijf bij elk moment op wat je voelde en wat je daarmee deed."},
  {id:"q2", title:"Ben ik eerlijk geweest?", type:"scale", opts:[["ja","Ja"],["grotendeels","Grotendeels"],["nee","Nee"]], doneOn:["ja"], detailOn:["grotendeels","nee"],
   tip:"Ook kleine dingen tellen: een smoesje, iets weglaten, overdrijven, of doen alsof het goed gaat terwijl dat niet zo is. En: ben je eerlijk geweest tegen jezelf?",
   rows:[
     {label:"Tegen wie was ik niet eerlijk?", lead:"Ik was niet helemaal eerlijk tegen", items:WHO},
     {label:"Wat deed ik?", lead:"Wat ik deed:", items:["iets verzwegen","een smoesje gebruikt","overdreven","gedaan alsof het goed ging","iets beloofd wat ik niet nakwam","een leugentje verteld"]},
     {label:"Hoe zet ik het recht?", lead:"Ik kan dit rechtzetten door", items:["het alsnog eerlijk te vertellen","sorry te zeggen","het te bespreken met mijn sponsor","het morgen anders te doen"]}
   ],
   yesText:"Ja, ik ben vandaag eerlijk geweest."},
  {id:"q3", title:"Heb ik conflicten gehad? Wat heb ik er mee gedaan?", type:"scale", opts:YNB, doneOn:["nee"], detailOn:["beetje","ja"],
   tip:"Een conflict kan ook klein zijn: irritatie, een discussie, of iets wat je inslikte. Een conflict kan ook met jezelf zijn: bijvoorbeeld als je ergens mee worstelde, boos was op jezelf, of twijfelde tussen wat je wilde en wat goed voor je was. Kijk naar wat jij deed en wat jouw deel was.",
   rows:[
     {label:"Met wie had ik een conflict?", lead:"Ik had een conflict met", items:WHO},
     {label:"Hoe voelde ik me?", lead:"Ik voelde me", items:FEELINGS, cls:"feel"},
     {label:"Wat heb ik ermee gedaan?", lead:"Wat ik ermee gedaan heb:", items:["het uitgepraat","rustig gebleven","even afstand genomen","sorry gezegd","het besproken met mijn sponsor","het losgelaten","boos gereageerd","het opgekropt"]},
     {label:"Wat was mijn eigen deel?", lead:"Mijn eigen deel was:", items:["ik reageerde te snel","ik luisterde niet goed","ik wilde mijn gelijk halen","ik was moe of gespannen","ik zei niet wat ik voelde"]}
   ],
   noText:"Nee, ik heb vandaag geen conflicten gehad."},
  {id:"q4", title:"Wat heb ik gedaan voor herstel: meeting, stappen, sponsor bellen en service?", type:"open",
   tip:"Tik aan wat je gedaan hebt en vul aan met details: welke meeting en aan welke stap je werkte.",
   rows:[
     {label:"Wat heb ik gedaan?", lead:"Voor mijn herstel heb ik", sub:{item:"een meeting bezocht", label:"Welke meeting?"}, items:["een meeting bezocht","aan mijn stappen gewerkt","mijn sponsor gebeld","service gedaan","literatuur gelezen","gebeden of gemediteerd","contact gehad met iemand uit het programma","nazorg","deze dagbeschouwing ingevuld"]}
   ]},
  {id:"q5", title:"Heb ik cravings gehad vandaag? Zo ja, hoe ben ik er mee om gegaan", type:"scale", opts:YNB, doneOn:["nee"], detailOn:["beetje","ja"],
   tip:"Een craving is zucht of verlangen naar gebruiken. Schrijf op wanneer het kwam, hoe sterk het was en wat je hebt gedaan zodat het overging.",
   rows:[
     {label:"Hoe sterk was het?", lead:"De craving was", items:["1","2","3","4","5","6","7","8","9","10"].map(n=>n+" uit 10"), single:true},
     {label:"Wanneer kwam het?", lead:"Het kwam", items:["’s ochtends","’s middags","’s avonds","toen ik alleen was","toen ik stress had","toen ik me verveelde","na een ruzie","toen ik moe was"]},
     {label:"Wat heb ik gedaan?", lead:"Wat ik heb gedaan:", items:COPING}
   ],
   noText:"Nee, ik heb vandaag geen cravings gehad."},
  {id:"q6", title:"Waren er triggers? Zo ja, hoe ben ik er mee om gegaan?", type:"scale", opts:YNB, doneOn:["nee"], detailOn:["beetje","ja"],
   tip:"Een trigger is iets wat de zucht kan oproepen: een plek, mensen, een gevoel of een situatie. Check ook HALT: had je Honger, was je Boos, Eenzaam of Moe?",
   rows:[
     {label:"Wat was de trigger?", lead:"Mijn trigger was:", items:TRIGGERS},
     {label:"Hoe voelde ik me?", lead:"Ik voelde me", items:FEELINGS, cls:"feel"},
     {label:"Wat heb ik gedaan?", lead:"Wat ik heb gedaan:", items:COPING}
   ],
   noText:"Nee, ik had vandaag geen triggers."},
  {id:"q7", title:"Wat ging er vandaag goed?", type:"open",
   tip:"Kleine dingen tellen ook. Een dag zonder grote problemen is al iets wat goed ging.",
   rows:[
     {label:"Wat ging goed?", lead:"Vandaag ging goed:", items:["ik ben nuchter/clean gebleven","mijn rust gepakt","ik ben mijn afspraken nagekomen","ik heb iemand geholpen","ik heb om hulp gevraagd","ik heb goed voor mezelf gezorgd","ik ben naar buiten geweest","ik heb iets nieuws geleerd","ik heb eerlijk gezegd wat ik voelde","ik bleef rustig in een lastige situatie"]}
   ]},
  {id:"q8", title:"Wat kon er vandaag beter?", type:"open",
   tip:"Niet om jezelf af te kraken, maar om ervan te leren. Wat neem je mee naar morgen?",
   rows:[
     {label:"Wat wil ik volgende keer anders doen?", lead:"Volgende keer wil ik", items:["eerder om hulp vragen","rustiger reageren","eerlijker zijn","beter voor mezelf zorgen","op tijd naar bed gaan","minder uitstellen","beter luisteren","mijn sponsor eerder bellen"]}
   ]},
  {id:"q9", title:"Is er vandaag iets gebeurd waar ik nog op terug wil komen?", type:"scale", opts:[["nee","Nee"],["ja","Ja"]], doneOn:["nee"], detailOn:["ja"],
   tip:"Iets wat nog blijft hangen. Misschien wil je het uitpraten of rechtzetten, of erover praten met iemand die je vertrouwt: je sponsor, je begeleider, een huisgenoot, een fellow, een vriend of iemand uit je familie.",
   rows:[
     {label:"Met wie wil ik erop terugkomen?", lead:"Ik wil erop terugkomen met", items:WHO.filter(w=>w!=="een onbekende")},
     {label:"Wat wil ik doen?", lead:"Ik wil", items:["het uitpraten","sorry zeggen","het rechtzetten","het bespreken in de groep","er nog eens over nadenken"]}
   ],
   noText:"Nee."},
  {id:"q10", title:"Waar ben ik vandaag dankbaar voor geweest?", type:"open",
   tip:"Probeer er minstens drie te noemen. Groot of klein, alles mag.",
   rows:[
     {label:"Waar ben ik dankbaar voor?", lead:"Ik ben dankbaar voor", items:["mijn nuchterheid","mijn familie","mijn sponsor","de meeting","een goed gesprek","een dak boven mijn hoofd","goed eten","mijn gezondheid","de mensen om me heen","een nieuwe kans vandaag"]}
   ]},
  {id:"trots", title:"Waar ben ik trots op?", type:"open",
   tip:"Geef jezelf erkenning. Waar heb je je best voor gedaan, ook als het niet perfect ging? Klein mag ook.",
   rows:[
     {label:"Waar ben ik trots op?", lead:"Ik ben trots", items:["dat ik nuchter/clean ben gebleven","dat ik deze dagbeschouwing invul","dat ik iets moeilijks heb gedaan","dat ik rustig bleef","dat ik eerlijk was","dat ik om hulp heb gevraagd","dat ik iemand heb geholpen","dat ik heb doorgezet"]}
   ]},
  {id:"q11", title:"Wat is mijn planning voor morgen?", type:"open",
   tip:"Een simpele planning geeft houvast. Zet er ook iets voor je herstel in.",
   rows:[
     {label:"’s Ochtends", lead:"’s Ochtends:", items:["Safehouse sessie","Nazorg","meeting","sponsor bellen","stappenwerk","1-op-1 gesprek","sporten of wandelen","werk of dagbesteding","boodschappen","koken","huistaken","rustig aan doen"]},
     {label:"’s Middags", lead:"’s Middags:", items:["meeting","sponsor bellen","stappenwerk","1-op-1 gesprek","sporten of wandelen","werk of dagbesteding","boodschappen","koken","huistaken","voetbal kijken","rustig aan doen"]},
     {label:"’s Avonds", lead:"’s Avonds:", items:["meeting","sponsor bellen","stappenwerk","dagbeschouwing invullen","sporten of wandelen","koken","huistaken","voetbal kijken","iets leuks doen","op tijd naar bed","rustig aan doen"]}
   ]},
  {id:"q12", title:"Welk cijfer geef ik deze dag en waarom dit cijfer?", type:"score",
   tip:"Kies een cijfer van 1 tot 10 en leg uit waarom. Wat maakte de dag goed of zwaar?",
   rows:[
     {label:"Waarom dit cijfer?", lead:"Het cijfer komt door:", items:["een rustige dag","goede gesprekken","ik ben nuchter/clean gebleven","ik heb veel gedaan voor mijn herstel","stress","cravings","een conflict","ik was moe","ik voelde me goed"]}
   ]}
];
