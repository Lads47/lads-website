#!/bin/bash
set -euo pipefail
# Root-owned forced command. No shell, port forwarding, SCP, SFTP or Docker access.
case "${SSH_ORIGINAL_COMMAND:-}" in
  status) exec sudo -n /usr/local/libexec/lads/release.py status ;;
esac
if [[ ${SSH_ORIGINAL_COMMAND:-} =~ ^deploy\ ([0-9a-f]{40})\ ([0-9]{1,20}-[0-9]{1,4})$ ]]; then
  exec sudo -n /usr/local/libexec/lads/release.py deploy "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
fi
if [[ ${SSH_ORIGINAL_COMMAND:-} =~ ^rollback\ ([0-9a-f]{40}-[0-9]{1,20}-[0-9]{1,4}|baseline-[0-9]{14})$ ]]; then
  exec sudo -n /usr/local/libexec/lads/release.py rollback "${BASH_REMATCH[1]}"
fi
echo 'Commande refusee' >&2
exit 1
