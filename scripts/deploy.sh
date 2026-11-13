#!/bin/bash
set -euo pipefail
[[ ${GITHUB_REF:-} == refs/heads/main ]] || { echo 'Publication reservee a main' >&2; exit 1; }
[[ ${GITHUB_SHA:-} =~ ^[0-9a-f]{40}$ && ${GITHUB_RUN_ID:-} =~ ^[0-9]+$ && ${GITHUB_RUN_ATTEMPT:-} =~ ^[0-9]+$ ]]
umask 077
key=$(mktemp)
trap 'rm -f "$key"' EXIT
printf '%s\n' "$HOSTINGER_SSH_KEY" > "$key"
unset HOSTINGER_SSH_KEY
tar -C dist -czf - . | ssh -T -i "$key" -o IdentitiesOnly=yes -o BatchMode=yes \
  -o StrictHostKeyChecking=yes -o UserKnownHostsFile=deploy/known_hosts \
  -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=3 \
  lads-deploy@82.112.240.219 "deploy $GITHUB_SHA $GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT"
