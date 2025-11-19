/**
 * main.js
 * Catch Zone 게임 - 포즈 인식과 게임 로직을 초기화하고 연결
 */

// 전역 변수
let poseEngine;
let gameEngine;
let stabilizer;
let ctx;

/**
 * 애플리케이션 초기화
 */
async function init() {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  startBtn.disabled = true;

  try {
    // 1. PoseEngine 초기화
    poseEngine = new PoseEngine("./my_model/");
    const { maxPredictions, webcam } = await poseEngine.init({
      size: 200,
      flip: true
    });

    // 2. Stabilizer 초기화
    stabilizer = new PredictionStabilizer({
      threshold: 0.7,
      smoothingFrames: 3
    });

    // 3. GameEngine 초기화
    gameEngine = new GameEngine();
    setupGameCallbacks();

    // 4. 캔버스 설정
    const canvas = document.getElementById("canvas");
    canvas.width = 200;
    canvas.height = 200;
    ctx = canvas.getContext("2d");

    // 5. PoseEngine 콜백 설정
    poseEngine.setPredictionCallback(handlePrediction);
    poseEngine.setDrawCallback(drawPose);

    // 6. PoseEngine 시작
    poseEngine.start();

    // 7. 게임 자동 시작
    gameEngine.start();

    stopBtn.disabled = false;
  } catch (error) {
    console.error("초기화 중 오류 발생:", error);
    alert("초기화에 실패했습니다. 콘솔을 확인하세요.");
    startBtn.disabled = false;
  }
}

/**
 * 애플리케이션 중지
 */
function stop() {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  if (poseEngine) {
    poseEngine.stop();
  }

  if (gameEngine && gameEngine.isGameActive) {
    gameEngine.stop();
  }

  if (stabilizer) {
    stabilizer.reset();
  }

  startBtn.disabled = false;
  stopBtn.disabled = true;
}

/**
 * 게임 엔진 콜백 설정
 */
function setupGameCallbacks() {
  // 점수 변경
  gameEngine.setScoreChangeCallback((score) => {
    document.getElementById("score").textContent = score;
  });

  // 레벨 변경
  gameEngine.setLevelChangeCallback((level, timeRemaining) => {
    document.getElementById("level").textContent = level;
    document.getElementById("level-time").textContent = timeRemaining;
  });

  // 미스 카운트 변경
  gameEngine.setMissCountChangeCallback((missCount) => {
    const missDisplay = document.getElementById("miss-count");
    missDisplay.textContent = `${missCount}/2`;

    // 경고 표시
    if (missCount === 1) {
      missDisplay.classList.add("warning");
    } else {
      missDisplay.classList.remove("warning");
    }
  });

  // 바구니 이동
  gameEngine.setBasketMoveCallback((zone) => {
    const basket = document.getElementById("basket");
    basket.className = 'basket';
    basket.classList.add(`zone-${zone.toLowerCase()}`);
  });

  // 아이템 업데이트
  gameEngine.setItemUpdateCallback((items) => {
    updateItemsDisplay(items);
  });

  // 게임 종료
  gameEngine.setGameEndCallback((score, level) => {
    const reason = gameEngine.gameOverReason;
    let message = `게임 오버!\n`;

    if (reason === 'bomb') {
      message += `폭탄을 받았습니다! 💣\n`;
    } else if (reason === 'miss') {
      message += `과일을 2번 놓쳤습니다!\n`;
    }

    message += `\n최종 점수: ${score}\n도달 레벨: ${level}`;

    setTimeout(() => {
      alert(message);
    }, 100);
  });

  // 레벨업 시 메시지 표시
  gameEngine.setLevelUpCallback((prevLevel, newLevel) => {
    showLevelMessage(`🎉 Level ${prevLevel} 완료!\n준비하세요...`);
  });

  // 새 레벨 시작 메시지
  gameEngine.setLevelStartCallback((level) => {
    showLevelMessage(`🚀 Level ${level} 시작!`);
  });
}

/**
 * 레벨 메시지 표시
 */
function showLevelMessage(message) {
  const gameArea = document.getElementById("game-area");

  // 기존 메시지 제거
  const existingMsg = gameArea.querySelector(".level-message");
  if (existingMsg) {
    existingMsg.remove();
  }

  // 메시지 엘리먼트 생성
  const messageDiv = document.createElement("div");
  messageDiv.className = "level-message";
  messageDiv.textContent = message;
  gameArea.appendChild(messageDiv);

  // 1초 후 페이드아웃
  setTimeout(() => {
    messageDiv.classList.add("fade-out");
    setTimeout(() => {
      messageDiv.remove();
    }, 500);
  }, 1000);
}

/**
 * 아이템 화면 표시 업데이트
 */
function updateItemsDisplay(items) {
  const gameArea = document.getElementById("game-area");

  // 기존 아이템 요소 제거
  const existingItems = gameArea.querySelectorAll(".item");
  existingItems.forEach(item => item.remove());

  // 새 아이템 요소 생성
  items.forEach(item => {
    const itemElement = document.createElement("div");
    itemElement.className = `item zone-${item.zone.toLowerCase()}`;
    itemElement.textContent = item.icon;
    itemElement.style.top = `${item.position}%`;
    gameArea.appendChild(itemElement);
  });
}

/**
 * 예측 결과 처리 콜백
 */
function handlePrediction(predictions, pose) {
  // 1. Stabilizer로 예측 안정화
  const stabilized = stabilizer.stabilize(predictions);

  // 2. 현재 포즈 표시
  const currentPose = document.getElementById("current-pose");
  currentPose.textContent = stabilized.className || "감지 중...";

  // 3. GameEngine에 포즈 전달
  if (gameEngine && gameEngine.isGameActive && stabilized.className) {
    gameEngine.onPoseDetected(stabilized.className);
  }
}

/**
 * 포즈 그리기 콜백
 */
function drawPose(pose) {
  if (poseEngine.webcam && poseEngine.webcam.canvas) {
    ctx.drawImage(poseEngine.webcam.canvas, 0, 0);

    // 키포인트와 스켈레톤 그리기
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}
