from http.server import BaseHTTPRequestHandler
import json


class handler(BaseHTTPRequestHandler):
    """Vercel Python Serverless Function의 최소 테스트 핸들러."""

    def _send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._send_json(200, {"ok": True, "message": "추천 API가 준비되었습니다."})

    def do_POST(self):
        content_length = self.headers.get("Content-Length")

        try:
            content_length = int(content_length)
            if content_length <= 0:
                raise ValueError
        except (TypeError, ValueError):
            self._send_json(400, {"ok": False, "message": "요청 내용이 비어 있습니다."})
            return

        try:
            body = self.rfile.read(content_length)
            received = json.loads(body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(
                400,
                {"ok": False, "message": "요청 형식이 올바르지 않습니다. 입력 내용을 확인해 주세요."},
            )
            return

        if not isinstance(received, dict):
            self._send_json(400, {"ok": False, "message": "입력 내용을 올바른 형식으로 보내 주세요."})
            return

        mood = received.get("mood")
        genres = received.get("genres")
        companion = received.get("companion")
        atmosphere = received.get("atmosphere")
        if (
            not isinstance(mood, str)
            or not mood.strip()
            or not isinstance(genres, list)
            or not genres
            or not isinstance(companion, str)
            or not companion.strip()
            or not isinstance(atmosphere, str)
            or not atmosphere.strip()
        ):
            self._send_json(
                400,
                {
                    "ok": False,
                    "message": "현재 기분, 선호 장르, 함께 보는 사람과 원하는 분위기를 모두 입력해 주세요.",
                },
            )
            return

        self._send_json(
            200,
            {
                "ok": True,
                "message": "추천 요청이 정상적으로 전달되었습니다.",
                "received": received,
                "recommendations": [],
            },
        )
