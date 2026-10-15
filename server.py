"""Small local HTTP server for Builder's Dashboard.

The API intentionally binds to loopback. Do not expose it to untrusted networks.
"""
import datetime
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HOST = "127.0.0.1"
PORT = 8080
LOG_FILE = Path(__file__).resolve().parent / "agent_logs.json"
MAX_BODY_BYTES = 16 * 1024
MAX_LOGS = 50
ALLOWED_STATUSES = {"info", "working", "success", "error"}
MAX_AGENT_LENGTH = 80
MAX_MESSAGE_LENGTH = 2000


class AgentAPIHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def _send_json(self, status_code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_logs(self):
        if not LOG_FILE.exists():
            return []
        try:
            with LOG_FILE.open("r", encoding="utf-8") as file:
                logs = json.load(file)
            return logs if isinstance(logs, list) else []
        except (OSError, json.JSONDecodeError):
            return []

    def do_GET(self):
        if urlparse(self.path).path == "/api/agent":
            self._send_json(200, self._read_logs())
            return
        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/agent":
            self.send_error(404, "Not Found")
            return

        content_type = self.headers.get("Content-Type", "")
        if "application/json" not in content_type.lower():
            self._send_json(415, {"status": "error", "message": "Content-Type must be application/json"})
            return

        try:
            raw_length = self.headers.get("Content-Length")
            if raw_length is None:
                self._send_json(411, {"status": "error", "message": "Content-Length is required"})
                return
            content_length = int(raw_length)
            if content_length < 0 or content_length > MAX_BODY_BYTES:
                self._send_json(413, {"status": "error", "message": "Request body is too large"})
                return
            raw_body = self.rfile.read(content_length)
            data = json.loads(raw_body.decode("utf-8"))
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {"status": "error", "message": "Invalid JSON request"})
            return

        if not isinstance(data, dict):
            self._send_json(400, {"status": "error", "message": "JSON body must be an object"})
            return

        agent = data.get("agent", "Unknown Agent")
        message = data.get("message", "No message provided")
        status = data.get("status", "info")
        if not isinstance(agent, str) or not isinstance(message, str) or not isinstance(status, str):
            self._send_json(400, {"status": "error", "message": "agent, message, and status must be strings"})
            return

        agent = agent.strip()[:MAX_AGENT_LENGTH] or "Unknown Agent"
        message = message.strip()[:MAX_MESSAGE_LENGTH] or "No message provided"
        status = status.strip().lower()
        if status not in ALLOWED_STATUSES:
            self._send_json(400, {
                "status": "error",
                "message": "status must be one of: " + ", ".join(sorted(ALLOWED_STATUSES)),
            })
            return

        logs = self._read_logs()
        entry = {
            "id": int(datetime.datetime.now().timestamp() * 1000),
            "agent": agent,
            "message": message,
            "status": status,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        logs = (logs + [entry])[-MAX_LOGS:]

        try:
            with LOG_FILE.open("w", encoding="utf-8") as file:
                json.dump(logs, file, indent=2, ensure_ascii=False)
        except OSError:
            self._send_json(500, {"status": "error", "message": "Could not save activity log"})
            return

        self._send_json(201, {"status": "success", "entry": entry})

    def log_message(self, format_string, *args):
        # Keep routine requests quiet; errors are still returned to the caller.
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), AgentAPIHandler)
    print(f"Dashboard: http://{HOST}:{PORT}")
    print(f"Agent API: http://{HOST}:{PORT}/api/agent")
    print("Local-only server. Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping dashboard server...")
    finally:
        server.server_close()
