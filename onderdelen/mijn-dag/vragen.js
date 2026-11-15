// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- vragen van de dagbeschouwing ----------
// Elke tekst heeft een Engelse tegenhanger: titleEn, tipEn, yesTextEn/noTextEn, opts [waarde, nl, en],
// en per rij labelEn + itemsEn (zelfde volgorde als items). De Nederlandse items blijven de sleutel.
const YNB = [["nee","Nee","No"],["beetje","Een beetje","A little"],["ja","Ja","Yes"]];
const WHO = ["mezelf","iemand thuis","mijn familie","een vriend","mijn sponsor","een hulpverlener","iemand op werk/school","een onbekende","een huisgenoot","de begeleiding","een fellow"];
const WHO_EN = ["myself","someone at home","my family","a friend","my sponsor","a care worker","someone at work/school","a stranger","a housemate","my support workers","a fellow"];
const FEELINGS = ["onrustig","gespannen","verdrietig","eenzaam","onzeker","boos","schuldig","beschaamd","moe","overweldigd","jaloers","opgelucht","rustig","blij","angstig","leeg","teleurgesteld","gekwetst","afgewezen","dankbaar","hoopvol","trots","geïrriteerd","zenuwachtig"];
const FEELINGS_EN = ["restless","tense","sad","lonely","insecure","angry","guilty","ashamed","tired","overwhelmed","jealous","relieved","calm","happy","anxious","empty","disappointed","hurt","rejected","grateful","hopeful","proud","irritated","nervous"];
const COPING = ["mijn sponsor gebeld","iemand anders gebeld","erover gepraat","naar een meeting gegaan","naar buiten gegaan","afleiding gezocht","de situatie verlaten","gebeden of gemediteerd","de film doorgespoeld tot het eind","iets gegeten of gedronken","gewacht tot het overging","literatuur gelezen"];
const COPING_EN = ["called my sponsor","called someone else","talked about it","went to a meeting","went outside","found a distraction","left the situation","prayed or meditated","played the tape through to the end","ate or drank something","waited until it passed","read literature"];
const TRIGGERS = ["een plek","bepaalde mensen","geld","stress","verveling","eenzaamheid","boosheid","vermoeidheid","honger","muziek","social media","middelen zien of ruiken","een herinnering","een ruzie"];
const TRIGGERS_EN = ["a place","certain people","money","stress","boredom","loneliness","anger","tiredness","hunger","music","social media","seeing or smelling substances","a memory","an argument"];

