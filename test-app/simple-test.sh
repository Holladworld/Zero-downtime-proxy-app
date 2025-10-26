#!/bin/bash

echo "🔧 SIMPLE BLUE/GREEN TEST"
echo "=========================="

echo "1. Checking container status..."
sudo docker compose ps

echo ""
echo "2. Testing direct Blue access..."
curl -s http://localhost:8081/version || echo "Blue /version failed"

echo ""
echo "3. Testing direct Green access..."
curl -s http://localhost:8082/version || echo "Green /version failed"

echo ""
echo "4. Testing through Nginx..."
curl -s http://localhost:8080/version || echo "Nginx /version failed"

echo ""
echo "5. Testing health endpoints..."
echo "Blue health: $(curl -s http://localhost:8081/healthz)"
echo "Green health: $(curl -s http://localhost:8082/healthz)"
echo "Nginx health: $(curl -s http://localhost:8080/healthz)"

echo ""
echo "=========================="
echo "Test complete. Check logs above for any errors."
