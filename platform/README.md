# Glaw Platform — Unified Legal Intelligence Platform

This folder connects both projects (LCET + AI Lawyer) into one unified product.

## Architecture

```
Glaw/
├── AI Laywer/          → Backend runs on port 8001 (contract analysis)
├── legal_new copy/     → Backend runs on port 8000 (legal intelligence)
└── platform/           → THIS FOLDER
    ├── gateway/        → API gateway that proxies both backends
    ├── frontend/       → Unified frontend (to be built)
    └── start.sh        → Single command to start everything
```

## How It Works

- `gateway/` is a lightweight FastAPI app that acts as a single entry point
- It proxies requests to the correct backend based on the route prefix
- The unified frontend only talks to the gateway (one URL, one port)
- Both original projects remain untouched

## Ports

| Service | Port |
|---------|------|
| LCET Backend | 8000 |
| AI Lawyer Backend | 8001 |
| Gateway (unified API) | 9000 |
| Unified Frontend | 3001 |

## Running

```bash
./start.sh          # Start everything
./start.sh stop     # Stop everything
```
