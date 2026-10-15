# Security Policy

## Scope

Builder's Dashboard is an early-stage local-first project. The Python server accepts activity events and serves the dashboard. It is not designed to be exposed to the public internet.

## Safe use

- Keep the server bound to loopback (`127.0.0.1`).
- Do not port-forward the server or expose port 8080 to an untrusted network.
- Do not send credentials, API keys, private user data, or source files as event messages.
- Review the code before connecting it to sensitive development workflows.

## Reporting a vulnerability

Please do not publish exploitable details in a public issue. Contact the repository owner privately through GitHub's profile/contact options and include the affected file, impact, and reproduction steps. Do not include secrets belonging to you or others.

This project does not currently offer a formal response-time guarantee.