// Each row: label (the question shown), lead (start of the sentence), items. Tapping builds one sentence per row.
const QUESTIONS = [
  {id:"q1", title:"Beschrijf wat je hebt gedaan vandaag. Wat waren je gevoelens hierbij. Hoe ging je hier mee om", type:"free",
   titleEn:"Describe what you did today. What were your feelings about it? How did you deal with them?",
   tip:"Loop je dag door van ’s ochtends tot ’s avonds. Schrijf bij elk moment op wat je voelde en wat je daarmee deed.",
   tipEn:"Go through your day from morning to evening. For each moment, write down what you felt and what you did with it."},
  {id:"q2", title:"Ben ik eerlijk geweest?", type:"scale", opts:[["ja","Ja","Yes"],["grotendeels","Grotendeels","Mostly"],["nee","Nee","No"]], doneOn:["ja"], detailOn:["grotendeels","nee"],
   titleEn:"Have I been honest?",
   tip:"Ook kleine dingen tellen: een smoesje, iets weglaten, overdrijven, of doen alsof het goed gaat terwijl dat niet zo is. En: ben je eerlijk geweest tegen jezelf?",
   tipEn:"Small things count too: an excuse, leaving something out, exaggerating, or pretending things are fine when they are not. And: have you been honest with yourself?",
   rows:[
     {label:"Tegen wie was ik niet eerlijk?", labelEn:"Who was I not honest with?", lead:"Ik was niet helemaal eerlijk tegen", items:WHO, itemsEn:WHO_EN},
     {label:"Wat deed ik?", labelEn:"What did I do?", lead:"Wat ik deed:", items:["iets verzwegen","een smoesje gebruikt","overdreven","gedaan alsof het goed ging","iets beloofd wat ik niet nakwam","een leugentje verteld"],
      itemsEn:["kept something quiet","used an excuse","exaggerated","pretended things were fine","promised something I didn't keep","told a white lie"]},
     {label:"Hoe zet ik het recht?", labelEn:"How do I put it right?", lead:"Ik kan dit rechtzetten door", items:["het alsnog eerlijk te vertellen","sorry te zeggen","het te bespreken met mijn sponsor","het morgen anders te doen"],
      itemsEn:["telling the truth after all","saying sorry","talking it through with my sponsor","doing it differently tomorrow"]}
   ],
   yesText:"Ja, ik ben vandaag eerlijk geweest.", yesTextEn:"Yes, I have been honest today."},
  {id:"q3", title:"Heb ik conflicten gehad? Wat heb ik er mee gedaan?", type:"scale", opts:YNB, doneOn:["nee"], detailOn:["beetje","ja"],
   titleEn:"Have I had any conflicts? What did I do about them?",
   tip:"Een conflict kan ook klein zijn: irritatie, een discussie, of iets wat je inslikte. Een conflict kan ook met jezelf zijn: bijvoorbeeld als je ergens mee worstelde, boos was op jezelf, of twijfelde tussen wat je wilde en wat goed voor je was. Kijk naar wat jij deed en wat jouw deel was.",
   tipEn:"A conflict can be small too: irritation, a discussion, or something you swallowed. A conflict can also be with yourself: for example when you struggled with something, were angry with yourself, or doubted between what you wanted and what was good for you. Look at what you did and what your part was.",
   rows:[
     {label:"Met wie had ik een conflict?", labelEn:"Who did I have a conflict with?", lead:"Ik had een conflict met", items:WHO, itemsEn:WHO_EN},
     {label:"Hoe voelde ik me?", labelEn:"How did I feel?", lead:"Ik voelde me", items:FEELINGS, itemsEn:FEELINGS_EN, cls:"feel"},
     {label:"Wat heb ik ermee gedaan?", labelEn:"What did I do about it?", lead:"Wat ik ermee gedaan heb:", items:["het uitgepraat","rustig gebleven","even afstand genomen","sorry gezegd","het besproken met mijn sponsor","het losgelaten","boos gereageerd","het opgekropt"],
      itemsEn:["talked it out","stayed calm","took some distance","said sorry","talked it through with my sponsor","let it go","reacted angrily","bottled it up"]},
     {label:"Wat was mijn eigen deel?", labelEn:"What was my own part?", lead:"Mijn eigen deel was:", items:["ik reageerde te snel","ik luisterde niet goed","ik wilde mijn gelijk halen","ik was moe of gespannen","ik zei niet wat ik voelde"],
      itemsEn:["I reacted too quickly","I didn't listen well","I wanted to be right","I was tired or tense","I didn't say what I felt"]}
   ],
   noText:"Nee, ik heb vandaag geen conflicten gehad.", noTextEn:"No, I have not had any conflicts today."},
  {id:"q4", title:"Wat heb ik gedaan voor herstel: meeting, stappen, sponsor bellen en service?", type:"open",
   titleEn:"What did I do for my recovery: meeting, steps, calling my sponsor and service?",
   tip:"Tik aan wat je gedaan hebt en vul aan met details: welke meeting en aan welke stap je werkte.",
   tipEn:"Tap what you did and add details: which meeting and which step you worked on.",
   rows:[
     {label:"Wat heb ik gedaan?", labelEn:"What did I do?", lead:"Voor mijn herstel heb ik", sub:{item:"een meeting bezocht", label:"Welke meeting?", labelEn:"Which meeting?"}, items:["een meeting bezocht","aan mijn stappen gewerkt","mijn sponsor gebeld","service gedaan","literatuur gelezen","gebeden of gemediteerd","contact gehad met iemand uit het programma","nazorg","deze dagbeschouwing ingevuld","een Alleen voor vandaag-tekst gelezen","met mijn begeleider gepraat","in de groep gedeeld"],
      itemsEn:["attended a meeting","worked on my steps","called my sponsor","did service","read literature","prayed or meditated","had contact with someone from the programme","aftercare","filled in this daily reflection","read a Just for Today reading","talked with my support worker","shared in the group"]}
   ]},
  {id:"q5", title:"Heb ik cravings gehad vandaag? Zo ja, hoe ben ik er mee om gegaan", type:"scale", opts:YNB, doneOn:["nee"], detailOn:["beetje","ja"],
   titleEn:"Have I had cravings today? If so, how did I deal with them?",
   tip:"Een craving is zucht of verlangen naar gebruiken. Schrijf op wanneer het kwam, hoe sterk het was en wat je hebt gedaan zodat het overging.",
   tipEn:"A craving is an urge or desire to use. Write down when it came, how strong it was and what you did so that it passed.",
   rows:[
     {label:"Hoe sterk was het?", labelEn:"How strong was it?", lead:"De craving was", items:["1","2","3","4","5","6","7","8","9","10"].map(n=>n+" uit 10"), itemsEn:["1","2","3","4","5","6","7","8","9","10"].map(n=>n+" out of 10"), single:true},
     {label:"Wanneer kwam het?", labelEn:"When did it come?", lead:"Het kwam", items:["’s ochtends","’s middags","’s avonds","toen ik alleen was","toen ik stress had","toen ik me verveelde","na een ruzie","toen ik moe was"],
      itemsEn:["in the morning","in the afternoon","in the evening","when I was alone","when I was stressed","when I was bored","after an argument","when I was tired"]},
     {label:"Wat heb ik gedaan?", labelEn:"What did I do?", lead:"Wat ik heb gedaan:", items:COPING, itemsEn:COPING_EN}
   ],
   noText:"Nee, ik heb vandaag geen cravings gehad.", noTextEn:"No, I have not had any cravings today."},
  {id:"q6", title:"Waren er triggers? Zo ja, hoe ben ik er mee om gegaan?", type:"scale", opts:YNB, doneOn:["nee"], detailOn:["beetje","ja"],
   titleEn:"Were there any triggers? If so, how did I deal with them?",
   tip:"Een trigger is iets wat de zucht kan oproepen: een plek, mensen, een gevoel of een situatie. Check ook HALT: had je Honger, was je Boos, Eenzaam of Moe?",
   tipEn:"A trigger is something that can bring on a craving: a place, people, a feeling or a situation. Also check HALT: were you Hungry, Angry, Lonely or Tired?",
   rows:[
     {label:"Wat was de trigger?", labelEn:"What was the trigger?", lead:"Mijn trigger was:", items:TRIGGERS, itemsEn:TRIGGERS_EN},
     {label:"Hoe voelde ik me?", labelEn:"How did I feel?", lead:"Ik voelde me", items:FEELINGS, itemsEn:FEELINGS_EN, cls:"feel"},
     {label:"Wat heb ik gedaan?", labelEn:"What did I do?", lead:"Wat ik heb gedaan:", items:COPING, itemsEn:COPING_EN},
     // onderaan: picked(e, "q6", 0/1/2) en eigen knopjes (q6|0..2) rekenen op de volgorde hierboven
     {label:"HALT-check", labelEn:"HALT check", lead:"HALT:", items:["honger","boos","eenzaam","moe"], itemsEn:["hungry","angry","lonely","tired"]}
   ],
   noText:"Nee, ik had vandaag geen triggers.", noTextEn:"No, I had no triggers today."},
  {id:"q7", title:"Wat ging er vandaag goed?", type:"open",
   titleEn:"What went well today?",
   tip:"Kleine dingen tellen ook. Een dag zonder grote problemen is al iets wat goed ging.",
   tipEn:"Small things count too. A day without big problems is already something that went well.",
   rows:[
     {label:"Wat ging goed?", labelEn:"What went well?", lead:"Vandaag ging goed:", items:["ik ben nuchter/clean gebleven","mijn rust gepakt","ik ben mijn afspraken nagekomen","ik heb iemand geholpen","ik heb om hulp gevraagd","ik heb goed voor mezelf gezorgd","ik ben naar buiten geweest","ik heb iets nieuws geleerd","ik heb eerlijk gezegd wat ik voelde","ik bleef rustig in een lastige situatie","ik heb gelachen","ik heb goed geslapen","ik ben naar een meeting gegaan","ik heb nee gezegd","ik heb een craving doorstaan"],
      itemsEn:["I stayed sober/clean","took time to rest","I kept my appointments","I helped someone","I asked for help","I took good care of myself","I went outside","I learned something new","I said honestly what I felt","I stayed calm in a difficult situation","I laughed","I slept well","I went to a meeting","I said no","I got through a craving"]}
   ]},
  {id:"q8", title:"Wat kon er vandaag beter?", type:"open",
   titleEn:"What could have gone better today?",
   tip:"Niet om jezelf af te kraken, maar om ervan te leren. Wat neem je mee naar morgen?",
   tipEn:"Not to put yourself down, but to learn from it. What will you take with you into tomorrow?",
   rows:[
     {label:"Wat wil ik volgende keer anders doen?", labelEn:"What do I want to do differently next time?", lead:"Volgende keer wil ik", items:["eerder om hulp vragen","rustiger reageren","eerlijker zijn","beter voor mezelf zorgen","op tijd naar bed gaan","minder uitstellen","beter luisteren","mijn sponsor eerder bellen"],
      itemsEn:["ask for help sooner","react more calmly","be more honest","take better care of myself","go to bed on time","put things off less","listen better","call my sponsor sooner"]}
   ]},
  {id:"q9", title:"Is er vandaag iets gebeurd waar ik nog op terug wil komen?", type:"scale", opts:[["nee","Nee","No"],["ja","Ja","Yes"]], doneOn:["nee"], detailOn:["ja"],
   titleEn:"Did something happen today that I want to come back to?",
   tip:"Iets wat nog blijft hangen. Misschien wil je het uitpraten of rechtzetten, of erover praten met iemand die je vertrouwt: je sponsor, je begeleider, een huisgenoot, een fellow, een vriend of iemand uit je familie.",
   tipEn:"Something that is still on your mind. Maybe you want to talk it out or put it right, or talk about it with someone you trust: your sponsor, your support worker, a housemate, a fellow, a friend or someone in your family.",
   rows:[
     {label:"Met wie wil ik erop terugkomen?", labelEn:"Who do I want to come back to it with?", lead:"Ik wil erop terugkomen met", items:WHO.filter(w=>w!=="een onbekende"), itemsEn:WHO_EN.filter((w, i)=>WHO[i]!=="een onbekende")},
     {label:"Wat wil ik doen?", labelEn:"What do I want to do?", lead:"Ik wil", items:["het uitpraten","sorry zeggen","het rechtzetten","het bespreken in de groep","er nog eens over nadenken"],
      itemsEn:["talk it out","say sorry","put it right","discuss it in the group","think about it some more"]}
   ],
   noText:"Nee.", noTextEn:"No."},
  {id:"q10", title:"Waar ben ik vandaag dankbaar voor geweest?", type:"open",
   titleEn:"What have I been grateful for today?",
   tip:"Probeer er minstens drie te noemen. Groot of klein, alles mag.",
   tipEn:"Try to name at least three. Big or small, anything goes.",
   rows:[
     {label:"Waar ben ik dankbaar voor?", labelEn:"What am I grateful for?", lead:"Ik ben dankbaar voor", items:["mijn nuchterheid","mijn familie","mijn sponsor","de meeting","een goed gesprek","een dak boven mijn hoofd","goed eten","mijn gezondheid","de mensen om me heen","een nieuwe kans vandaag","mijn huisgenoten","de begeleiding","het safehouse","het programma","mijn fellows","een rustig hoofd","een tweede kans"],
      itemsEn:["my sobriety","my family","my sponsor","the meeting","a good conversation","a roof over my head","good food","my health","the people around me","a new chance today","my housemates","my support workers","the safehouse","the programme","my fellows","a calm mind","a second chance"]}
   ]},
  {id:"trots", title:"Waar ben ik trots op?", type:"open",
   titleEn:"What am I proud of?",
   tip:"Geef jezelf erkenning. Waar heb je je best voor gedaan, ook als het niet perfect ging? Klein mag ook.",
   tipEn:"Give yourself credit. What did you do your best at, even if it wasn't perfect? Small things are fine too.",
   rows:[
     {label:"Waar ben ik trots op?", labelEn:"What am I proud of?", lead:"Ik ben trots", items:["dat ik nuchter/clean ben gebleven","dat ik deze dagbeschouwing invul","dat ik iets moeilijks heb gedaan","dat ik rustig bleef","dat ik eerlijk was","dat ik om hulp heb gevraagd","dat ik iemand heb geholpen","dat ik heb doorgezet","dat ik naar een meeting ben gegaan","dat ik nee heb gezegd","dat ik mijn gevoel heb gedeeld","dat ik een craving heb doorstaan"],
      itemsEn:["that I stayed sober/clean","that I'm filling in this daily reflection","that I did something difficult","that I stayed calm","that I was honest","that I asked for help","that I helped someone","that I kept going","that I went to a meeting","that I said no","that I shared my feelings","that I got through a craving"]}
   ]},
  {id:"q11", title:"Wat is mijn planning voor morgen?", type:"open",
   titleEn:"What is my plan for tomorrow?",
   tip:"Een simpele planning geeft houvast. Zet er ook iets voor je herstel in.",
   tipEn:"A simple plan gives you something to hold on to. Include something for your recovery too.",
   rows:[
     {label:"’s Ochtends", labelEn:"Morning", lead:"’s Ochtends:", items:["Safehouse sessie","Nazorg","meeting","sponsor bellen","stappenwerk","1-op-1 gesprek","sporten of wandelen","werk of dagbesteding","boodschappen","koken","huistaken","rustig aan doen"],
      itemsEn:["Safehouse session","Aftercare","meeting","call my sponsor","step work","1-to-1 talk","exercise or a walk","work or day activities","groceries","cooking","household chores","take it easy"]},
     {label:"’s Middags", labelEn:"Afternoon", lead:"’s Middags:", items:["meeting","sponsor bellen","stappenwerk","1-op-1 gesprek","sporten of wandelen","werk of dagbesteding","boodschappen","koken","huistaken","voetbal kijken","rustig aan doen"],
      itemsEn:["meeting","call my sponsor","step work","1-to-1 talk","exercise or a walk","work or day activities","groceries","cooking","household chores","watch football","take it easy"]},
     {label:"’s Avonds", labelEn:"Evening", lead:"’s Avonds:", items:["meeting","sponsor bellen","stappenwerk","dagbeschouwing invullen","sporten of wandelen","koken","huistaken","voetbal kijken","iets leuks doen","op tijd naar bed","rustig aan doen"],
      itemsEn:["meeting","call my sponsor","step work","fill in my daily reflection","exercise or a walk","cooking","household chores","watch football","do something fun","go to bed on time","take it easy"]}
   ]},
  {id:"q12", title:"Welk cijfer geef ik deze dag en waarom dit cijfer?", type:"score",
   titleEn:"What score do I give this day, and why?",
   tip:"Kies een cijfer van 1 tot 10 en leg uit waarom. Wat maakte de dag goed of zwaar?",
   tipEn:"Choose a score from 1 to 10 and explain why. What made the day good or hard?",
   rows:[
     {label:"Waarom dit cijfer?", labelEn:"Why this score?", lead:"Het cijfer komt door:", items:["een rustige dag","goede gesprekken","ik ben nuchter/clean gebleven","ik heb veel gedaan voor mijn herstel","stress","cravings","een conflict","ik was moe","ik voelde me goed"],
      itemsEn:["a quiet day","good conversations","I stayed sober/clean","I did a lot for my recovery","stress","cravings","a conflict","I was tired","I felt good"]}
   ]}
];

