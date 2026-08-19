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
        self._send_json(
            200,
            {
                "ok": True,
                "message": "현재는 테스트 응답입니다. 실제 영화 추천은 다음 단계에서 연결합니다.",
                "recommendations": [],
            },
        )
