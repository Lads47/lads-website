#!/bin/bash
# Run as root from a reviewed checkout; installs only the LADS deployment entry point.
set -euo pipefail
[[ $EUID == 0 && $# == 1 ]] || { echo 'Usage: sudo bash deploy/server/install.sh public-key-file'; exit 1; }
[[ $(cat "$1") =~ ^ssh-ed25519\ [A-Za-z0-9+/=]+(\ .*)?$ ]] || { echo 'Cle publique Ed25519 requise'; exit 1; }
cd "$(dirname "$0")/../.."
[[ -d /docker/lads-website/site && -f /docker/lads-website/nginx.conf ]]
[[ ! -L /docker/lads-website && ! -L /docker/lads-website/site ]]
[[ $(stat -c %u /docker/lads-website) == 0 && $(stat -c %u /docker/lads-website/site) == 0 ]]
command -v python3 >/dev/null
command -v sudo >/dev/null
docker inspect lads-website >/dev/null
if ! id lads-deploy >/dev/null 2>&1; then
  useradd --system --create-home --home-dir /var/lib/lads-deploy --shell /bin/bash lads-deploy
fi
install -d -o root -g root -m 755 /usr/local/libexec/lads /var/lib/lads-deploy
install -o root -g root -m 755 deploy/server/release.py /usr/local/libexec/lads/release.py
install -o root -g root -m 755 deploy/server/ssh-gateway.sh /usr/local/libexec/lads/ssh-gateway.sh
install -o root -g root -m 644 deploy/nginx.conf /usr/local/libexec/lads/nginx.conf
# The existing config is checked against this reviewed copy by initialize.
install -o root -g root -m 644 deploy/nginx.legacy.conf /usr/local/libexec/lads/nginx.legacy.conf
sudoers=$(mktemp)
trap 'rm -f "$sudoers"' EXIT
printf '%s\n' 'lads-deploy ALL=(root) NOPASSWD: /usr/local/libexec/lads/release.py status, /usr/local/libexec/lads/release.py deploy *, /usr/local/libexec/lads/release.py rollback *' > "$sudoers"
visudo -cf "$sudoers"
install -o root -g root -m 440 "$sudoers" /etc/sudoers.d/lads-deploy
install -d -o root -g root -m 755 /var/lib/lads-deploy/.ssh
printf 'restrict,command="/usr/local/libexec/lads/ssh-gateway.sh" %s\n' "$(cat "$1")" > /var/lib/lads-deploy/.ssh/authorized_keys
chown root:root /var/lib/lads-deploy/.ssh/authorized_keys
chmod 644 /var/lib/lads-deploy/.ssh/authorized_keys
echo 'Acces limite installe. La configuration nginx du site est encore inchangee.'
