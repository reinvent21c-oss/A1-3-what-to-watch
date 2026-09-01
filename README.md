# 오늘 뭐 볼까?

사용자가 현재 기분, 선호 장르, 함께 보는 사람, 원하는 분위기, 최근 관심사와 선택적 MBTI를 입력하면 AI가 조건을 종합해 영화 3편을 추천하는 웹 서비스입니다. 추천 결과에 실제 영화 정보를 보강하고, 대한민국 기준으로 확인 가능한 시청처를 영화 티켓 형태의 UI로 보여줍니다.

- Production: [https://a1-3-what-to-watch.vercel.app/](https://a1-3-what-to-watch.vercel.app/)

## 프로젝트 문서

- [서비스 기획서](./SERVICE_PLAN.md)
- [평가용 증빙 자료](./docs/evidence/)

## 주요 기능

### 취향 기반 영화 추천

- 현재 기분, 선호 장르, 함께 보는 사람, 원하는 분위기, 최근 관심사, MBTI를 받는 입력 폼
- Gemini API를 이용한 정확히 3편의 영화 추천
- Structured Output JSON Schema를 통한 응답 형식 제한
- 추천 결과에 한국 영화(`country: KR`) 최소 1편 포함 검증
- 표시 제목 기준 중복 검증과 프롬프트 기반 동일 작품 중복 방지
- `release_date`의 `YYYY-MM-DD` 형식 및 `release_year` 일치 검증
- 추천 적합도와 입력 조건에 연결된 추천 이유 표시
- 한국 영화는 `LOCAL PICK`, 해외 영화는 `GLOBAL PICK`으로 구분하는 티켓 UI

### 최근 2년 작품 우선 추천

체크박스를 선택하면 오늘 날짜를 기준으로 최근 2년 이내 개봉작을 가능한 경우 우선 고려합니다. 이 조건은 강제 조건이 아닌 **soft preference**입니다. 취향 적합도와 추천 품질을 해치면서 최근작을 억지로 포함하지 않으며, 최근 2년 작품이 없더라도 현재 3편을 정상적으로 제공합니다. 이 경우 결과 가까이에 최근작이 포함되지 않았다는 안내 메시지를 표시합니다.

### 영화 정보 보강과 시청처

- Movie of the Night API의 대한민국(`KR`) 데이터를 이용한 영화 매칭 및 정보 보강
- 제목·원제와 개봉 연도를 함께 확인하는 strict matching
- 포스터, 장르, 줄거리(`overview`), 대한민국 기준 시청처 데이터 보강
- 현재 티켓 UI에는 포스터, 장르와 확인 가능한 시청처를 표시하며, 포스터가 없거나 로딩에 실패하면 대체 영역 표시
- 구독, 대여, 구매, 무료, 추가 채널 등 시청 옵션 구분
- MOTN에서 영화 매칭에 실패하면 기존 작품을 제외하고 전체 추천 세트를 최대 1회 replacement

### 안정성과 사용자 경험

- Gemini 응답이 형식·추천 규칙 검증을 통과하지 못할 때 1회 validation retry
- Gemini `429 RESOURCE_EXHAUSTED` 발생 시 2초, 4초 순서의 backoff 재시도
- 추천 준비 경과 시간, 단계별 상태 메시지와 indeterminate progress를 제공하는 loading UX
- 데스크톱·모바일 반응형 레이아웃과 `prefers-reduced-motion` 대응
- 외부 시청처·로고 URL을 HTTP/HTTPS로 제한하고 새 탭 링크에 `noopener noreferrer` 적용
- skip link, `aria-live`, `aria-busy`, 화면 리더 전용 상태 메시지 등 접근성 처리

## 기술 스택

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Python, Vercel Python Serverless Function
- AI: Gemini API (`google-genai`)
- Movie data: Movie of the Night API
- Environment loading: `python-dotenv`
- Version control / deployment: Git, GitHub, Vercel

## 서비스 흐름

```text
사용자 입력
  → Vanilla JavaScript
  → POST /api/recommend
  → Gemini 영화 3편 추천
  → Structured Output 및 추천 규칙 검증
  → Movie of the Night 영화 정보 보강
  → JSON 응답
  → 프론트엔드 티켓 카드 렌더링
```

MOTN 영화 매칭이 실패하면 기존 추천을 제외한 replacement 세트를 한 번 생성한 뒤 다시 보강합니다. 최근 2년 작품 미포함 자체는 validation 실패나 Gemini 재호출 사유가 아닙니다.

## 프로젝트 구조

```text
.
├── api/
│   └── recommend.py       # 추천·검증·영화 정보 보강 API
├── css/
│   └── style.css          # 티켓 UI와 반응형 스타일
├── js/
│   └── app.js             # 폼 요청, loading, 결과 렌더링
├── .env.example           # 로컬 환경변수 예시
├── .gitignore
├── index.html
├── requirements.txt
└── README.md
```

별도의 `vercel.json` 없이 Vercel의 `/api` 디렉터리 기반 Python Function 구조를 사용합니다.

## 환경변수

| 이름 | 용도 |
| --- | --- |
| `GEMINI_API_KEY` | Gemini 영화 추천 요청 |
| `MOVIE_OF_THE_NIGHT_API_KEY` | 영화 정보와 대한민국 기준 시청처 조회 |

`.env.example`을 복사해 로컬 `.env`를 만들고 실제 키를 입력합니다.

```bash
cp .env.example .env
```

`.env`는 `.gitignore`에 포함되어 있으므로 Git에 커밋하지 않습니다. `.env.example`에는 예시 값만 유지합니다.

## 로컬 실행

Python 의존성을 설치합니다.

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

환경변수를 준비한 뒤, Vercel CLI가 설치된 환경에서 프론트엔드와 Serverless Function을 함께 실행합니다.

```bash
cp .env.example .env
vercel dev
```

Vercel CLI가 출력하는 로컬 주소에서 서비스를 확인합니다. `python3 -m http.server`는 정적 화면만 제공하므로 `/api/recommend`를 실행하지 않습니다.

## API

- `GET /api/recommend`: API 준비 상태 반환
- `POST /api/recommend`: 사용자 입력을 검증하고 영화 3편 추천 및 보강 결과 반환

오류 응답은 사용자용 메시지와 오류 코드를 포함하며, 프론트엔드는 loading·성공·오류 상태를 구분해 처리합니다.

## 배포

Vercel에 배포하며, `GEMINI_API_KEY`와 `MOVIE_OF_THE_NIGHT_API_KEY`는 프로젝트 환경변수로 등록해 사용합니다. 실제 키는 저장소에 포함하지 않습니다.

- Production: [https://a1-3-what-to-watch.vercel.app/](https://a1-3-what-to-watch.vercel.app/)

## 현재 한계

- 시청처는 Movie of the Night가 대한민국 기준으로 제공하는 범위만 표시할 수 있습니다. TVING, wavve, Watcha, Coupang Play 등 일부 국내 서비스는 데이터에 없을 수 있습니다.
- Movie of the Night가 제공하는 포스터를 사용하므로 한국어 포스터를 항상 보장하지 못합니다.
- 정확한 `release_date`는 Gemini 추천 데이터에 의존하고, MOTN에서는 `releaseYear` 수준으로 교차 확인합니다.
- 최근 2년 옵션은 추천 품질과 안정성을 위해 강제가 아닌 우선 추천 방식입니다.
- 외부 AI/API의 응답 시간과 rate limit 상황에 따라 추천 시간이 달라질 수 있습니다.
- MOTN의 줄거리(`overview`)는 응답에 포함되지만 현재 티켓 UI에는 별도 줄거리 영역으로 표시하지 않습니다.
