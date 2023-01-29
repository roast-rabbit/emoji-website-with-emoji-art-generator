import { createPicker } from "https://unpkg.com/picmo@latest/dist/index.js";

let emojiData;
let messages;

const body = document.querySelector("body");
const heightInput = document.querySelector("#stats input[name=height]");
const widthInput = document.querySelector("#stats input[name=width]");
const board = document.querySelector("#board");

const currentSelection = document.querySelector("#current-selection span");

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

function setCurrentText() {
  currentText = "";
  const tiles = document.querySelectorAll(".tile");
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      currentText += tiles[i * height + j].textContent;
    }
    currentText += "\n";
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
  // return "de";
}
// getLangCode();
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
console.log(emojiData);
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

document.querySelector(".picmo__picker.picmo__picker").style.setProperty("--picker-width", "100px");

sideToolSet.style.zIndex = "1";

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
      board.appendChild(element);
    }
  }
}

createBoard(height, width);

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
  if (targetTile) targetTile.textContent = currentSelectedEmoji;

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

  // document.addEventListener("mouseup", () => {
  //   board.removeEventListener("mousemove", setEmojiToTarget);
  // });
});

board.addEventListener("touchstart", (e) => {
  e.preventDefault();
  setEmojiToTarget(e);
  board.addEventListener("touchmove", setEmojiToTarget);
});

document.addEventListener("mouseup", () => {
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
  // console.log("copy!");

  await clipboard.writeText(currentText);
  // console.log(text);
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
  // html2canvas(c).then((canvas) => {
  //   const link = document.createElement("a");
  //   document.body.appendChild(link);
  //   link.setAttribute("download", "emoji-art.png");
  //   link.setAttribute(
  //     "href",
  //     canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
  //   );
  //   link.click();
  // });
}
toPicBtn.addEventListener("click", getScreenShot);

function getCurrentEmojiArtText() {
  let text = "";
  const tiles = document.querySelectorAll(".tile");
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      text += tiles[i * height + j].textContent;
    }
    text += "\n";
  }
  return text;
}
