/**
 * gameEngine.js
 * Catch Zone 게임 로직 전체를 담당
 *
 * - 3개 구역(LEFT, CENTER, RIGHT)에서 아이템이 떨어짐
 * - 바구니 위치를 포즈로 제어하여 과일 수집, 폭탄 회피
 * - 과일 2번 놓치면 게임 오버, 폭탄 받으면 즉시 게임 오버
 * - 단계별로 낙하 속도 증가
 */

class GameEngine {
  constructor() {
    // 게임 상태
    this.isGameActive = false;
    this.score = 0;
    this.currentLevel = 1;
    this.missCount = 0;
    this.basketZone = 'CENTER'; // LEFT, CENTER, RIGHT
    this.gameOverReason = null; // 게임 오버 원인

    // 아이템 관리
    this.items = []; // 떨어지는 아이템 배열
    this.itemTypes = [
      { type: 'apple', score: 100, icon: '🍎' },
      { type: 'pear', score: 150, icon: '🍐' },
      { type: 'orange', score: 200, icon: '🍊' },
      { type: 'bomb', score: 0, icon: '💣' }
    ];

    // 타이머
    this.levelTimer = null;
    this.itemSpawnTimer = null;
    this.animationFrameId = null;
    this.levelTimeRemaining = 20; // 각 단계 20초

    // 콜백
    this.onScoreChange = null;
    this.onLevelChange = null;
    this.onMissCountChange = null;
    this.onGameEnd = null;
    this.onBasketMove = null;
    this.onItemUpdate = null;
  }

  /**
   * 게임 시작
   */
  start() {
    this.isGameActive = true;
    this.score = 0;
    this.currentLevel = 1;
    this.missCount = 0;
    this.basketZone = 'CENTER';
    this.items = [];
    this.levelTimeRemaining = 20;

    // UI 업데이트
    this.notifyScoreChange();
    this.notifyLevelChange();
    this.notifyMissCountChange();
    this.notifyBasketMove();

    // 레벨 타이머 시작
    this.startLevelTimer();

    // 아이템 생성 시작
    this.startItemSpawning();

    // 아이템 업데이트 루프 시작
    this.startItemUpdateLoop();
  }

  /**
   * 게임 중지
   */
  stop() {
    this.isGameActive = false;
    this.clearAllTimers();

    if (this.onGameEnd) {
      this.onGameEnd(this.score, this.currentLevel);
    }
  }

  /**
   * 레벨 타이머 시작
   */
  startLevelTimer() {
    this.levelTimer = setInterval(() => {
      this.levelTimeRemaining--;

      // 레벨 종료 - 다음 레벨로
      if (this.levelTimeRemaining <= 0) {
        this.levelUp();
      }
    }, 1000);
  }

  /**
   * 레벨업
   */
  levelUp() {
    this.currentLevel++;
    this.levelTimeRemaining = 20;
    this.notifyLevelChange();

    // 아이템 생성 속도 재설정
    this.stopItemSpawning();
    this.startItemSpawning();
  }

  /**
   * 아이템 생성 시작
   */
  startItemSpawning() {
    const dropTime = this.getDropTime();
    const minInterval = dropTime * 0.6 * 1000;
    const maxInterval = dropTime * 0.8 * 1000;

    const spawnItem = () => {
      if (!this.isGameActive) return;

      // 랜덤 구역 선택
      const zones = ['LEFT', 'CENTER', 'RIGHT'];
      const zone = zones[Math.floor(Math.random() * zones.length)];

      // 랜덤 아이템 선택 (폭탄 출현 빈도 10%)
      let itemType;
      const rand = Math.random();
      if (rand < 0.1) {
        itemType = this.itemTypes[3]; // bomb
      } else {
        const fruitIndex = Math.floor(Math.random() * 3);
        itemType = this.itemTypes[fruitIndex];
      }

      // 아이템 생성
      const item = {
        id: Date.now() + Math.random(),
        type: itemType.type,
        score: itemType.score,
        icon: itemType.icon,
        zone: zone,
        position: 0, // 0% (상단) ~ 100% (하단)
        dropTime: dropTime,
        isFruit: itemType.type !== 'bomb'
      };

      this.items.push(item);

      // 다음 아이템 생성 스케줄
      const nextInterval = minInterval + Math.random() * (maxInterval - minInterval);
      this.itemSpawnTimer = setTimeout(spawnItem, nextInterval);
    };

    // 첫 아이템 즉시 생성
    spawnItem();
  }

  /**
   * 아이템 생성 중지
   */
  stopItemSpawning() {
    if (this.itemSpawnTimer) {
      clearTimeout(this.itemSpawnTimer);
      this.itemSpawnTimer = null;
    }
  }

