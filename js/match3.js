const app = document.getElementById("app");
const level = document.querySelector("#game-box #stats #level span");
const timeRemaining = document.querySelector(
  "#game-box #stats #time-remaining span"
);
const score = document.querySelector("#game-box #stats #score span");
const bonusMessage = document.querySelector(
  "#game-box #stats #bonus-message span"
);
const message = document.querySelector("#game-box #message");
const messageInfo = document.querySelector("#game-box #message-info span");
const overlay = document.querySelector("#game-box #overlay");
const btn = document.querySelector("#action-btn");

const gameBox = document.querySelector("#game-box");

const emojis = ["🥮", "🍰", "🎃", "👻", "🍫"];

const x = 6;
const y = 8;

let cells = [];

class GameMap {
  #time = 10;
  #timer;
  #currentScore = 0;

  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.matrix = [];
    this.useSwap = false;
    this.handleable = true;
    this.types = emojis.length;

    app.style.width = `${this.x * this.size}px`;
    app.style.height = `${this.y * this.size}px`;

    this.startTimer();
    this.#currentScore = 0;
  }
  get timer() {
    return this.#timer;
  }
  genMatrix() {
    const { x, y } = this;
    const row = new Array(x).fill(undefined);
    const matrix = new Array(y).fill(undefined).map((item) => row);
    this.matrix = matrix;
    return this;
  }
  genRandom() {
    const { x, y } = this;
    this.matrix = this.matrix.map((row) =>
      row.map((item) => Math.floor(Math.random() * this.types))
    );
    return this;
  }
  init() {
    cells = [];
    const { x, y } = this;
    for (let i = 0; i < y; i++) {
      for (let j = 0; j < x; j++) {
        const type = this.matrix[i][j];
        const random = Math.floor(Math.random() * this.types);
        cells.push(
          new Cell({
            type: type == undefined ? random : type,
            position: [j, i],
            status: type == undefined ? "emerge" : "common",
            left: undefined,
            top: undefined,
            right: undefined,
            bottom: undefined,
            instance: undefined,
          })
        );
      }
    }
    cells.forEach((cell) => {
      const [row, col] = cell.position;
      cell.left = cells.find((_cell) => {
        const [_row, _col] = _cell.position;
        return _row == row - 1 && _col == col;
      });
      cell.right = cells.find((_cell) => {
        const [_row, _col] = _cell.position;
        return _row == row + 1 && _col == col;
      });
      cell.top = cells.find((_cell) => {
        const [_row, _col] = _cell.position;
        return _row == row && _col == col - 1;
      });
      cell.bottom = cells.find((_cell) => {
        const [_row, _col] = _cell.position;
        return _row == row && _col == col + 1;
      });
      cell.genCell();
    });
    return this;
  }
  genSwap(firstCell, secondCell) {
    return new Promise((resolve, reject) => {
      if (
        !firstCell ||
        !secondCell ||
        typeof firstCell.instance === "undefined" ||
        typeof secondCell.instance === "undefined"
      ) {
        return;
      }
      const { instance: c1, type: t1 } = firstCell;
      const { instance: c2, type: t2 } = secondCell;
      const { left: x1, top: y1 } = getComputedStyle(c1);
      const { left: x2, top: y2 } = getComputedStyle(c2);
      setTimeout(() => {
        c1.style.left = x2;
        c1.style.top = y2;
        c2.style.left = x1;
        c2.style.top = y1;
      }, 0);
      setTimeout(() => {
        firstCell.instance = c2;
        firstCell.type = t2;
        secondCell.instance = c1;
        secondCell.type = t1;
        resolve("ok");
      }, 500);
    });
  }
  checkCollapse() {
    return cells.some((cell) => cell.status == "collapse");
  }
  markCollapseCells() {
    cells.forEach((cell) => {
      const { left, right, top, bottom, type } = cell;
      if (left?.type == type && right?.type == type) {
        left.status = "collapse";
        cell.status = "collapse";
        right.status = "collapse";
      }
      if (top?.type == type && bottom?.type == type) {
        top.status = "collapse";
        cell.status = "collapse";
        bottom.status = "collapse";
      }
    });
    return this;
  }
  genEmerge() {
    return new Promise((resolve, reject) => {
      this.regenCellMap();
      this.genCellMap();
      setTimeout(() => {
        cells.forEach((cell) => {
          if (cell.status == "emerge") {
            cell.instance.style.transform = "scale(1)";
          }
        });
      }, 100);
      setTimeout(() => {
        resolve("ok");
      }, 500);
    });
  }
  genCollapse() {
    return new Promise((resolve, reject) => {
      this.handleable = false;
      this.markCollapseCells();
      let howMany = 0;
      setTimeout(() => {
        cells.forEach((cell) => {
          if (cell.status == "collapse") {
            cell.instance.style.transform = "scale(0)";
            howMany++;
          }
        });
      }, 0);
      setTimeout(() => {
        resolve(howMany);
      }, 500);
    });
  }
  genDownfall() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        cells.forEach((cell) => {
          if (cell.status != "collapse") {
            let downfallRange = 0;
            let bottom = cell.bottom;
            while (bottom) {
              if (bottom.status == "collapse") {
                downfallRange += 1;
              }
              bottom = bottom.bottom;
            }
            cell.instance.style.top =
              parseInt(getComputedStyle(cell.instance).top) +
              gameMap.size * downfallRange +
              "px";
          }
        });
      }, 0);
      setTimeout(() => {
        resolve("ok");
      }, 500);
    });
  }
  genShuffle() {
    console.log(cells);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const len = this.x * this.y;
        const arr = new Array(len).fill(0).map((_, i) => i);
        const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());
        const shuffleArray = shuffle(arr);
        console.log(shuffleArray);
        cells.forEach((cell, index) => {
          const newPosition = shuffleArray[index];
          cell.instance.style.top =
            Math.floor(newPosition / this.x) * this.size + "px";
          cell.instance.style.left = (newPosition % this.x) * this.size + "px";
        });
      }, 0);
      setTimeout(() => {
        this.regenCellMap();
        this.genCellMap();
        this.genLoop();
        resolve("ok");
      }, 500);
    });
  }
  async genLoop() {
    let times = 1;
    const howMany = await gameMap.genCollapse();
    this.upDateScore(times, howMany);

    let status = cells.some((cell) => cell.status == "collapse");
    while (cells.some((cell) => cell.status == "collapse")) {
      await gameMap.genDownfall();
      await gameMap.genEmerge();
      const howMany = await gameMap.genCollapse();
      times++;
      this.upDateScore(times, howMany);
    }
    gameMap.handleable = true;
    return status;
  }
  regenCellMap() {
    const size = gameMap.size;
    const findInstance = (x, y) => {
      return cells.find((item) => {
        const { offsetLeft, offsetTop } = item.instance;
        return (
          item.status != "collapse" &&
          x == offsetLeft / size &&
          y == offsetTop / size
        );
      })?.instance;
    };
    this.genMatrix();
    this.matrix = this.matrix.map((row, rowIndex) =>
      row.map((item, itemIndex) => findInstance(itemIndex, rowIndex)?.type)
    );

    this.init();
  }
  genCellMap() {
    app.innerHTML = "";
    cells.forEach((cell) => {
      app.append(cell.instance);
    });
    return this;
  }
  tick() {
    if (this.#time > 0) this.#time--;
    const min = String(Math.floor(this.#time / 60)).padStart(2, "00");
    const sec = String(this.#time % 60).padStart(2, "00");
    timeRemaining.textContent = `${min}:${sec}`;
    if (this.#time === 0) {
      this.showMessageBox();
    }
  }
  upDateScore(times, howMany) {
    this.#currentScore = this.#currentScore + times * howMany;
    score.textContent = this.#currentScore;
    if (howMany !== 0) {
      this.upDateBonusMessage(times);
    }
  }
  upDateBonusMessage(times) {
    if (times > 1) {
      bonusMessage.closest("div").classList.add("shown");
      bonusMessage.textContent = times;
      setTimeout(() => {
        bonusMessage.closest("div").classList.remove("shown");
      }, 1000);
    }
  }
  startTimer() {
    this.tick();
    this.#timer = setInterval(() => {
      this.tick();
    }, 1000);
  }
  showMessageBox() {
    message.classList.add("shown");
    overlay.classList.add("shown");
    messageInfo.textContent = this.#currentScore;
  }
}

class Cell {
  constructor(options) {
    const { position, status, type, left, top, right, bottom, instance } =
      options;
    this.type = type;
    this.position = position;
    this.status = status;
    this.top = top;
    this.bottom = bottom;
    this.left = left;
    this.right = right;
    this.instance = instance;
  }
  genCell() {
    const cell = document.createElement("div");
    const size = gameMap.size;
    const [x, y] = this.position;
    cell.type = this.type;
    cell.classList.add("cell");
    cell.style.setProperty("--size", `${size}px`);
    cell.style.setProperty("--x", x);
    cell.style.setProperty("--y", y);
    cell.style.setProperty(
      "transform",
      `scale(${this.status == "emerge" ? "0" : "1"})`
    );
    cell.innerHTML = `<span style="cursor:pointer ;font-size:${size * 0.8}px">${
      emojis[this.type]
    }</span>`;
    this.instance = cell;
  }
}
const getSize = function () {
  if (innerWidth > 1024) {
    return 85;
  } else if (innerWidth > 720) {
    return 80;
  } else if (innerWidth > 640) {
    return 70;
  } else if (innerWidth > 300) {
    return 55;
  } else {
    return 40;
  }
};
gameBox.style.width = `${getSize() * x}px`;

let gameMap = new GameMap(x, y, getSize());

gameMap.genMatrix().genRandom();
gameMap.init().genCellMap();
gameMap.genLoop();

function reStart() {
  gameMap = new GameMap(x, y, getSize());

  gameMap.genMatrix().genRandom();
  gameMap.init().genCellMap();
  gameMap.genShuffle();
  gameMap.genLoop();
}

let cell1 = null;
let cell2 = null;

app.onclick = (event) => {
  if (gameMap.handleable) {
    const target = event.target.closest("div");
    const { left: x, top: y } = target.style;
    const _cell = cells.find((item) => item.instance == target);
    if (!gameMap.useSwap) {
      target.classList.add("active");
      cell1 = _cell;
    } else {
      cell2 = _cell;
      cell1?.instance.classList.remove("active");
      if (
        ["left", "top", "bottom", "right"].some(
          (item) => cell1?.[item] == cell2
        )
      ) {
        (async () => {
          gameMap.handleable = false;
          await gameMap.genSwap(cell1, cell2);
          let res = await gameMap.genLoop();
          if (!res) {
            await gameMap.genSwap(cell1, cell2);
            gameMap.handleable = true;
          }
        })();
      }
    }
    gameMap.useSwap = !gameMap.useSwap;
  }
};

btn.addEventListener("click", () => {
  clearInterval(gameMap.timer);
  message.classList.remove("shown");
  overlay.classList.remove("shown");

  reStart();
});
