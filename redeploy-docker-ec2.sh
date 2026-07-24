#!/usr/bin/env bash
set -euo pipefail

cd ~/counselling

echo "Stopping PM2 app if present..."
pm2 delete counselling 2>/dev/null || true
pm2 save 2>/dev/null || true

echo "Installing Docker if needed..."
if ! command -v docker >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y docker.io docker-compose-v2
  sudo systemctl enable --now docker
  sudo usermod -aG docker ubuntu || true
fi

# Prefer docker compose plugin; fallback to docker-compose
compose() {
  if docker compose version >/dev/null 2>&1; then
    sudo docker compose "$@"
  else
    sudo docker-compose "$@"
  fi
}

echo "Pulling latest code..."
git fetch origin
git reset --hard origin/master

# Ensure LF line endings on entrypoint
sed -i 's/\r$//' docker-entrypoint.sh
chmod +x docker-entrypoint.sh

echo "Writing .env for compose..."
SECRET=$(openssl rand -hex 24)
cat > .env <<EOF
AUTH_SECRET=prod-counselling-${SECRET}
APP_URL=http://ec2-65-2-6-70.ap-south-1.compute.amazonaws.com:3000
EOF

echo "Building and starting container..."
compose down --remove-orphans || true
compose up -d --build

sleep 5
compose ps
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000/ || true
echo "Redeploy done: http://ec2-65-2-6-70.ap-south-1.compute.amazonaws.com:3000"
