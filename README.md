# Zero-Downtime Proxy App

## Overview
"A Zero-Downtime Proxy App that automatically fails over between Blue and Green 
application environments using Nginx. It detects service failures in real-time and 
reroutes traffic without any impact to end users - exactly how companies like Netflix 
and Amazon handle deployments.

`It is production-ready Docker Compose system implementing Blue/Green deployment strategy with Nginx as an intelligent reverse proxy. Provides automatic failover between application versions with zero dropped requests during failures.`

## Key Features
- 🚀 **Automatic Failover**: Seamlessly switches from Blue to Green environment on service failure
- ⚡ **Zero Downtime**: No failed client requests during failover events  
- 🔧 **Nginx-Powered**: Advanced upstream configuration with health checks and retry logic
- 🐳 **Containerized**: Full Docker Compose setup for easy deployment and testing
- 📊 **Header Preservation**: Maintains X-App-Pool and X-Release-Id headers for traffic analysis


# Problem/Solution Format

## The Problem
Traditional deployments cause downtime when applications fail. Users see errors and 
business loses revenue during these outages.

## The Solution  
Zero-Downtime Proxy App uses Nginx upstreams with backup servers and intelligent 
retry logic to automatically route traffic to healthy application instances, 
eliminating user-facing errors during failures.
