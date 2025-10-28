# Zero-Downtime Blue/Green Deployment with Nginx

## 📋 Project Overview

This project implements a blue/green deployment strategy with automatic failover using Nginx as a reverse proxy. The setup ensures zero downtime during deployments and automatic traffic routing based on application health.

## 🏗️ Architecture

```
Client → Nginx (Port 8080) → Active Pool (Blue/Green) → Application
                         ↳ Backup Pool (Green/Blue)
```

- **Nginx Proxy**: Routes traffic on port 8080
- **Blue Application**: Direct access on port 8081
- **Green Application**: Direct access on port 8082
- **Automatic Failover**: Nginx detects failures and switches to backup
- **Manual Control**: Toggle between blue/green deployments

## 🚀 Features

- ✅ Zero-downtime deployments
- ✅ Automatic health-based failover
- ✅ Manual blue/green switching
- ✅ Chaos testing endpoints
- ✅ Header preservation (X-App-Pool, X-Release-Id)
- ✅ Docker containerization

## 📁 Project Structure

```
Zero-downtime-proxy-app/
├── docker-compose.yml
├── .env
├── nginx.conf.template
├── entrypoint.sh
└── toggle.sh
```

## 🔧 Configuration Files

### 1. docker-compose.yml
```yaml
services:
  app_blue:
    image: ${BLUE_IMAGE}
    container_name: app_blue
    environment:
      - APP_POOL=blue
      - RELEASE_ID=${RELEASE_ID_BLUE}
      - APP_PORT=${APP_PORT:-3000}
    ports:
      - "8081:${APP_PORT:-3000}"
    networks:
      - app_network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:${APP_PORT:-3000}/healthz"]
      interval: 5s
      timeout: 3s
      retries: 3
      start_period: 10s

  app_green:
    image: ${GREEN_IMAGE}
    container_name: app_green
    environment:
      - APP_POOL=green
      - RELEASE_ID=${RELEASE_ID_GREEN}
      - APP_PORT=${APP_PORT:-3000}
    ports:
      - "8082:${APP_PORT:-3000}"
    networks:
      - app_network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:${APP_PORT:-3000}/healthz"]
      interval: 5s
      timeout: 3s
      retries: 3
      start_period: 10s

  nginx:
    image: nginx:alpine
    container_name: nginx_proxy
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf.template:/etc/nginx/templates/nginx.conf.template:ro
      - ./entrypoint.sh:/entrypoint.sh:ro
    environment:
      - ACTIVE_POOL=${ACTIVE_POOL}
      - APP_PORT=${APP_PORT:-3000}
    networks:
      - app_network
    depends_on:
      - app_blue
      - app_green
    entrypoint: ["/bin/sh", "/entrypoint.sh"]

networks:
  app_network:
    driver: bridge
```

### 2. .env
```bash
BLUE_IMAGE=my-test-app:blue
GREEN_IMAGE=my-test-app:green
ACTIVE_POOL=blue
RELEASE_ID_BLUE=v1.0.0-blue
RELEASE_ID_GREEN=v1.0.0-green
PORT=3000
APP_PORT=3000
```

### 3. nginx.conf.template
```nginx
upstream active_pool {
    server app_${ACTIVE_POOL}:${APP_PORT} max_fails=1 fail_timeout=3s;
    server app_${BACKUP_POOL}:${APP_PORT} backup;
}

server {
    listen 80;
    server_name localhost;

    proxy_connect_timeout 2s;
    proxy_send_timeout 2s;
    proxy_read_timeout 2s;

    proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
    proxy_next_upstream_tries 1;
    proxy_next_upstream_timeout 2s;

    location / {
        proxy_pass http://active_pool;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass_request_headers on;
        proxy_buffering off;
    }

    location /version {
        proxy_pass http://active_pool/version;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 2s;
        proxy_send_timeout 2s;
        proxy_read_timeout 2s;
        
        proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 1;
        proxy_next_upstream_timeout 2s;
        
        proxy_pass_request_headers on;
        proxy_buffering off;
    }

    location /healthz {
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 4. entrypoint.sh
```bash
#!/bin/sh

# Determine backup pool based on active pool
if [ "$ACTIVE_POOL" = "blue" ]; then
    export BACKUP_POOL="green"
else
    export BACKUP_POOL="blue"
fi

# Substitute environment variables in the Nginx config template
envsubst '${ACTIVE_POOL} ${BACKUP_POOL} ${APP_PORT}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Verify the generated configuration
echo "Generated Nginx configuration:"
cat /etc/nginx/conf.d/default.conf

# Test Nginx configuration
nginx -t

# Start Nginx in the foreground
exec nginx -g 'daemon off;'
```

### 5. toggle.sh
```bash
#!/bin/bash

