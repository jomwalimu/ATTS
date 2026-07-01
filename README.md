# AI 활용 교사 연수 웹페이지

매주 진행하는 AI 연수 내용을 회차별로 정리해서 공유하는 정적 웹사이트입니다.
GitHub Pages로 바로 배포할 수 있습니다.

---

## 폴더 구조

```
├── index.html                 ← 절대 수정할 필요 없음
├── assets/
│   ├── css/style.css          ← 절대 수정할 필요 없음
│   └── js/app.js              ← 절대 수정할 필요 없음
├── data/
│   └── manifest.json          ← 새 회차 등록할 때만 한 줄 추가
└── rounds/
    ├── _template/
    │   └── content.json       ← 새 회차 만들 때 복사해서 쓰는 템플릿
    ├── round01/
    │   └── content.json       ← 1회차 내용 (이 파일만 수정하면 됨)
    └── round02/
        └── content.json       ← 2회차 내용 (이 파일만 수정하면 됨)
```

**평소에 수정할 파일은 각 회차 폴더 안의 `content.json` 하나뿐입니다.**

---

## 매달(매회차) 새 내용 올리는 방법

1. `rounds/_template/` 폴더를 통째로 복사해서 `rounds/round03/` 처럼 새 이름으로 붙여넣습니다.
2. 새로 만든 폴더 안의 `content.json`을 열어 아래 항목을 채웁니다.
   - `round`: 회차 번호 (숫자, 예: 3)
   - `title`: 회차 제목
   - `date`: 날짜 (예: "2026-07-22")
   - `summary`: 핵심 포인트 목록 (문장을 배열로, 원하는 만큼 추가/삭제 가능)
   - `practice`: 실습·프롬프트 샘플 목록. 항목이 필요 없으면 빈 배열 `[]`로 두면 됩니다.
     - `title`: 실습 이름
     - `description`: 실습 설명 (선택)
     - `content`: 복사해서 쓸 프롬프트나 코드 (줄바꿈은 그대로 입력하면 됩니다)
   - `references`: 참고 링크 목록. 필요 없으면 `[]`
     - `label`: 링크 이름, `url`: 실제 주소
   - `nextPreview`: 다음 회차 예고 문구
3. `data/manifest.json`을 열어 `rounds` 배열 맨 아래에 한 줄을 추가합니다.
   ```json
   { "id": "round03", "folder": "rounds/round03" }
   ```
4. 변경한 파일들을 GitHub에 커밋 & 푸시하면 자동으로 사이트에 반영됩니다.

> content.json은 JSON 형식이라 문장 끝에 쉼표(,)를 빠뜨리거나 마지막 항목 뒤에 쉼표를 남기면 오류가 납니다. 수정 후에는 아래 "내용 확인하기"로 한 번 열어보고 화면이 정상적으로 뜨는지 확인하세요.

---

## GitHub Pages로 배포하기

1. GitHub에 새 저장소를 만들고 이 폴더 전체를 업로드(푸시)합니다.
2. 저장소의 **Settings → Pages**로 이동합니다.
3. **Source**를 `Deploy from a branch`로 설정하고, 브랜치는 `main`(또는 사용 중인 기본 브랜치), 폴더는 `/ (root)`로 선택 후 저장합니다.
4. 몇 분 후 `https://[사용자명].github.io/[저장소명]/` 주소로 접속하면 사이트가 열립니다.
5. 이후로는 `rounds/round0N/content.json` 파일과 `manifest.json`만 수정해서 커밋하면 자동으로 사이트가 업데이트됩니다.

---

## 내용 확인하기 (로컬에서 미리보기)

이 사이트는 `fetch`로 JSON 파일을 불러오기 때문에, 파일 탐색기에서 `index.html`을 그냥 더블클릭하면 내용이 뜨지 않을 수 있습니다(브라우저 보안 정책 때문). 아래처럼 간단한 로컬 서버를 켜서 확인하세요.

- 이 폴더에서 터미널을 열고 `python3 -m http.server 8000` 실행 후, 브라우저에서 `http://localhost:8000` 접속
- 또는 GitHub Pages에 올린 뒤 실제 주소로 바로 확인해도 됩니다.

---

## 자주 하는 실수

- `content.json` 안에서 큰따옴표(")를 실수로 지우거나, 항목 사이 쉼표를 빠뜨리는 경우가 가장 흔합니다.
- 새 회차를 추가했는데 목록에 안 보인다면 → `manifest.json`에 등록을 안 했을 가능성이 큽니다.
- 링크가 안 열린다면 → `url` 값이 `https://`로 시작하는지 확인하세요.
