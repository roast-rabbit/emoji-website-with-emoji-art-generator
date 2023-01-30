import { createPicker } from "https://unpkg.com/picmo@latest/dist/index.js";

import { state, setState, undo, index } from "./emojiArtGenerateState.js";

let emojiData;
let messages;

const body = document.querySelector("body");
const heightInput = document.querySelector("#stats input[name=height]");
const widthInput = document.querySelector("#stats input[name=width]");
const board = document.querySelector("#board");

const currentSelection = document.querySelector("#current-selection span");
const undoBtn = document.querySelector("#undo");

const resizeBtn = document.querySelector("#resize");

const copyBtn = document.querySelector("#copy");

const toPicBtn = document.querySelector("#to-picture");

// The picker must have a root element to insert itself into
const sideToolSet = document.querySelector("#side-tool-set");

// Select social icons
const fb = document.querySelector(".facebook");
const twitter = document.querySelector(".twitter");
const linkedIn = document.querySelector(".linkedin");
const reddit = document.querySelector(".reddit");

// current url·
const link = encodeURI(window.location.href);

// Current emoji art text
let currentText = "";
let lastUsedText = "";
let emojiTextArr = [{ key: null, value: null }];

function setCurrentText(newText) {
  if (newText) {
    currentText = newText;
  } else {
    currentText = "";
    const tiles = document.querySelectorAll(".tile");
    if (tiles) {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          currentText += tiles[i * height + j].textContent;
        }
        currentText += "\n";
      }
    }
  }
}

let msg = encodeURIComponent(`I created an emoji art\n${currentText}`);

const title = encodeURIComponent(document.querySelector("title").textContent);

fb.href = `https://www.facebook.com/share.php?u=${link}`;

linkedIn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;

let lang = getLangCode();
function getLangCode() {
  const lang = document.querySelector("html").getAttribute("lang");
  return lang;
}

async function getEmojiData() {
  const emojiDataResponse = await fetch(`./js/${lang}/data.json`);
  emojiData = await emojiDataResponse.json();
  return emojiData;
}

async function getMessages() {
  const messagesResponse = await fetch(`./js/${lang}/messages.json`);
  messages = await messagesResponse.json();
  return messages;
}

// Create the picker
emojiData = await getEmojiData();

messages = await getMessages();

/**
 *
 * @param {*} string
 * @returns array of characters
 */
const splitEmoji = (string) => [...new Intl.Segmenter().segment(string)].map((x) => x.segment);

const lastUsedLocal = localStorage.getItem("lastUsedLocal");
if (lastUsedLocal !== lang) {
  indexedDB.deleteDatabase("PicMo-en");
}
localStorage.setItem("lastUsedLocal", lang);

const picker = createPicker({
  rootElement: sideToolSet,
  emojiData,
  messages,
  i18n: "de",
});

let height = heightInput.value;
let width = widthInput.value;

let currentSelectedEmoji = "😍";

function createBoard(height, width) {
  board.innerHTML = "";
  board.style.setProperty("--height", height);
  board.style.setProperty("--width", width);
  board.style.setProperty("--size", `${80 / width}vmin`);
  board.style.fontSize = `${70 / width}vmin`;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const element = document.createElement("div");
      element.textContent = "⬜️";
      element.classList.add("tile");
      const key = i * parseInt(height) + j + 1;
      element.setAttribute("key", key);
      board.appendChild(element);
    }
  }
}

createBoard(height, width);
setCurrentText();
setState(currentText);

const setEmojiToTarget = (e) => {
  e.preventDefault();
  let targetTile;
  if (e.touches) {
    targetTile = document
      .elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
      .closest(".tile");
  } else {
    targetTile = e.target.closest(".tile");
  }

  if (targetTile) {
    const lastText = emojiTextArr[emojiTextArr.length - 1];
    // console.log(`lastText.value: ${lastText.value}`);
    // console.log(`currentSelectedEmoji: ${currentSelectedEmoji}`);

    if (
      lastText &&
      lastText.key !== targetTile.getAttribute("key") &&
      lastText.value !== currentSelectedEmoji
    ) {
      emojiTextArr.push({ key: targetTile.getAttribute("key"), value: targetTile.textContent });
    }

    targetTile.textContent = currentSelectedEmoji;
  }

  // console.log(emojiTextArr);

  setCurrentText();
  msg = encodeURIComponent(`I created an emoji art\n${currentText}`);
  twitter.href = `http://twitter.com/share?&url=${link}&text=${msg}&hashtags=emoji,emojiart`;
  reddit.href = `http://www.reddit.com/submit?title=I created an emoji art&text=${msg}`;
};

