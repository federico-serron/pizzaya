#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verificar puerto 8000 libre
if netstat -ano 2>/dev/null | grep -q ":8000 "; then
  echo "ADVERTENCIA: El puerto 8000 ya esta en uso."
  echo "Ejecuta: netstat -ano | findstr :8000  ->  taskkill /PID <pid> /F"
  exit 1
fi

cleanup() {
  echo ""
  echo "Deteniendo servicios..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  echo "Listo."
}
trap cleanup EXIT INT TERM

# --- Backend ---
echo "Iniciando backend (puerto 8000)..."
cd "$ROOT/backend"
source venv/Scripts/activate
echo "Instalando dependencias Python..."
pip install -r requirements.txt -q
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# --- Frontend ---
echo "Iniciando frontend (Vite dev server)..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Presiona Ctrl+C para detener ambos."
echo ""

wait
