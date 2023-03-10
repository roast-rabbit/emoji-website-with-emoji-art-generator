const message = document.querySelector("#game #message");
const messageInfo = document.querySelector("#game #message #message-info");
const overlay = document.querySelector("#game #overlay");
const actionBtnSuffle = document.querySelector(
  "#game #message .action-btn#shuffle"
);
const actionBtnRestart = document.querySelector(
  "#game #message .action-btn#restart"
);
const timeRemaining = document.querySelector("#time-remaining span");
const currentLevel = document.querySelector(
  "#game #game-stats #current-level span"
);

const mapNumberToEmoji = {
  1: "๐",
  2: "๐ฐ",
  3: "๐ซ",
  4: "๐",
  5: "๐ฐ",
  6: "๐ฎ",
  7: "๐ฅฎ",
  8: "๐ฅฅ",
  9: "โ๏ธ",
  10: "๐ฅ",
  11: "๐",
  12: "๐",
  13: "๐",
  14: "๐",
  15: "๐",
  16: "โ๏ธ",
  17: "๐",
  18: "๐ฅ",
  19: "๐",
  20: "๐ฃ",
  21: "๐ฆ",
  22: "๐ฅ",
  23: "๐ง",
  24: "๐บ",
};

const levels = {
  1: {
    x: 2,
    y: 2,
    l: 100,
    z: 2,
  },
  2: {
    x: 4,
    y: 4,
    l: 100,
    z: 2,
  },
  3: {
    x: 5,
    y: 6,
    l: 60,
    z: 2,
  },
  4: {
    x: 6,
    y: 6,
    l: 50,
    z: 2,
  },
  5: {
    x: 6,
    y: 6,
    l: 100,
    z: 4,
  },
  6: {
    x: 6,
    y: 6,
    l: 100,
    z: 2,
  },
};

const cellSize = 60;
const lineWidth = cellSize / 10;
const offSet = cellSize / 2 + lineWidth;
let scaleParam = 0.2;

class LinkGame {
  #time = 30;
  #timer;
  #timeoutId;
  constructor(level, dom) {
    this.level = level;
    currentLevel.textContent = level;
    this.x = levels[level].x; //ๅๆฐ
    this.y = levels[level].y; //่กๆฐ
    this.l = levels[level].l / 100; //ๆธธๆๆปก็็๏ผๆๅคงไธบ1(่กจ็คบๆฒกๆ็ฉบ็ฝ)๏ผ้่ฆๆณจๆx*y*l%z=0
    this.z = levels[level].z; //ๆฏไธช็ธๅๅ็ด ๅบ็ฐ็ๆฌกๆฐ
    this.dom = dom;
    this.gameinit();
    this.gamecontrol();
    this.startTimer();

    actionBtnSuffle.addEventListener("click", () => {
      this.closeModal();
      this.clearDom();
      this.reorderMap();
      this.renderdom();
      this.gamecontrol();
    });
    actionBtnRestart.addEventListener("click", () => {
      this.closeModal();
      this.initGameToLevel(1);
    });
  }
  gameinit() {
    //ๆธธๆๅๅงๅ๏ผ็ๆๆธธๆ็ปๅธ->ๆธธๆๆฐๆฎ->ๆธฒๆๆธธๆDOM
    this.dom.css({
      width: `${this.x * cellSize * scaleParam}vmin`,
      height: `${this.y * cellSize * scaleParam}vmin`,
    });
    this.gamearrmap();

    while (this.testAll() === false) {
      if (this.checkEmpty()) break;
      else {
        console.log("Cannot match any pairs, reordering game map...");
        this.gamearrmap();
      }
    }
    this.clearDom();
    this.renderdom();
  }