const openEmojiPicker = function () {
  sideToolSet.classList.add("shown");
};

const closeEmojiPicker = function () {
  sideToolSet.classList.remove("shown");
};

const setCurrentEmoji = (emoji) => {
  if (typeof emoji !== "string") return;
  closeEmojiPicker();
  currentSelectedEmoji = emoji;

  currentSelection.textContent = currentSelectedEmoji;
};

sideToolSet.addEventListener("click", setCurrentEmoji);

board.addEventListener("click", setEmojiToTarget);
board.addEventListener("mousedown", (e) => {
  e.preventDefault();
  board.addEventListener("mousemove", setEmojiToTarget);
});

board.addEventListener("touchstart", (e) => {
  e.preventDefault();
  setEmojiToTarget(e);
  board.addEventListener("touchmove", setEmojiToTarget);
});

board.addEventListener("mouseup", () => {
  // if (lastUsedText) {
  //   setState(lastUsedText);
  // }
  // lastUsedText = currentText;
  setState(currentText);
  console.log(state);
  board.removeEventListener("mousemove", setEmojiToTarget);
});
board.addEventListener("mouseleave", () => {
  board.removeEventListener("mousemove", setEmojiToTarget);
});
document.addEventListener("touchend", () => {
  board.removeEventListener("touchmove", setEmojiToTarget);
});

resizeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  height = heightInput.value;
  width = widthInput.value;
  createBoard(height, width);
});

currentSelection.addEventListener("click", () => {
  openEmojiPicker();
});

// The picker emits an event when an emoji is selected. Do with it as you will!
picker.addEventListener("emoji:select", (event) => {
  setCurrentEmoji(event.emoji);
});

body.addEventListener("click", (e) => {
  if (
    e.target.closest("#side-tool-set") === sideToolSet ||
    e.target.closest("#current-selection span") === currentSelection
  ) {
    return;
  }
  closeEmojiPicker();
});

async function copyText(e) {
  e.preventDefault();
  const { clipboard } = navigator;

  await clipboard.writeText(currentText);
}

copyBtn.addEventListener("click", copyText);

async function getScreenShot(e) {
  e.preventDefault();
  document.querySelector(".picture")?.remove();
  let c = document.querySelector("#board"); // or document.getElementById('canvas');
  const canvas = await html2canvas(c);
  const link = document.createElement("a");
  document.body.appendChild(link);
  link.setAttribute("download", "emoji-art.png");
  link.setAttribute(
    "href",
    canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
  );
  link.click();
}
toPicBtn.addEventListener("click", getScreenShot);

// function getCurrentEmojiArtText() {
//   let text = "";
//   const tiles = document.querySelectorAll(".tile");
//   for (let i = 0; i < height; i++) {
//     for (let j = 0; j < width; j++) {
//       text += tiles[i * height + j].textContent;
//     }
//     text += "\n";
//   }
//   return text;
// }

undoBtn.addEventListener("click", () => {
  // const { key: lastKey, value: lastValue } = emojiTextArr.pop();
  // const toUndoTile = document.querySelector(`.tile[key="${lastKey}"]`);
  // toUndoTile.textContent = lastValue;
  // console.log(state);
  if (state[state.length - 1] === currentText) {
    undo();
  }
  setCurrentText(undo());

  renderBoardWithCurrentEmojiText();
});

function renderBoardWithCurrentEmojiText() {
  console.log("hello world");
  const tiles = Array.from(document.querySelectorAll(".tile"));
  console.log(currentText);
  let currentTextArr = currentText.split("\n");
  currentTextArr = currentTextArr.map((arr) => {
    return splitEmoji(arr);
  });

  if (tiles) {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        tiles[i * height + j].textContent = currentTextArr[i][j];
      }
    }
  }
}
