#!/bin/bash
# ============================================
# Glaw Platform — Start All Services
# ============================================
# Starts both backends + gateway with one command.
# Usage:
#   ./start.sh        → Start everything
#   ./start.sh stop   → Stop everything
# ============================================

PLATFORM_DIR="$(cd "$(dirname "$0")" && pwd)"
GLAW_DIR="$(dirname "$PLATFORM_DIR")"
LCET_DIR="$GLAW_DIR/legal_new copy"
CONTRACT_DIR="$GLAW_DIR/AI Laywer"
LOG_DIR="$PLATFORM_DIR/logs"
mkdir -p "$LOG_DIR"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

stop_all() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    for pidfile in "$LOG_DIR"/*.pid; do
        if [ -f "$pidfile" ]; then
            kill $(cat "$pidfile") 2>/dev/null
            rm "$pidfile"
        fi
    done
    lsof -ti:8000 | xargs kill 2>/dev/null
    lsof -ti:8001 | xargs kill 2>/dev/null
    lsof -ti:9000 | xargs kill 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

if [ "$1" = "stop" ]; then
    stop_all
fi

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  Glaw Platform — Starting All Services${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Load nvm if available (needed for node/npm/npx)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Kill existing processes on our ports
lsof -ti:8000 | xargs kill 2>/dev/null
lsof -ti:8001 | xargs kill 2>/dev/null
lsof -ti:9000 | xargs kill 2>/dev/null
sleep 1

# ── 1. Start LCET Backend (port 8000) ──
echo -e "${YELLOW}[1/3] Starting LCET Backend (port 8000)...${NC}"
cd "$LCET_DIR"
python3 -m uvicorn backend.src.api.main:app --host 0.0.0.0 --port 8000 > "$LOG_DIR/lcet_backend.log" 2>&1 &
echo $! > "$LOG_DIR/lcet_backend.pid"
sleep 2
if curl -s http://localhost:8000/api/v1/concepts > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ LCET Backend running → http://localhost:8000${NC}"
else
    echo -e "${YELLOW}  ⏳ LCET Backend starting... (check logs/lcet_backend.log)${NC}"
fi

# ── 2. Start AI Lawyer Backend (port 8001) ──
echo -e "${YELLOW}[2/3] Starting AI Lawyer Backend (port 8001)...${NC}"
cd "$CONTRACT_DIR/backend"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001 > "$LOG_DIR/contract_backend.log" 2>&1 &
echo $! > "$LOG_DIR/contract_backend.pid"
sleep 2
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ AI Lawyer Backend running → http://localhost:8001${NC}"
else
    echo -e "${YELLOW}  ⏳ AI Lawyer Backend starting... (check logs/contract_backend.log)${NC}"
fi

# ── 3. Start Gateway (port 9000) ──
echo -e "${YELLOW}[3/4] Starting API Gateway (port 9000)...${NC}"
cd "$PLATFORM_DIR/gateway"
python3 -m uvicorn main:app --host 0.0.0.0 --port 9000 > "$LOG_DIR/gateway.log" 2>&1 &
echo $! > "$LOG_DIR/gateway.pid"
sleep 2
if curl -s http://localhost:9000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Gateway running → http://localhost:9000${NC}"
else
    echo -e "${YELLOW}  ⏳ Gateway starting... (check logs/gateway.log)${NC}"
fi

# ── 4. Start Unified Frontend (port 3001) ──
echo -e "${YELLOW}[4/4] Starting LexiVerse Frontend (port 3001)...${NC}"
cd "$PLATFORM_DIR/frontend"
node node_modules/next/dist/bin/next dev -p 3001 > "$LOG_DIR/frontend.log" 2>&1 &
echo $! > "$LOG_DIR/frontend.pid"
sleep 5
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Frontend running → http://localhost:3001${NC}"
else
    echo -e "${YELLOW}  ⏳ Frontend starting... (check logs/frontend.log)${NC}"
fi

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  ✅ Platform is running!${NC}"
echo -e "${CYAN}============================================${NC}"
echo -e "  Frontend:         ${GREEN}http://localhost:3001${NC}"
echo -e "  Gateway:          http://localhost:9000"
echo -e "  LCET Backend:     http://localhost:8000"
echo -e "  Contract Backend: http://localhost:8001"
echo ""
echo -e "  API Routes:"
echo -e "    ${GREEN}/api/lcet/...${NC}      → Search, Timeline, SMI, Cases, Alerts"
echo -e "    ${GREEN}/api/contract/...${NC}  → Upload, Analyze, Reports, Billing"
echo -e "    ${GREEN}/api/health${NC}        → Status of all services"
echo ""
echo -e "  Logs: $LOG_DIR/"
echo -e "  Stop: ${YELLOW}./start.sh stop${NC}"
echo -e "${CYAN}============================================${NC}"
