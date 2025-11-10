#!/usr/bin/env bash
set -e
# Set dummy environment variables for build
export OPENAI_API_KEY=dummy
export GEMINI_API_KEY=dummy
export GROQ_API_KEY=dummy
export XAI_API_KEY=dummy
export MONGODB_URI=dummy
export NEXT_PUBLIC_SUPABASE_URL=dummy
export NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy
export NEXT_PUBLIC_BASE_URL=http://localhost:3000
npm run build
# serve build directory depending on framework
if [ -d "build" ]; then DIST=build; elif [ -d "dist" ]; then DIST=dist; elif [ -d ".next" ]; then echo "Next.js detected; skipping static smoke test"; exit 0; else DIST=build; fi
# start a quick http server in background using npx http-server
npx http-server "$DIST" -p 8080 -c-1 >/tmp/smoke-http.log 2>&1 &
PID=$!
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ || true)
if [ "$HTTP_STATUS" != "200" ]; then
  echo "Smoke test failed: http status $HTTP_STATUS"; cat /tmp/smoke-http.log; kill $PID || true; exit 1
fi
kill $PID || true
echo "Smoke test OK: $HTTP_STATUS"
