// 게임 설정
const GAME_CONFIG = {
  MAX_ATTEMPTS: 9,
  NUMBER_COUNT: 3,
  MIN_NUMBER: 0,
  MAX_NUMBER: 9,
};

const RESULT_TYPES = {
  STRIKE: "S",
  BALL: "B",
  OUT: "O",
};

// 전역 변수
let attempts = GAME_CONFIG.MAX_ATTEMPTS;
let answer = [];

// DOM 요소 참조
const attemptsSpan = document.getElementById("attempts");
const number1InputBox = document.getElementById("number1");
const number2InputBox = document.getElementById("number2");
const number3InputBox = document.getElementById("number3");
const resultDisplay = document.querySelector(".result-display");
const submitButton = document.querySelector(".submit-button");
const gameResultImg = document.getElementById("game-result-img");

// 중복되지 않는 랜덤 숫자 생성
function generateUniqueRandomNumbers(count, min, max) {
  const numbers = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers;
}

// 스타일이 적용된 DOM 요소 생성
function createStyledElement(tagName, className, text, styles = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.innerText = text;
  Object.assign(element.style, styles);
  return element;
}

function clearInputs() {
  number1InputBox.value = "";
  number2InputBox.value = "";
  number3InputBox.value = "";
}

function updateAttempts() {
  attempts--;
  attemptsSpan.innerText = attempts.toString();
}

// 모든 입력창이 채워져 있는지 확인
function areAllInputsFilled() {
  return (
    number1InputBox.value !== "" &&
    number2InputBox.value !== "" &&
    number3InputBox.value !== ""
  );
}

// 입력된 숫자들이 유효한지 검증 (0~9 범위)
function validateInputs() {
  const inputs = [
    number1InputBox.value,
    number2InputBox.value,
    number3InputBox.value,
  ];

  // 숫자 범위 확인
  for (let input of inputs) {
    const num = Number(input);
    if (
      isNaN(num) ||
      num < GAME_CONFIG.MIN_NUMBER ||
      num > GAME_CONFIG.MAX_NUMBER
    ) {
      return false;
    }
  }

  return true;
}

function getUserInputs() {
  return [
    Number(number1InputBox.value),
    Number(number2InputBox.value),
    Number(number3InputBox.value),
  ];
}

// 특정 위치의 숫자가 스트라이크, 볼, 아웃인지 판단
function checkSingleNumber(position, userInput) {
  if (answer[position] === userInput) {
    return RESULT_TYPES.STRIKE;
  } else if (answer.includes(userInput)) {
    return RESULT_TYPES.BALL;
  } else {
    return RESULT_TYPES.OUT;
  }
}

// 사용자 입력과 정답을 비교하여 결과 계산
function calculateResult() {
  const userInputs = getUserInputs();
  const result = [0, 0, 0]; // [Strike, Ball, Out]

  userInputs.forEach((input, index) => {
    const checkResult = checkSingleNumber(index, input);
    switch (checkResult) {
      case RESULT_TYPES.STRIKE:
        result[0]++;
        break;
      case RESULT_TYPES.BALL:
        result[1]++;
        break;
      case RESULT_TYPES.OUT:
        result[2]++;
        break;
    }
  });

  return result;
}

// 아웃 결과 표시 요소 생성
function createOutDisplay() {
  return createStyledElement("div", "out", " O ", {
    borderRadius: "50%",
    width: "20px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });
}

// 스트라이크/볼 결과 표시 요소 생성
function createStrikeBallDisplay(result) {
  const container = createStyledElement("div", "", "", {
    width: "64px",
    height: "35px",
    display: "flex",
    alignItems: "center",
  });

  const iconStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "20px",
    height: "30px",
    borderRadius: "50%",
  };

  // 스트라이크 표시
  const strikeCount = createStyledElement("span", "", result[0].toString());
  const strikeIcon = createStyledElement("span", "strike", " S ", iconStyles);

  // 볼 표시
  const ballCount = createStyledElement("span", "", result[1].toString());
  const ballIcon = createStyledElement("span", "ball", " B ", iconStyles);

  container.appendChild(strikeCount);
  container.appendChild(strikeIcon);
  container.appendChild(ballCount);
  container.appendChild(ballIcon);

  return container;
}

// 게임 결과를 화면에 표시
function displayGameResult(result) {
  const checkResult = createStyledElement("div", "check-result", "", {
    height: "35px",
  });

  // 사용자 입력 표시
  const userInput = createStyledElement(
    "span",
    "",
    `${number1InputBox.value} ${number2InputBox.value} ${number3InputBox.value}`
  );
  const colon = createStyledElement("span", "", ":");

  checkResult.appendChild(userInput);
  checkResult.appendChild(colon);

  // 결과에 따른 표시
  if (result[2] === GAME_CONFIG.NUMBER_COUNT) {
    checkResult.appendChild(createOutDisplay());
  } else {
    checkResult.appendChild(createStrikeBallDisplay(result));
  }

  resultDisplay.appendChild(checkResult);
}

// 게임 종료 상태 확인 및 처리
function checkGameEnd(result) {
  const isWin = result[0] === GAME_CONFIG.NUMBER_COUNT;
  const isLose = attempts === 0 && !isWin;

  if (isWin) {
    gameResultImg.src = "./success.png";
    submitButton.disabled = true;
  } else if (isLose) {
    gameResultImg.src = "./fail.png";
    submitButton.disabled = true;
  }
}

// 게임 초기화
function initializeGame() {
  attempts = GAME_CONFIG.MAX_ATTEMPTS;
  attemptsSpan.innerText = attempts.toString();

  answer = generateUniqueRandomNumbers(
    GAME_CONFIG.NUMBER_COUNT,
    GAME_CONFIG.MIN_NUMBER,
    GAME_CONFIG.MAX_NUMBER
  );

  clearInputs();
  resultDisplay.innerHTML = "";
  gameResultImg.src = "";
  submitButton.disabled = false;
}

// 메인 게임 함수 - submit 버튼 클릭 시 실행
function checkNumbers() {
  // 입력 검증
  if (!areAllInputsFilled()) {
    clearInputs();
    return;
  }

  if (!validateInputs()) {
    alert("0~9 사이의 숫자 3개를 입력해주세요.");
    clearInputs();
    return;
  }

  // 게임 로직 실행
  const result = calculateResult();
  displayGameResult(result);
  updateAttempts();
  checkGameEnd(result);

  clearInputs();
}

// 게임 시작
initializeGame();

// HTML onclick에서 호출할 수 있도록 전역 함수로 등록
window.check_numbers = checkNumbers;
