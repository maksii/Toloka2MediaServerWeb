#!/bin/bash

# Check required environment variables
if [ -z "$CRON_SCHEDULE" ] || [ -z "$PORT" ]; then
  echo "Required environment variables are missing."
  exit 1
fi

# Set the API key from environment variable or use default
API_KEY=${API_KEY:-your_api_key_here}

# Create a cron job file dynamically
(crontab -l 2>/dev/null; echo "$CRON_SCHEDULE curl -X POST http://127.0.0.1:$PORT/api/releases/update -H 'x-api-key: $API_KEY'") | crontab -u appuser -

# Start cron in the foreground to handle logs better
crond -f -L /dev/stdout &

# Start the web server
exec python -m app