  /**
   * 아이템 업데이트 루프
   */
  startItemUpdateLoop() {
    let lastTime = Date.now();

    const update = () => {
      if (!this.isGameActive) return;

      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // 초 단위
      lastTime = now;

      // 각 아이템 위치 업데이트
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];

        // 위치 증가 (초당 100% / dropTime)
        item.position += (100 / item.dropTime) * deltaTime;

        // 바구니 위치 도달 (85% 이상) - 충돌 감지 영역
        if (item.position >= 85 && !item.caught) {
          if (this.checkCollision(item)) {
            // 바구니와 충돌 - 즉시 수집
            this.handleItemCatch(item);
            item.caught = true; // 처리됨 표시
            this.items.splice(i, 1); // 아이템 즉시 제거
            continue;
          }
        }

        // 화면 하단 도달 (100% 이상) - 놓침 처리
        if (item.position >= 100) {
          if (!item.caught) {
            this.handleItemMiss(item);
          }
          // 아이템 제거
          this.items.splice(i, 1);
        }
      }

      // UI 업데이트
      this.notifyItemUpdate();

      // 다음 프레임 요청
      this.animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  /**
   * 충돌 감지
   */
  checkCollision(item) {
    return item.zone === this.basketZone;
  }

  /**
   * 아이템 획득 처리
   */
  handleItemCatch(item) {
    if (item.type === 'bomb') {
      // 폭탄 받음 - 즉시 게임 오버
      this.gameOver('bomb');
    } else {
      // 과일 획득 - 점수 추가
      this.score += item.score;
      this.notifyScoreChange();
    }
  }

  /**
   * 아이템 놓침 처리
   */
  handleItemMiss(item) {
    if (item.isFruit) {
      // 과일 놓침 - 미스 카운트 증가
      this.missCount++;
      this.notifyMissCountChange();

      if (this.missCount >= 2) {
        // 과일 2번 놓침 - 게임 오버
        this.gameOver('miss');
      }
    }
    // 폭탄 놓침은 카운트 안함 (회피 성공)
  }

  /**
   * 게임 오버
   * @param {string} reason - 게임 오버 원인 ('bomb' 또는 'miss')
   */
  gameOver(reason) {
    this.gameOverReason = reason;
    this.stop();
  }

  /**
   * 포즈 인식 결과 처리
   * @param {string} detectedPose - 인식된 포즈 이름
   */
  onPoseDetected(detectedPose) {
    if (!this.isGameActive) return;

    // 포즈에 따라 바구니 위치 변경
    let newZone = this.basketZone;

    const poseLower = detectedPose.toLowerCase();
    if (poseLower.includes('left') || poseLower.includes('왼쪽')) {
      newZone = 'LEFT';
    } else if (poseLower.includes('right') || poseLower.includes('오른쪽')) {
      newZone = 'RIGHT';
    } else if (poseLower.includes('center') || poseLower.includes('가운데')) {
      newZone = 'CENTER';
    }

    if (newZone !== this.basketZone) {
      this.basketZone = newZone;
      this.notifyBasketMove();
    }
  }

  /**
   * 단계별 낙하 시간 계산
   */
  getDropTime() {
    const baseDropTime = 2.0; // 1단계 2초
    const decreasePerLevel = 0.2;
    const minDropTime = 0.6;

    const dropTime = baseDropTime - (this.currentLevel - 1) * decreasePerLevel;
    return Math.max(dropTime, minDropTime);
  }

  /**
   * 타이머 정리
   */
  clearAllTimers() {
    if (this.levelTimer) {
      clearInterval(this.levelTimer);
      this.levelTimer = null;
    }

    if (this.itemSpawnTimer) {
      clearTimeout(this.itemSpawnTimer);
      this.itemSpawnTimer = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // === 콜백 알림 ===

  notifyScoreChange() {
    if (this.onScoreChange) {
      this.onScoreChange(this.score);
    }
  }

  notifyLevelChange() {
    if (this.onLevelChange) {
      this.onLevelChange(this.currentLevel, this.levelTimeRemaining);
    }
  }

  notifyMissCountChange() {
    if (this.onMissCountChange) {
      this.onMissCountChange(this.missCount);
    }
  }

  notifyBasketMove() {
    if (this.onBasketMove) {
      this.onBasketMove(this.basketZone);
    }
  }

  notifyItemUpdate() {
    if (this.onItemUpdate) {
      this.onItemUpdate(this.items);
    }
  }

  // === 콜백 등록 ===

  setScoreChangeCallback(callback) {
    this.onScoreChange = callback;
  }

  setLevelChangeCallback(callback) {
    this.onLevelChange = callback;
  }

  setMissCountChangeCallback(callback) {
    this.onMissCountChange = callback;
  }

  setBasketMoveCallback(callback) {
    this.onBasketMove = callback;
  }

  setItemUpdateCallback(callback) {
    this.onItemUpdate = callback;
  }

  setGameEndCallback(callback) {
    this.onGameEnd = callback;
  }

  /**
   * 현재 게임 상태 반환
   */
  getGameState() {
    return {
      isActive: this.isGameActive,
      score: this.score,
      level: this.currentLevel,
      missCount: this.missCount,
      levelTimeRemaining: this.levelTimeRemaining,
      basketZone: this.basketZone,
      items: this.items
    };
  }
}

// 전역으로 내보내기
window.GameEngine = GameEngine;
