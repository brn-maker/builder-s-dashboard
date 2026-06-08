import http.server
import socketserver
import json
import os
import datetime

PORT = 8080
LOG_FILE = 'agent_logs.json'

class AgentAPIHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/agent':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            if os.path.exists(LOG_FILE):
                with open(LOG_FILE, 'r') as f:
                    self.wfile.write(f.read().encode())
            else:
                self.wfile.write(b'[]')
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/agent':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                
                # Load existing logs
                logs = []
                if os.path.exists(LOG_FILE):
                    try:
                        with open(LOG_FILE, 'r') as f:
                            logs = json.load(f)
                    except json.JSONDecodeError:
                        logs = []

                # Add new entry
                entry = {
                    "id": len(logs) + 1,
                    "agent": data.get("agent", "Unknown Agent"),
                    "message": data.get("message", "No message provided"),
                    "status": data.get("status", "info"),
                    "timestamp": datetime.datetime.now().isoformat()
                }
                logs.append(entry)
                
                # Keep only the last 50 logs to prevent file bloat
                if len(logs) > 50:
                    logs = logs[-50:]

                # Save back to file
                with open(LOG_FILE, 'w') as f:
                    json.dump(logs, f, indent=4)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "entry": entry}).encode())

            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())
        else:
            self.send_error(404, "Not Found")

with socketserver.TCPServer(("", PORT), AgentAPIHandler) as httpd:
    print(f"Serving at port {PORT}. API endpoint at /api/agent")
    httpd.serve_forever()
