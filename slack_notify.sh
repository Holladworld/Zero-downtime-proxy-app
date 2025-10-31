#!/bin/bash


# slack_notify.sh
WEBHOOK_URL="https://hooks.slack.com/services/XXX/XXX/XXX"

# package.json
"url": "git+https://github.com/Holladworld/Zero-downtime-proxy-app.git
# Your username
USERNAME="holladworld"

# Example submission status
STATUS="Passed"  # or "Failed", you can dynamically set this

# Send message to Slack
curl -X POST -H 'Content-type: application/json' \
--data "{\"text\":\"@${USERNAME} Submission result: ${STATUS}\"}" \
$WEBHOOK_URL
