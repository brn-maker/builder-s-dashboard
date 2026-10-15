# Builder's Dashboard ⚡

**A local-first command center for people building with AI.** Track projects, daily priorities, shipping streaks, focus sessions, ideas, and activity reported by your AI coding agents.

Builder's Dashboard is an early-stage open-source project. Today, its agent integration accepts activity events over a small local HTTP API and displays them in the dashboard. It does **not** orchestrate agents, assign tasks, or verify their work.

- **Local-first:** personal dashboard data is stored in your browser's `localStorage`.
- **Lightweight:** plain HTML, CSS, JavaScript, and Python; no frontend build step.
- **Agent-friendly:** any tool that can send an HTTP POST can report an event.
- **Open source:** MIT licensed.

## What it includes

- **Daily focus** — keep today's priorities visible.
- **Project tracker** — move projects through ideating, building, and shipped.
- **Build streak** — track days you mark as shipped.
- **Focus timer** — built-in Pomodoro-style timer.
- **Ship log** — record what you accomplished.
- **Ideas backlog** — capture ideas and promote them into projects.
- **Agent activity feed** — view recent agent messages reported to the local API.

## Quick start

### Requirements

- Python 3.8 or newer
- A modern browser

No Python packages need to be installed.

1. Clone the repository:

   ```bash
   git clone https://github.com/brn-maker/builder-s-dashboard.git
   cd builder-s-dashboard
   ```

2. Start the local server:

   ```bash
   python3 server.py
   ```

3. Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

Keep the terminal open while using the dashboard. Stop the server with `Ctrl+C`.

> Opening `index.html` directly can show the dashboard's browser-only features, but the agent activity feed requires the Python server.

## Send a test agent event

With the server running, open another terminal and run:

```bash
curl -X POST http://127.0.0.1:8080/api/agent \
  -H 'Content-Type: application/json' \
  -d '{
    "agent": "demo-agent",
    "message": "Finished the first dashboard integration",
    "status": "success"
  }'
```

Refresh or wait a moment for the event to appear in the activity feed.

Supported statuses: `info`, `working`, `success`, and `error`.

### Python example (standard library only)

```python
import json
from urllib.request import Request, urlopen

def report_to_dashboard(agent, message, status="info"):
    payload = json.dumps({
        "agent": agent,
        "message": message,
        "status": status,
    }).encode("utf-8")

    request = Request(
        "http://127.0.0.1:8080/api/agent",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=2) as response:
            return response.status == 200
    except OSError:
        # The dashboard may not be running; don't fail the agent task.
        return False
```

### Connect a coding agent

Configure your agent or workflow to send a POST request to `http://127.0.0.1:8080/api/agent` after a meaningful event. For example, an agent can report a completed task, a failed test, or a commit. Keep messages short and avoid sending secrets, credentials, private user data, or full source files.

This is a simple event-reporting endpoint, not a native integration with every coding agent. The exact setup depends on the agent and its hooks or automation features.

## Privacy and security

- The server binds to `127.0.0.1` by default so it is reachable only from the same machine.
- Agent activity is stored in `agent_logs.json` in the project directory; the latest 50 events are retained.
- Personal dashboard data is stored separately in browser `localStorage`.
- Do not expose this server to the public internet or bind it to a network interface you do not trust.
- Events may contain project details. Review what your agent sends before enabling automated reporting.
- This project is an early-stage tool; review the code and report security concerns before using it with sensitive workflows.

See [SECURITY.md](SECURITY.md) for reporting guidance.

## Roadmap

The roadmap is intentionally shaped by user feedback. Possible next steps:

- [ ] Add a short demo video and clearer screenshots.
- [ ] Add automated tests for the agent API.
- [ ] Improve project-aware event grouping and filtering.
- [ ] Explore a daily summary of reported work.
- [ ] Document community-maintained agent adapters.

These are ideas, not promises or existing features. Please open an issue to describe your workflow and the problem you want solved.

## Contributing

Bug reports, documentation improvements, feature ideas, and small pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

For useful feedback, please include your operating system, Python version, steps to reproduce, and what you expected to happen. Never include API keys or other secrets in an issue.

## License

MIT. See [LICENSE](LICENSE).
