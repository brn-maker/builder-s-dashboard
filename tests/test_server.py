import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server


class AgentAPITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory()
        server.LOG_FILE = Path(cls.temp_dir.name) / "agent_logs.json"
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.AgentAPIHandler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.httpd.server_address[1]}"

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=2)
        cls.temp_dir.cleanup()

    def post_json(self, payload, content_type="application/json"):
        request = Request(
            self.base_url + "/api/agent",
            data=payload if isinstance(payload, bytes) else json.dumps(payload).encode(),
            headers={"Content-Type": content_type},
            method="POST",
        )
        try:
            return urlopen(request, timeout=2)
        except HTTPError as error:
            return error

    def test_accepts_valid_event_and_returns_created(self):
        response = self.post_json({
            "agent": "test-agent",
            "message": "Tests passed",
            "status": "success",
        })
        self.assertEqual(response.status, 201)
        body = json.loads(response.read())
        self.assertEqual(body["entry"]["agent"], "test-agent")
        self.assertEqual(body["entry"]["status"], "success")

    def test_rejects_invalid_status(self):
        response = self.post_json({"agent": "x", "message": "y", "status": "root"})
        self.assertEqual(response.status, 400)

    def test_rejects_non_object_json(self):
        response = self.post_json(["not", "an", "object"])
        self.assertEqual(response.status, 400)

    def test_rejects_wrong_content_type(self):
        response = self.post_json({"agent": "x"}, content_type="text/plain")
        self.assertEqual(response.status, 415)

    def test_activity_endpoint_returns_saved_events(self):
        self.post_json({"agent": "reader-test", "message": "hello", "status": "info"})
        with urlopen(self.base_url + "/api/agent", timeout=2) as response:
            logs = json.loads(response.read())
        self.assertTrue(any(item["agent"] == "reader-test" for item in logs))


if __name__ == "__main__":
    unittest.main()
