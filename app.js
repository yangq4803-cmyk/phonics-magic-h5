const lessons = {
  short: {
    kicker: "短元音魔法",
    title: "听见中间的短音",
    keyLabel: "中间音",
    words: [
      { word: "cat", zh: "猫", sounds: "/k/ /a/ /t/", key: "a", choices: ["a", "e", "i"], letters: ["c", "a", "t"] },
      { word: "pig", zh: "小猪", sounds: "/p/ /i/ /g/", key: "i", choices: ["i", "o", "u"], letters: ["p", "i", "g"] },
      { word: "sun", zh: "太阳", sounds: "/s/ /u/ /n/", key: "u", choices: ["u", "a", "e"], letters: ["s", "u", "n"] },
      { word: "hop", zh: "跳", sounds: "/h/ /o/ /p/", key: "o", choices: ["o", "i", "a"], letters: ["h", "o", "p"] }
    ]
  },
  long: {
    kicker: "长元音魔法",
    title: "发现会说自己名字的元音",
    keyLabel: "长音",
    words: [
      { word: "cake", zh: "蛋糕", sounds: "/k/ /ā/ /k/", key: "a_e", choices: ["a_e", "a", "ai"], letters: ["c", "a", "k", "e"] },
      { word: "bike", zh: "自行车", sounds: "/b/ /ī/ /k/", key: "i_e", choices: ["i_e", "i", "ie"], letters: ["b", "i", "k", "e"] },
      { word: "rope", zh: "绳子", sounds: "/r/ /ō/ /p/", key: "o_e", choices: ["o_e", "o", "oa"], letters: ["r", "o", "p", "e"] },
      { word: "cute", zh: "可爱的", sounds: "/k/ /ū/ /t/", key: "u_e", choices: ["u_e", "u", "ue"], letters: ["c", "u", "t", "e"] }
    ]
  },
  blend: {
    kicker: "辅音组合魔法",
    title: "两个字母发出一个声音",
    keyLabel: "组合音",
    words: [
      { word: "ship", zh: "船", sounds: "/sh/ /i/ /p/", key: "sh", choices: ["sh", "ch", "th"], letters: ["sh", "i", "p"] },
      { word: "chair", zh: "椅子", sounds: "/ch/ /air/", key: "ch", choices: ["ch", "sh", "ck"], letters: ["ch", "air"] },
      { word: "thin", zh: "瘦的", sounds: "/th/ /i/ /n/", key: "th", choices: ["th", "wh", "ph"], letters: ["th", "i", "n"] },
      { word: "duck", zh: "鸭子", sounds: "/d/ /u/ /ck/", key: "ck", choices: ["ck", "ch", "sh"], letters: ["d", "u", "ck"] }
    ]
  },
  team: {
    kicker: "元音搭档魔法",
    title: "两个元音一起合作",
    keyLabel: "搭档音",
    words: [
      { word: "boat", zh: "小船", sounds: "/b/ /ō/ /t/", key: "oa", choices: ["oa", "ai", "ee"], letters: ["b", "oa", "t"] },
      { word: "rain", zh: "雨", sounds: "/r/ /ā/ /n/", key: "ai", choices: ["ai", "oa", "ea"], letters: ["r", "ai", "n"] },
      { word: "seed", zh: "种子", sounds: "/s/ /ē/ /d/", key: "ee", choices: ["ee", "ea", "oo"], letters: ["s", "ee", "d"] },
      { word: "moon", zh: "月亮", sounds: "/m/ /oo/ /n/", key: "oo", choices: ["oo", "oa", "ai"], letters: ["m", "oo", "n"] }
    ]
  }
};

function cleanSpell(word) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function makeVocabItems(items, label) {
  const groups = [...new Set(items.map((item) => item.group))];
  return items.map((item, index) => {
    const otherGroups = groups.filter((group) => group !== item.group);
    const choices = [item.group, ...otherGroups.slice(index % Math.max(1, otherGroups.length)).concat(otherGroups).slice(0, 2)];
    const spell = cleanSpell(item.word);
    return {
      word: item.word,
      zh: item.zh,
      sounds: `${label} · ${item.group}`,
      key: item.group,
      choices,
      letters: spell.split(""),
      spell
    };
  });
}

if (window.EXTRA_WORD_BANKS) {
  lessons.sight220 = {
    kicker: "220高频词",
    title: "小学阅读常见词",
    keyLabel: "词组",
    words: makeVocabItems(window.EXTRA_WORD_BANKS.sight220, "高频词")
  };

  lessons.ket = {
    kicker: "KET核心词汇",
    title: "KET/A2常见单词",
    keyLabel: "词组",
    words: makeVocabItems(window.EXTRA_WORD_BANKS.ket, "KET")
  };
}

const state = {
  lesson: "short",
  index: 0,
  selectedSound: "",
  spell: [],
  usedLetters: new Set(),
  stars: Number(localStorage.getItem("phonicsStars") || 0)
};

const audioCache = new Map();
const audioSprite = window.AUDIO_SPRITE_MAP ? new Audio("./assets/audio-sprite.wav") : null;
let audioSpriteTimer = null;

