# Catch Zone - 포즈 인식 게임

Teachable Machine 포즈 모델을 활용한 **Catch Zone** 게임입니다. 포즈로 바구니를 움직여 떨어지는 과일을 받고, 폭탄을 피하세요!

## 🎮 게임 소개

**Catch Zone**는 포즈 인식 기술을 활용한 인터랙티브 게임입니다. 플레이어는 자신의 몸 또는 얼굴 움직임으로 게임 속 바구니를 제어하여 과일을 수집하고, 폭탄을 피해야 합니다.

### 게임 방법

- **왼쪽/가운데/오른쪽 포즈**로 바구니 위치 제어
- **과일(🍎🍐🍊)** 받으면 점수 획득
- **폭탄(💣)** 받으면 즉시 게임 오버
- **과일을 2번 놓치면** 게임 오버
- **레벨이 오를수록** 낙하 속도 증가

### 점수 체계

| 아이템 | 점수 |
|--------|------|
| 사과 🍎 | +100점 |
| 배 🍐 | +150점 |
| 오렌지 🍊 | +200점 |
| 폭탄 💣 | 게임 오버 |

### 레벨 시스템

- 각 레벨은 **20초** 진행
- 레벨이 오를수록 아이템 낙하 속도 증가
- 1단계: 2.0초 낙하 → 2단계: 1.8초 → 3단계: 1.6초...
- 단계마다 0.2초씩 빨라짐

## 🚀 플레이하기

### 온라인 플레이

👉 **[GitHub Pages에서 바로 플레이](https://idealbong.github.io/tm-pose-catchzone/)**

### 로컬에서 실행

브라우저 보안 정책으로 인해 로컬 웹 서버가 필요합니다.

**Python 사용:**
```bash
python3 -m http.server 8000
```

**Node.js 사용:**
```bash
npx http-server -p 8000
```

**VS Code 사용:**
- Live Server 확장 프로그램 설치
- index.html 우클릭 → "Open with Live Server"

브라우저에서 `http://localhost:8000` 접속

## 🛠 기술 스택

- **TensorFlow.js** 1.3.1 - 머신러닝 모델 실행
- **Teachable Machine Pose** 0.8 - 포즈 인식
- **Vanilla JavaScript** - 게임 로직
- **HTML5 Canvas** - 웹캠 및 포즈 시각화

## 📁 프로젝트 구조

```
tm-pose-catchzone/
├── index.html              # 게임 UI 및 레이아웃
├── css/
│   └── style.css          # 게임 스타일 및 애니메이션
├── js/
│   ├── main.js            # 애플리케이션 진입점
│   ├── poseEngine.js      # 포즈 인식 엔진
│   ├── gameEngine.js      # Catch Zone 게임 로직
│   └── stabilizer.js      # 예측 안정화
├── my_model/              # Teachable Machine 모델 파일
│   ├── model.json         # 포즈 모델 구조
│   ├── metadata.json      # 모델 메타데이터
│   └── weights.bin        # 학습된 가중치
├── GAME_RULE.md           # 게임 규칙 상세 문서
└── README.md
```

## 🎯 포즈 모델

이 게임은 **3가지 포즈**를 인식합니다:

| 포즈 | 설명 | 게임 내 동작 |
|------|------|------------|
| 왼쪽 | 몸/얼굴을 왼쪽으로 | 바구니가 LEFT 구역으로 이동 👈 |
| 가운데 | 정면을 바라봄 | 바구니가 CENTER 구역에 위치 😊 |
| 오른쪽 | 몸/얼굴을 오른쪽으로 | 바구니가 RIGHT 구역으로 이동 👉 |

## 💡 나만의 게임 만들기

이 템플릿을 활용하여 자신만의 포즈 인식 게임을 만들 수 있습니다!

### Step 1: 게임 규칙 설계

[GAME_RULE.md](GAME_RULE.md) 파일을 수정하여 게임 규칙을 정의하세요.

- 게임 제목과 설명
- 필요한 포즈 목록
- 점수 체계
- 시간 설정
- 게임 오버 조건

### Step 2: Teachable Machine 모델 학습

1. [Teachable Machine](https://teachablemachine.withgoogle.com/) 접속
2. "Pose Project" 선택
3. GAME_RULE.md에 정의한 포즈들을 학습
4. 각 포즈당 50개 이상 샘플 수집 권장
5. 모델 학습 후 다운로드
6. `my_model/` 폴더에 파일 배치

### Step 3: 게임 로직 구현

**AI 코딩 도구 활용 (권장):**

Claude Code, Cursor 등을 사용하면 쉽게 구현 가능합니다:

```
"GAME_RULE.md 파일을 읽고, 정의된 게임 규칙대로
js/gameEngine.js와 js/main.js를 수정해줘."
```

**직접 코딩:**

- `js/gameEngine.js`: 게임 로직 수정
- `js/main.js`: UI 연동
- `index.html`: 게임 화면 구성
- `css/style.css`: 스타일 적용

### Step 4: 배포

1. GitHub 저장소에 push
2. Settings → Pages 활성화
3. 전 세계 누구나 플레이 가능!

## 🎓 교육 활용

이 프로젝트는 다음과 같은 학습에 활용할 수 있습니다:

- ✅ 머신러닝/AI 기초 (Teachable Machine)
- ✅ 포즈 인식 기술 이해
- ✅ JavaScript 게임 개발
- ✅ HTML/CSS UI 설계
- ✅ Git/GitHub 버전 관리
- ✅ GitHub Pages 배포

## 📝 게임 규칙 상세

전체 게임 규칙은 [GAME_RULE.md](GAME_RULE.md)를 참고하세요.

## 👨‍💻 만든 사람

**Sangbong Lee**
- Email: idealbong@gmail.com
- GitHub: [@idealbong](https://github.com/idealbong)

## 📝 라이선스

이 프로젝트는 교육 목적으로 자유롭게 사용 가능합니다.

---

## 🎮 즐거운 게임 되세요!

포즈로 바구니를 움직여 과일을 받고, 폭탄을 피해보세요! 🍎🍐🍊