if [ -f .env ]; then
    if grep -q "ACTIVE_POOL=blue" .env; then
        sed -i 's/ACTIVE_POOL=blue/ACTIVE_POOL=green/' .env
        echo "Switched to GREEN pool"
    else
        sed -i 's/ACTIVE_POOL=green/ACTIVE_POOL=blue/' .env
        echo "Switched to BLUE pool"
    fi

    docker-compose exec nginx nginx -s reload
    echo "Nginx configuration reloaded"
else
    echo ".env file not found"
    exit 1
fi
```

## 🛠️ Setup Instructions

### Prerequisites
- Docker
- Docker Compose

### Installation
1. Clone the repository
2. Make scripts executable:
   ```bash
   chmod +x entrypoint.sh toggle.sh
   ```
3. Update `.env` with your application images
4. Start the services:
   ```bash
   sudo docker-compose up -d
   ```

## 🧪 Testing

### Basic Health Checks
```bash
# Check nginx proxy
curl http://localhost:8080/version

# Check blue app directly
curl http://localhost:8081/version

# Check green app directly
curl http://localhost:8082/version
```

### Manual Switching
```bash
# Switch between blue and green
./toggle.sh

# Verify the switch
curl http://localhost:8080/version
```

### Automatic Failover Testing
```bash
# Start with blue active
curl http://localhost:8080/version  # Should show blue

# Make blue fail
curl -X POST "http://localhost:8081/chaos/start?mode=error"

# Should auto-failover to green
curl http://localhost:8080/version  # Should show green

# Now make green fail too
curl -X POST "http://localhost:8082/chaos/start?mode=error"

# Test what happens
curl http://localhost:8080/version  # Will show green (but might get errors)

# Stop chaos on both
curl -X POST "http://localhost:8081/chaos/stop"
curl -X POST "http://localhost:8082/chaos/stop"

# Should automatically return to blue (primary)
curl http://localhost:8080/version
```

### Recovery Testing
```bash
# Make blue fail
curl -X POST "http://localhost:8081/chaos/start?mode=error"

# Verify failover to green
curl http://localhost:8080/version

# Fix blue
curl -X POST "http://localhost:8081/chaos/stop"

# Should auto-switch back to blue
curl http://localhost:8080/version
```

## 🔍 Key Learnings & Troubleshooting

### Nginx Backup Behavior
- **Backup servers only take over** when the primary is marked as "down"
- **Once the primary recovers**, nginx automatically sends traffic back to it
- **If both are failing**, nginx sticks with whichever is currently active

### Common Issues & Solutions

#### Issue: Manual .env changes don't take effect
**Solution**: The restart doesn't change the `.env` file - it just reads whatever is currently in there. Use the toggle script or manually reload nginx.

```bash
# Check current ACTIVE_POOL in .env
cat .env | grep ACTIVE_POOL

# If it shows ACTIVE_POOL=green, change it back to blue
sed -i 's/ACTIVE_POOL=green/ACTIVE_POOL=blue/' .env

# Restart to apply the change
sudo docker-compose restart nginx

# Or use the toggle script
./toggle.sh
```

#### Issue: Automatic failover not working
**Solution**: Ensure:
1. Chaos endpoints actually return errors (500 status codes)
2. Nginx configuration has proper timeout settings
3. Backup server is properly configured

#### Issue: Containers not starting
**Solution**: Check network configuration and ensure all required images are accessible.

## 📊 Monitoring

### Check Container Status
```bash
sudo docker-compose ps
```

### View Logs
```bash
# Nginx logs
sudo docker-compose logs nginx

# Application logs
sudo docker-compose logs app_blue
sudo docker-compose logs app_green
```

### Network Inspection
```bash
docker network inspect zero-downtime-proxy-app_app_network
```

## 🎯 Deployment Workflow

1. **Initial State**: Blue is active, Green is backup
2. **Deploy New Version** to Green environment
3. **Test Green** directly on port 8082
4. **Switch Traffic** using `./toggle.sh`
5. **Monitor** for any issues
6. **Rollback** if needed using `./toggle.sh`

## 📝 Notes

- The setup preserves application headers (`X-App-Pool`, `X-Release-Id`)
- Health checks run every 5 seconds with 3 retries
- Failover happens within seconds of detection
- Manual override is always available via toggle script

## 🔒 Security Considerations

- Ensure application images are from trusted sources
- Use secure communication between containers
- Consider adding authentication for chaos endpoints in production

## 📞 Support

For issues related to this deployment setup, check:
1. Docker container logs
2. Nginx configuration syntax
3. Network connectivity between containers
4. Application health endpoints

---

**Built for HNG Stage 2 DevOps Task** 🚀