const els = {
  stars: document.querySelector("#stars"),
  lessonKicker: document.querySelector("#lessonKicker"),
  lessonTitle: document.querySelector("#lessonTitle"),
  wordText: document.querySelector("#wordText"),
  wordSound: document.querySelector("#wordSound"),
  wordMeaning: document.querySelector("#wordMeaning"),
  soundChoices: document.querySelector("#soundChoices"),
  spellSlots: document.querySelector("#spellSlots"),
  letterBank: document.querySelector("#letterBank"),
  wordList: document.querySelector("#wordList"),
  feedback: document.querySelector("#feedback"),
  speakBtn: document.querySelector("#speakBtn"),
  checkBtn: document.querySelector("#checkBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  shuffleBtn: document.querySelector("#shuffleBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  tabs: [...document.querySelectorAll(".lesson-tab")]
};

function currentLesson() {
  return lessons[state.lesson];
}

function currentWord() {
  return currentLesson().words[state.index];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function saveStars() {
  localStorage.setItem("phonicsStars", String(state.stars));
  els.stars.textContent = state.stars;
}

function fallbackSpeech(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.78;
  window.speechSynthesis.speak(utterance);
}

function speak(text) {
  const word = cleanSpell(text);
  const range = window.AUDIO_SPRITE_MAP && window.AUDIO_SPRITE_MAP[word];
  if (audioSprite && range) {
    clearTimeout(audioSpriteTimer);
    audioSprite.pause();
    audioSprite.currentTime = range[0];
    audioSprite.play().then(() => {
      audioSpriteTimer = setTimeout(() => audioSprite.pause(), Math.max(80, (range[1] - range[0]) * 1000));
    }).catch(() => fallbackSpeech(text));
    return;
  }
  const src = `./assets/audio/${word}.wav`;
  const audio = audioCache.get(word) || new Audio(src);
  audioCache.set(word, audio);
  audio.currentTime = 0;
  audio.play().catch(() => fallbackSpeech(text));
}

function render() {
  const lesson = currentLesson();
  const item = currentWord();
  state.selectedSound = "";
  state.spell = [];
  state.usedLetters = new Set();

  els.lessonKicker.textContent = lesson.kicker;
  els.lessonTitle.textContent = lesson.title;
  els.wordText.textContent = item.word;
  els.wordSound.textContent = item.sounds;
  els.wordMeaning.textContent = item.zh;
  els.feedback.textContent = "先听一遍，再找声音。";
  els.feedback.className = "feedback";
  saveStars();

  els.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.lesson === state.lesson));

  els.soundChoices.innerHTML = "";
  item.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = choice;
    button.addEventListener("click", () => {
      state.selectedSound = choice;
      [...els.soundChoices.children].forEach((child) => child.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });
    els.soundChoices.appendChild(button);
  });

  els.spellSlots.innerHTML = "";
  item.letters.forEach(() => {
    const slot = document.createElement("div");
    slot.className = "spell-slot";
    slot.textContent = "·";
    els.spellSlots.appendChild(slot);
  });

  els.letterBank.innerHTML = "";
  shuffle(item.letters).forEach((letter, visualIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "letter-chip";
    button.textContent = letter;
    button.addEventListener("click", () => addLetter(letter, visualIndex, button));
    els.letterBank.appendChild(button);
  });

  renderWordList();
}

function addLetter(letter, visualIndex, button) {
  if (state.usedLetters.has(visualIndex)) return;
  const item = currentWord();
  if (state.spell.length >= item.letters.length) return;
  state.usedLetters.add(visualIndex);
  state.spell.push(letter);
  button.classList.add("is-used");
  const slot = els.spellSlots.children[state.spell.length - 1];
  slot.textContent = letter;
}

function renderWordList() {
  els.wordList.innerHTML = "";
  currentLesson().words.forEach((item, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "mini-word";
    card.innerHTML = `<strong>${item.word}</strong><span>${item.sounds} · ${item.zh}</span>`;
    card.addEventListener("click", () => {
      state.index = index;
      render();
      speak(item.word);
    });
    els.wordList.appendChild(card);
  });
}

function checkAnswer() {
  const item = currentWord();
  const soundOk = state.selectedSound === item.key;
  const spellOk = state.spell.join("") === (item.spell || item.word);

  if (soundOk && spellOk) {
    state.stars += 3;
    saveStars();
    els.feedback.textContent = "成功点亮！声音和拼写都对了。";
    els.feedback.className = "feedback good";
    speak(item.word);
    return;
  }

  if (!soundOk && !spellOk) {
    els.feedback.textContent = `再试一次：先找${currentLesson().keyLabel}，再按顺序拼。`;
  } else if (!soundOk) {
    els.feedback.textContent = `拼写对了，再听听哪个是${currentLesson().keyLabel}。`;
  } else {
    els.feedback.textContent = "关键音对了，拼写顺序还差一点。";
  }
  els.feedback.className = "feedback try";
}

function nextCard() {
  state.index = (state.index + 1) % currentLesson().words.length;
  render();
}

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.lesson = tab.dataset.lesson;
    state.index = 0;
    render();
  });
});

els.speakBtn.addEventListener("click", () => speak(currentWord().word));
els.checkBtn.addEventListener("click", checkAnswer);
els.nextBtn.addEventListener("click", nextCard);
els.shuffleBtn.addEventListener("click", render);
els.resetBtn.addEventListener("click", () => {
  state.stars = 0;
  saveStars();
  els.feedback.textContent = "今日星尘已清零。";
  els.feedback.className = "feedback";
});

render();