// ---- tekst in de gekozen taal ----
const qTitle = q => vt(q.title, q.titleEn || q.title);
const qTip = q => vt(q.tip, q.tipEn || q.tip);
const optLabel = (q, level) => { const o = (q.opts || []).find(x => x[0] === level); return o ? vt(o[1], o[2] || o[1]) : undefined; };
const rowLabel = row => vt(row.label, row.labelEn || row.label);

// ---- woordenlijst knopjes en kopjes: Nederlands <-> Engels ----
// vItem: Nederlandse sleutel -> tekst in de gekozen taal. nlItem: tekst uit een antwoord (nl of en) -> Nederlandse sleutel.
const ITEM_EN = {}, ITEM_NL = {};
QUESTIONS.forEach(q => (q.rows || []).forEach(r => {
  (r.items || []).forEach((it, i) => { const en = (r.itemsEn || [])[i]; if(en){ ITEM_EN[it] = en; if(!(en in ITEM_NL)) ITEM_NL[en] = it; } });
  if(r.sub && r.sub.item){ const i = r.items.indexOf(r.sub.item); if(i >= 0) r.sub.itemEn = r.itemsEn[i]; }
}));
const dagenCleanRx = /^(\d+) (dagen?|days?) clean$/;
const vItem = s => {
  if(!isEn()) return s;
  const m = dagenCleanRx.exec(s); if(m) return m[1] + (m[1] === "1" ? " day clean" : " days clean");
  return ITEM_EN[s] || s;
};
// hoofdletter-ongevoelig: "’s Avonds" en "’s avonds" (of "Called my sponsor" / "called my sponsor") zijn hetzelfde knopje
const ITEM_LC = {};
Object.keys(ITEM_EN).forEach(nl => { ITEM_LC[nl.toLowerCase()] = nl; ITEM_LC[ITEM_EN[nl].toLowerCase()] = ITEM_LC[ITEM_EN[nl].toLowerCase()] || nl; });
const nlItem = s => {
  const m = dagenCleanRx.exec(s); if(m) return m[1] + (m[1] === "1" ? " dag clean" : " dagen clean");
  return ITEM_NL[s] || ITEM_LC[s.toLowerCase()] || s;
};
// alle schrijfwijzen van een knopje (nl en en), voor het herkennen in opgeslagen antwoorden
const itemVariants = s => { const out = [s, ITEM_EN[s]]; const m = dagenCleanRx.exec(s); if(m) out.push(m[1] + (m[1] === "1" ? " day clean" : " days clean")); return out.filter((x, i, a) => x && a.indexOf(x) === i); };
// regel met het cijfer bij vraag 12 (nl of en)
const SCORE_RX = /^(Ik geef deze dag een|I give this day a) \d+\.?/;
