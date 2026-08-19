# 오늘 뭐 볼까?

사용자의 기분, 취향, 최근 관심사를 바탕으로 영화를 추천하고 국내 OTT 정보, 예고편, 스포일러 없는 줄거리를 제공하기 위한 웹서비스입니다.

현재 버전은 서비스의 정적 화면과 Vercel Python Serverless Function의 기본 구조를 구현한 초기 단계입니다. 실제 AI 및 영화 정보 API는 아직 연결하지 않았습니다.

## 기술 스택

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Vercel Python Serverless Functions
- Deployment: Vercel

## 프로젝트 구조

```text
.
├── index.html
├── css/style.css
├── js/app.js
├── api/recommend.py
├── images/
├── requirements.txt
├── .gitignore
└── README.md
```

## 로컬에서 확인하기

정적 화면은 프로젝트 루트에서 간단한 HTTP 서버를 실행해 확인할 수 있습니다.

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 여세요. 이 방법은 정적 프론트엔드 확인용이며 `/api/recommend`는 실행하지 않습니다.

프론트엔드와 Serverless Function을 함께 확인하려면 Vercel CLI를 설치한 환경에서 아래 명령을 사용합니다.

```bash
vercel dev
```

## API 테스트 응답

- `GET /api/recommend`: API 준비 상태 JSON 반환
- `POST /api/recommend`: 빈 추천 목록을 포함한 테스트 JSON 반환

API 키는 소스 코드에 넣지 않고, 추후 Vercel 환경 변수 또는 로컬 `.env`로 관리합니다.

## 다음 단계

1. 프론트엔드 폼과 `/api/recommend` 연결
2. AI 추천 API 연동 및 응답 형식 설계
3. TMDB 기반 영화 상세 정보와 포스터 연결
4. 대한민국 OTT 제공 정보 및 예고편 연결
5. 추천 결과용 영화 티켓 카드 구현