  initGameToLevel(level) {
    this.level = level > 6 ? 6 : level;
    currentLevel.textContent = level;
    this.x = levels[level]?.x || levels[6].x;
    this.y = levels[level]?.y || levels[6].y;
    this.l = levels[level]?.l / 100 || levels[6].l / 100;
    this.z = levels[level]?.z || levels[6].z;

    this.clearDom();
    this.dom = $(".game");
    this.gameinit();
    this.gamecontrol();
    if (level === 1) {
      this.#time = 30;
    } else {
      this.#time += 30;
    }
  }
  tick() {
    const min = String(Math.trunc(this.#time / 60)).padStart(2, "00");
    const sec = String(this.#time % 60).padStart(2, "00");
    timeRemaining.textContent = `${min}:${sec}`;
    if (this.#time > 0) {
      this.#time--;
    } else {
      this.showModel({ type: "restart" });
    }
  }
  startTimer() {
    this.tick();
    this.#timer = setInterval(() => {
      this.tick();
    }, 1000);
  }

  showModel({ type }) {
    actionBtnRestart.classList.remove("shown");
    actionBtnSuffle.classList.remove("shown");

    message.classList.add("shown");
    overlay.classList.add("shown");
    if (type === "restart") {
      messageInfo.textContent = "Timeoutโฒ๏ธ";
      actionBtnRestart.classList.add("shown");
    } else {
      messageInfo.textContent = "No matching pairs left, need to shuffle";
      actionBtnSuffle.classList.add("shown");
    }
  }

  closeModal() {
    message.classList.remove("shown");
    overlay.classList.remove("shown");
  }

  testAll() {
    for (let i = 0; i < this.x * this.y; i++) {
      for (let j = i + 1; j < this.x * this.y; j++) {
        let ai = parseInt(i / this.x) + 1; //ๅ ไธบ่ๆๅฐๅพๆฏๅฎ้ๅคงไธๅ๏ผๆไปฅ้ฝ+1
        let aj = (i % this.x) + 1;
        let bi = parseInt(j / this.x) + 1;
        let bj = (j % this.x) + 1;
        if (this.arrmap[ai][aj] !== 0 && this.arrmap[bi][bj] !== 0) {
          if (this.testConnect(i, j) == true) return true;
        }
      }
    }
    return false;
  }

  clearDom() {
    this.dom.empty();
  }

  gamearrmap() {
    let arrmap = []; // ็ๆ่ๆไบ็ปดๆฐ็ป๏ผๆฏๅฎ้ๆฐ็ปๅคงไธๅ๏ผๆนไพฟ่ฟ็บฟ่ฎก็ฎ๏ผ,ๅนถๅๅงๅผๅไธบ0

    for (let i = 0; i < this.y + 2; i++) {
      arrmap[i] = new Array();
      for (let j = 0; j < this.x + 2; j++) {
        arrmap[i].push(0);
      }
    }

    const arrbase = []; // ็ๆๅบ็กๆฐๆฎไธ็ปดๆฐ็ป
    let max = (this.x * this.y * this.l) / this.z;
    console.log(
      `x: ${this.x} y: ${this.y} l: ${this.l} z: ${this.z} max:${max}`
    );
    for (let m = 0; m < this.z; m++) {
      for (let n = 0; n < max; n++) arrbase[n + m * max] = n + 1;
    }

    console.log(`arrbase:${arrbase}`);

    const arrorder = []; //็ๆไนฑๅบๆฐ็ป
    const arrtemp = []; //้กบๅบๆฐ็ป๏ผไธดๆถไฝฟ็จ๏ผ
    for (let h = 0; h < this.x * this.y; h++) {
      arrtemp[h] = h;
    }

    console.log(`arrtemp:${arrtemp}`);
    for (let g = 0; g < this.x * this.y; g++) {
      //   console.log(`g:${g}`);
      //ไป้กบๅบๆฐ็ปไธญ้ๆบไฝ็ฝฎๆฟไธไธชๆฐ๏ผๆๅ็ๆไนฑๅบๆฐ็ป
      const temp = Math.floor(Math.random() * arrtemp.length);

      arrorder.push(arrtemp.splice(temp, 1)[0]);
    }

    //ๆ นๆฎๆญค้กบๅบๅฐๅบ็กๆฐ็ปๆทปๅ ๅฐๅฐๅพๆฐ็ป
    for (let o = 0; o < arrbase.length; o++) {
      arrmap[Math.floor(arrorder[o] / this.x) + 1][(arrorder[o] % this.x) + 1] =
        arrbase[o];
    }
    // console.table(arrmap);

    this.arrmap = arrmap;
  }

  renderdom() {
    console.table(this.arrmap);
    for (let i = 0; i < this.y; i++) {
      for (let j = 0; j < this.x; j++) {
        console.log(`i:${i},j:${j}   ${this.arrmap[i + 1][j + 1]}`);
        this.dom.append(
          `<li class="list${this.arrmap[i + 1][j + 1]}" style="width:${
            cellSize * scaleParam
          }vmin;height:${cellSize * scaleParam}vmin"><i></i>${
            this.arrmap[i + 1][j + 1] !== 0
              ? mapNumberToEmoji[this.arrmap[i + 1][j + 1]]
              : ""
          }</li>`
        );
      }
    }
    this.dom.append(
      "<li class='line'></li><li class='line'></li><li class='line'></li>"
    );
  }

  drawArr(arr) {
    //ๆๅฐไบ็ปดๆฐ็ป
    const row = arr.length;
    const col = arr[0].length;
    const data = "";
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        data += arr[i][j] + ",";
      }
      data += "\n";
    }
    console.log(data);
  }

  showHint() {
    console.table(this.arrmap);
    const liArray = this.dom.find("li");

    console.log(liArray);
    loop1: for (let i = 0; i < this.x * this.y; i++) {
      for (let j = i + 1; j < this.x * this.y; j++) {
        if (this.testConnect(i, j) == true) {
          const li1 = liArray.get(i);
          const li2 = liArray.get(j);
          if (
            !li1.classList.contains("list0") &&
            !li2.classList.contains("list0")
          ) {
            li1.classList.add("hint");
            li2.classList.add("hint");
            break loop1;
          }
        }
      }
    }
  }

  setHintInSecond({ sec }) {
    clearTimeout(this.#timeoutId);
    this.#timeoutId = setTimeout(() => {
      this.showHint();
    }, sec * 1000);
  }

  gamecontrol() {
    console.table(this.arrmap);
    var that = this;
    that.setHintInSecond({ sec: 5 });

    that.curr = null;
    that.dom.find("li").bind("click", function () {
      if ($(this).hasClass("hint")) {
        $(this).removeClass("hint");
      }
      if (that.curr == null) {
        //ๆฒกๆ้ไธญ้กน็ๆๅต
        $(this).addClass("active");
        that.curr = $(this);
      } else if (that.curr.index() != $(this).index()) {
        //ๆ้ไธญ้กน๏ผ็ดๆฅ่ฟ่ก้ช่ฏ
        if (that.getconnect(that.curr, $(this))) {
          //่ฅ่ฝ่ฟๆฅ
          that.dom.find("li").css("pointer-events", "none");
          setTimeout(() => {
            that.curr.removeAttr("class").addClass("list0").unbind("click");
            $(this).removeAttr("class").addClass("list0").unbind("click");
            that.curr = null;
            that.dom.find("li").css("pointer-events", "auto");

            console.table(that.arrmap);

            while (that.testAll() == false) {
              if (!that.checkEmpty()) {
                console.log("cannot match any pairs, reordering game map...");
                that.showModel({ type: "shuffle" });
                break;
              } else {
                that.initGameToLevel(that.level + 1);
                break;
              }
            }
          }, 100);
        } else {
          $(this).addClass("active").siblings().removeClass("active");
          that.curr = $(this);
        }
      }
      that.setHintInSecond({ sec: 5 });
    });
    that.dom.find("li.list0").unbind("click"); //ไธบ็ฉบ้กน็ๅๆถ็ปๅฎ
  }

  checkEmpty() {
    let flg = true;
    this.arrmap.forEach((row) => {
      if (row.some((el) => el !== 0)) flg = false;
    });
    return flg;
  }

  reorderMap() {
    console.table(this.arrmap);
    const tempArray = [];
    for (let i = 1; i < this.y; i++) {
      for (let j = 1; j < this.x; j++) {
        tempArray.push(this.arrmap[i][j]);
      }
    }
    for (let i = 1; i < this.y; i++) {
      for (let j = 1; j < this.x; j++) {
        const randomIndex = Math.floor(Math.random() * tempArray.length);
        this.arrmap[i][j] = tempArray.splice(randomIndex, 1)[0];
      }
    }
    console.table(this.arrmap);
  }

  testConnect(a, b) {
    var that = this;
    var isopen = false;
    var ai = parseInt(a / that.x) + 1; //ๅ ไธบ่ๆๅฐๅพๆฏๅฎ้ๅคงไธๅ๏ผๆไปฅ้ฝ+1
    var aj = (a % that.x) + 1;
    var bi = parseInt(b / that.x) + 1;
    var bj = (b % that.x) + 1;
    console.log("ๅฝๅๅฏนๆฏ(" + ai + "," + aj + ")ๅ(" + bi + "," + bj + ")");
    if (that.arrmap[ai][aj] != that.arrmap[bi][bj]) {
      console.log("ไธคๆฌก้ๆฉๅๅฎนไธๅ๏ผไธๅฏๆถ้ค");
      return false;
    } else {
      //ๅคๆญๆฏๅฆๅ่กๆๅๅ
      if (ai == bi) {
        //ๅ่ก
        if (that.isopen_h(that.arrmap, ai, aj, bj)) {
          //็ด็บฟๅฏ่ฟๆฅ
          // that.arrmap[ai][aj] = 0;
          // that.arrmap[bi][bj] = 0;
          // that.drawline_h(ai, aj, bj, 0);
          return true;
        } else {
          //ไธ็บฟๅฏ่ฟๆฅ
          for (var i = 0; i < that.y + 2; i++) {
            if (
              that.isopen_h(that.arrmap, i, aj, bj) &&
              that.isopen_v(that.arrmap, aj, ai, i) &&
              that.isopen_v(that.arrmap, bj, bi, i) &&
              that.arrmap[i][aj] == 0 &&
              that.arrmap[i][bj] == 0
            ) {
              console.log("ๅ่กไธ็บฟ็ฌฌ" + i + "่กๅฝขๆ้่ทฏ");
              // that.drawline_h(i, aj, bj, 0);
              // that.drawline_v(aj, ai, i, 1);
              // that.drawline_v(bj, bi, i, 2);
              // that.arrmap[ai][aj] = 0;
              // that.arrmap[bi][bj] = 0;
              isopen = true;
              break;
            }
          }
          return isopen;
        }
      } else if (aj == bj) {
        //ๅๅ
        if (that.isopen_v(that.arrmap, aj, ai, bi)) {
          //็ด็บฟๅฏ่ฟๆฅ
          // that.arrmap[ai][aj] = 0;
          // that.arrmap[bi][bj] = 0;
          // that.drawline_v(aj, ai, bi, 0);
          return true;
        } else {
          //ไธ็บฟๅฏ่ฟๆฅ
          for (var j = 0; j < that.x + 2; j++) {
            if (
              that.isopen_v(that.arrmap, j, ai, bi) &&
              that.isopen_h(that.arrmap, ai, aj, j) &&
              that.isopen_h(that.arrmap, bi, bj, j) &&
              that.arrmap[ai][j] == 0 &&
              that.arrmap[bi][j] == 0
            ) {
              console.log("ๅๅไธ็บฟ็ฌฌ" + j + "ๅๅฝขๆ้่ทฏ");
              // that.drawline_v(j, ai, bi, 0);
              // that.drawline_h(ai, aj, j, 1);
              // that.drawline_h(bi, bj, j, 2);
              // that.arrmap[ai][aj] = 0;
              // that.arrmap[bi][bj] = 0;
              isopen = true;
              break;
            }
          }
          return isopen;
        }
      } else {
        //ไธๅ่กๅๅ
        //ไธคๆก็บฟๅฏ่ฟ
        if (
          that.arrmap[ai][bj] == 0 &&
          that.isopen_h(that.arrmap, ai, aj, bj) &&
          that.isopen_v(that.arrmap, bj, ai, bi)
        ) {
          console.log("ไธๅ่กๅๅไธ๏ผ" + ai + "," + bj + ")็นไธค็บฟ้่ทฏ");
          // that.drawline_h(ai, aj, bj, 0);
          // that.drawline_v(bj, ai, bi, 1);
          // that.arrmap[ai][aj] = 0;
          // that.arrmap[bi][bj] = 0;
          return true;
        } else if (
          that.arrmap[bi][aj] == 0 &&
          that.isopen_v(that.arrmap, aj, ai, bi) &&
          that.isopen_h(that.arrmap, bi, aj, bj)
        ) {
          console.log("ไธๅ่กๅๅไธ๏ผ" + bi + "," + aj + ")็นไธค็บฟ้่ทฏ");
          // that.drawline_v(aj, ai, bi, 0);
          // that.drawline_h(bi, aj, bj, 1);
          // that.arrmap[ai][aj] = 0;
          // that.arrmap[bi][bj] = 0;
          return true;
        } else {
          //ไธๆก็บฟๅฏ่ฟ
          for (var i = 0; i < that.y + 2; i++) {
            if (
              that.isopen_h(that.arrmap, i, aj, bj) &&
              that.isopen_v(that.arrmap, aj, ai, i) &&
              that.isopen_v(that.arrmap, bj, bi, i) &&
              that.arrmap[i][aj] == 0 &&
              that.arrmap[i][bj] == 0
            ) {
              console.log("ไธๅ่กไธ็บฟ็ฌฌ" + i + "่กๅฝขๆ้่ทฏ");
              // that.drawline_h(i, aj, bj, 0);
              // that.drawline_v(aj, ai, i, 1);
              // that.drawline_v(bj, bi, i, 2);
              // that.arrmap[ai][aj] = 0;
              // that.arrmap[bi][bj] = 0;
              isopen = true;
              break;
            }
          }
          if (isopen) {
            return isopen;
          } else {
            for (var j = 0; j < that.x + 2; j++) {
              if (
                that.isopen_v(that.arrmap, j, ai, bi) &&
                that.isopen_h(that.arrmap, ai, aj, j) &&
                that.isopen_h(that.arrmap, bi, bj, j) &&
                that.arrmap[ai][j] == 0 &&
                that.arrmap[bi][j] == 0
              ) {
                console.log("ไธๅๅไธ็บฟ็ฌฌ" + j + "ๅๅฝขๆ้่ทฏ");
                // that.drawline_v(j, ai, bi, 0);
                // that.drawline_h(ai, aj, j, 1);
                // that.drawline_h(bi, bj, j, 2);
                // that.arrmap[ai][aj] = 0;
                // that.arrmap[bi][bj] = 0;
                isopen = true;
                break;
              }
            }
            return isopen;
          }
        }
      }
    }
  }

  getconnect(a, b) {
    var that = this;
    var isopen = false;
    var ai = parseInt(a.index() / that.x) + 1; //ๅ ไธบ่ๆๅฐๅพๆฏๅฎ้ๅคงไธๅ๏ผๆไปฅ้ฝ+1
    var aj = (a.index() % that.x) + 1;
    var bi = parseInt(b.index() / that.x) + 1;
    var bj = (b.index() % that.x) + 1;
    console.log("ๅฝๅๅฏนๆฏ(" + ai + "," + aj + ")ๅ(" + bi + "," + bj + ")");
    if (that.arrmap[ai][aj] != that.arrmap[bi][bj]) {
      console.log("ไธคๆฌก้ๆฉๅๅฎนไธๅ๏ผไธๅฏๆถ้ค");
      return false;
    } else {
      //ๅคๆญๆฏๅฆๅ่กๆๅๅ
      if (ai == bi) {
        //ๅ่ก
        if (that.isopen_h(that.arrmap, ai, aj, bj)) {
          //็ด็บฟๅฏ่ฟๆฅ
          that.arrmap[ai][aj] = 0;
          that.arrmap[bi][bj] = 0;
          that.drawline_h(ai, aj, bj, 0);
          return true;
        } else {
          //ไธ็บฟๅฏ่ฟๆฅ
          for (var i = 0; i < that.y + 2; i++) {
            if (
              that.isopen_h(that.arrmap, i, aj, bj) &&
              that.isopen_v(that.arrmap, aj, ai, i) &&
              that.isopen_v(that.arrmap, bj, bi, i) &&
              that.arrmap[i][aj] == 0 &&
              that.arrmap[i][bj] == 0
            ) {
              console.log("ๅ่กไธ็บฟ็ฌฌ" + i + "่กๅฝขๆ้่ทฏ");
              that.drawline_h(i, aj, bj, 0);
              that.drawline_v(aj, ai, i, 1);
              that.drawline_v(bj, bi, i, 2);
              that.arrmap[ai][aj] = 0;
              that.arrmap[bi][bj] = 0;
              isopen = true;
              break;
            }
          }
          return isopen;
        }
      } else if (aj == bj) {
        //ๅๅ
        if (that.isopen_v(that.arrmap, aj, ai, bi)) {
          //็ด็บฟๅฏ่ฟๆฅ
          that.arrmap[ai][aj] = 0;
          that.arrmap[bi][bj] = 0;
          that.drawline_v(aj, ai, bi, 0);
          return true;
        } else {
          //ไธ็บฟๅฏ่ฟๆฅ
          for (var j = 0; j < that.x + 2; j++) {
            if (
              that.isopen_v(that.arrmap, j, ai, bi) &&
              that.isopen_h(that.arrmap, ai, aj, j) &&
              that.isopen_h(that.arrmap, bi, bj, j) &&
              that.arrmap[ai][j] == 0 &&
              that.arrmap[bi][j] == 0
            ) {
              console.log("ๅๅไธ็บฟ็ฌฌ" + j + "ๅๅฝขๆ้่ทฏ");
              that.drawline_v(j, ai, bi, 0);
              that.drawline_h(ai, aj, j, 1);
              that.drawline_h(bi, bj, j, 2);
              that.arrmap[ai][aj] = 0;
              that.arrmap[bi][bj] = 0;
              isopen = true;
              break;
            }
          }
          return isopen;
        }
      } else {
        //ไธๅ่กๅๅ
        //ไธคๆก็บฟๅฏ่ฟ
        if (
          that.arrmap[ai][bj] == 0 &&
          that.isopen_h(that.arrmap, ai, aj, bj) &&
          that.isopen_v(that.arrmap, bj, ai, bi)
        ) {
          console.log("ไธๅ่กๅๅไธ๏ผ" + ai + "," + bj + ")็นไธค็บฟ้่ทฏ");
          that.drawline_h(ai, aj, bj, 0);
          that.drawline_v(bj, ai, bi, 1);
          that.arrmap[ai][aj] = 0;
          that.arrmap[bi][bj] = 0;
          return true;
        } else if (
          that.arrmap[bi][aj] == 0 &&
          that.isopen_v(that.arrmap, aj, ai, bi) &&
          that.isopen_h(that.arrmap, bi, aj, bj)
        ) {
          console.log("ไธๅ่กๅๅไธ๏ผ" + bi + "," + aj + ")็นไธค็บฟ้่ทฏ");
          that.drawline_v(aj, ai, bi, 0);
          that.drawline_h(bi, aj, bj, 1);
          that.arrmap[ai][aj] = 0;
          that.arrmap[bi][bj] = 0;
          return true;
        } else {
          //ไธๆก็บฟๅฏ่ฟ
          for (var i = 0; i < that.y + 2; i++) {
            if (
              that.isopen_h(that.arrmap, i, aj, bj) &&
              that.isopen_v(that.arrmap, aj, ai, i) &&
              that.isopen_v(that.arrmap, bj, bi, i) &&
              that.arrmap[i][aj] == 0 &&
              that.arrmap[i][bj] == 0
            ) {
              console.log("ไธๅ่กไธ็บฟ็ฌฌ" + i + "่กๅฝขๆ้่ทฏ");
              that.drawline_h(i, aj, bj, 0);
              that.drawline_v(aj, ai, i, 1);
              that.drawline_v(bj, bi, i, 2);
              that.arrmap[ai][aj] = 0;
              that.arrmap[bi][bj] = 0;
              isopen = true;
              break;
            }
          }
          if (isopen) {
            return isopen;
          } else {
            for (var j = 0; j < that.x + 2; j++) {
              if (
                that.isopen_v(that.arrmap, j, ai, bi) &&
                that.isopen_h(that.arrmap, ai, aj, j) &&
                that.isopen_h(that.arrmap, bi, bj, j) &&
                that.arrmap[ai][j] == 0 &&
                that.arrmap[bi][j] == 0
              ) {
                console.log("ไธๅๅไธ็บฟ็ฌฌ" + j + "ๅๅฝขๆ้่ทฏ");
                that.drawline_v(j, ai, bi, 0);
                that.drawline_h(ai, aj, j, 1);
                that.drawline_h(bi, bj, j, 2);
                that.arrmap[ai][aj] = 0;
                that.arrmap[bi][bj] = 0;
                isopen = true;
                break;
              }
            }
            return isopen;
          }
        }
      }
    }
  }

  //้ช่ฏๅ่กไธค็นไน้ดๆฏๅฆ้็
  isopen_h(arr, i, aj, bj) {
    var a = true;
    if (Math.abs(aj - bj) != 1) {
      //ไธ็ธ้ป๏ผ็ธ้ป็ดๆฅ้่ฟ๏ผaj=bj็ๆๅตๅ้ขๅทฒ็ปๆ้ค
      for (var k = 1; k < Math.abs(aj - bj); k++) {
        var jj = aj > bj ? bj + k : aj + k;
        if (arr[i][jj] != 0) {
          a = false;
          console.log("ๆจชๅๅๆ ้ปๅก" + i + "," + jj);
          break;
        }
      }
    }
    return a;
  }
  //้ช่ฏๅๅไธค็นไน้ดๆฏๅฆ้็
  isopen_v(arr, j, ai, bi) {
    var a = true;
    if (Math.abs(ai - bi) != 1) {
      //ไธ็ธ้ป๏ผ็ธ้ป็ดๆฅ้่ฟ๏ผai=bi็ๆๅตๅ้ขๅทฒ็ปๆ้ค
      for (var k = 1; k < Math.abs(ai - bi); k++) {
        var ii = ai > bi ? bi + k : ai + k;
        if (arr[ii][j] != 0) {
          a = false;
          console.log("็บตๅๅๆ ้ปๅก" + ii + "," + j);
          break;
        }
      }
    }
    return a;
  }
  //็ป่ฟๆฅ็บฟ
  drawline_h(i, aj, bj, n) {
    var s = aj > bj ? bj : aj;
    $(".game .line")
      .eq(n)
      .css({
        top: `${(offSet + cellSize * [i - 1]) * scaleParam}vmin`,
        left: `${(offSet + cellSize * [s - 1]) * scaleParam}vmin`,
        width: `${(Math.abs(aj - bj) * cellSize + lineWidth) * scaleParam}vmin`,
        height: `${lineWidth * scaleParam}vmin`,
      });
    setTimeout(function () {
      $(".game .line").eq(n).css({ top: 0, left: 0, width: 0, height: 0 });
    }, 100);
  }
  drawline_v(j, ai, bi, n) {
    var s = ai > bi ? bi : ai;
    $(".game .line")
      .eq(n)
      .css({
        top: `${(offSet + cellSize * [s - 1]) * scaleParam}vmin`,
        left: `${(offSet + cellSize * [j - 1]) * scaleParam}vmin`,
        width: `${lineWidth * scaleParam}vmin`,
        height: `${
          (Math.abs(ai - bi) * cellSize + lineWidth) * scaleParam
        }vmin`,
      });
    setTimeout(function () {
      $(".game .line").eq(n).css({ top: 0, left: 0, width: 0, height: 0 });
    }, 100);
  }
}

const game = new LinkGame(1, $(".game"));
