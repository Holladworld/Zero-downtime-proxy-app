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
