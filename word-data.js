const SIGHT_220_WORDS = `
a about after again all always am an and any are around as ask at ate away
be because been before best better big black blue both bring brown but buy by
call came can carry clean cold come could cut did do does done don't down draw drink
eat eight every fall far fast find first five fly for found four from full funny go
gave get give goes going good got green grow had has have he help her here him his hold hot
how hurt I if in into is it its jump just keep kind know laugh let light like little live long look
made make many may me much must my myself never new no not now of off old on once one only open or our out over own
pick play please pretty pull put ran read red ride right round run said saw say see seven shall she show sing sit six sleep small so some soon start stop
take tell ten thank that the their them then there these they think this those three to today together too try two under up upon us use very walk want warm was wash we well went were what when where which white who why will wish with work would write yellow yes you your
`.trim().split(/\s+/);

const KET_CORE_WORDS = `
airport animal apartment apple arrive artist aunt autumn baby bag bakery bank beach bedroom bicycle biscuit bottle breakfast bridge brother building bus busy cafe camera capital card carrot cinema city class classroom clothes cloudy coat coffee cold college computer cook country cousin dance daughter doctor door dress drink driver early east egg email evening exam expensive family famous farmer father festival fire fish floor flower football forest fork friendly fruit garden girl glass grandfather grandmother guitar hall holiday hospital hotel hour house husband ice island jacket jeans job juice kitchen lake language late library light lunch market medicine menu message milk minute money month mountain museum music newspaper nurse office orange page parent park party passport photo plane police post office present price problem quarter quiet radio rain restaurant rice river road room salad sandwich school scientist sea shop sister skirt snow son soup south station street student summer supermarket table taxi teacher tea ticket town train travel tree uncle university village visit waiter warm water weather week west wife winter woman year
able afraid alone angry another answer any anything beautiful become begin believe birthday bored borrow break bring broken careful carry catch change cheap choose clean close collect comfortable concert cook cool correct cost could course dark decide delicious different difficult dinner dirty early easy enjoy enough excellent excited exercise expensive famous favorite finish free fresh full funny future game get give great happy hard healthy heavy homework hungry important interested interesting invite kind know late learn leave lesson letter listen little lovely lucky meet member modern morning much museum need never noisy often once only open opposite outside paper past perhaps place please popular possible practise pretty quick quiet ready remember right safe same send short should slow small something sometimes soon special spend start still strong sure swim take talk teach tell thing think ticket tired together tomorrow travel try useful visit wait wake want watch welcome without wonderful worry write young
`.trim().split(/\s+/);

function groupWords(words, size) {
  return words.map((word, index) => ({
    word,
    zh: index < SIGHT_220_WORDS.length && words === SIGHT_220_WORDS ? "高频词" : "KET核心",
    group: `第${Math.floor(index / size) + 1}组`
  }));
}

window.EXTRA_WORD_BANKS = {
  sight220: groupWords(SIGHT_220_WORDS, 20),
  ket: groupWords(KET_CORE_WORDS, 20)
};
