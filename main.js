const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};

const symbols = [
  "https://i.imgur.com/CX18esM.png", // 黑桃
  "https://i.imgur.com/xBHZupv.png", // 愛心
  "https://i.imgur.com/F3Y9qTG.png", // 方塊
  "https://i.imgur.com/vV8jTLM.png", // 梅花
];

const view = {
  getCardElement(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = symbols[Math.floor(index / 13)];
    return `
      <div class="card__outer">
        <div data-index="${index}" class="card__cover">
          <img src="https://i.imgur.com/vvfi69V.jpg" referrerpolicy="no-referrer">
        </div>
        <div class="card__content">
          <p>${number}</p>
          <img src="${symbol}" referrerpolicy="no-referrer">
          <p>${number}</p>
        </div>      
      </div>
    `;
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },
  flipCards(...cards) {
    cards.map((card) => {
      let cardCover = card.children[0];
      let cardContent = card.children[1];
      if (
        !cardCover.classList.contains("flip") &&
        !cardContent.classList.contains("flip")
      ) {
        // 翻開
        cardCover.classList.add("flip");
        cardContent.classList.add("flip");
        if (
          cardContent.children[1].src == "https://i.imgur.com/xBHZupv.png" ||
          cardContent.children[1].src == "https://i.imgur.com/F3Y9qTG.png"
        ) {
          cardContent.style.color = "red";
        }
        return;
      }
      // 蓋住
      cardCover.classList.remove("flip");
      cardContent.classList.remove("flip");
    });
  },
  pairCards(...cards) {
    cards.map((card) => {
      let cardContent = card.children[1];
      cardContent.classList.add("paired");
    });
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      let cardContent = card.children[1];
      cardContent.classList.add("wrong");
      cardContent.addEventListener(
        "animationend",
        (event) => event.target.classList.remove("wrong"),
        { once: true }
      );
    });
  },
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  },
};

const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].children[0].dataset.index % 13 ===
      this.revealedCards[1].children[0].dataset.index % 13
    );
  },
  score: 0,
  triedTimes: 0,
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  dispatchCardAction(card) {
    let cardCover = card.children[0];
    let cardContent = card.children[1];
    if (
      cardCover.classList.contains("flip") &&
      cardContent.classList.contains("flip")
    ) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        console.log(model.revealedCards);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          setTimeout(this.matchCards, 500);
          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    console.log("this.currentState", this.currentState);
    console.log(
      "revealedCards",
      model.revealedCards.map((card) => card.children[0].dataset.index)
    );
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
  matchCards() {
    view.pairCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

controller.generateCards();
document.querySelectorAll(".card__outer").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
