#!/bin/sh

# Exit on error
set -e

if [[ -z "${SERVER}" ]]; then
    echo "SERVER env undefined"
    exit 1
fi

# Check if SERVER environment variable is set
if [ -z "$SERVER" ]; then
  echo "Error: SERVER environment variable not set"
  exit 1
fi

# Try to connect to server with 5 successful pings
connected=false
successful_pings=0

while [ "$connected" = false ]; do
  if curl -s -k "$SERVER" > /dev/null 2>&1; then
    successful_pings=$((successful_pings + 1))
    if [ $successful_pings -eq 5 ]; then
      connected=true
    fi
  else
    echo "[$(date '+%c')] Server $SERVER not ready yet"
    sleep 1
  fi
done

echo "Uploading blueprints bundle"

# Check if bundle exists
if [ ! -f "bundle.json" ]; then
  echo "Error: bundle.json not found"
  exit 1
fi

# Upload bundle
# Note: The curl command is using -k to ignore SSL certificate validation
if ! curl -s -k -X POST "$SERVER/api/private/blueprints/restore/" \
     -H "Content-Type: application/json" \
     --data-binary @bundle.json > /dev/null; then
  echo "Blueprints bundle upload failed"
  exit 1
fi

echo "Blueprints bundle uploaded"
exit 0
