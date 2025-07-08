#!/bin/bash

# Script to verify the deployment status on EC2
# Usage: ./check-deploy-status.sh <EC2_IP>

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <EC2_IP>${NC}"
    echo "Example: $0 ec2-52-91-87-104.compute-1.amazonaws.com"
    exit 1
fi

EC2_HOST="$1"
KEY_PATH="$HOME/.ssh/asmovie-keypair.pem"

echo -e "${BLUE}🔍 Checking deployment status on $EC2_HOST${NC}"
echo ""

# Verify connectivity
echo "📡 Testing connectivity..."
if ! ping -c 1 "$EC2_HOST" &> /dev/null; then
    echo -e "${RED}❌ Cannot reach $EC2_HOST${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Host is reachable${NC}"

# Verify API
echo "🌐 Testing API endpoint..."
API_URL="http://$EC2_HOST"
if curl -s "$API_URL" | grep -q "Hola mundo"; then
    echo -e "${GREEN}✅ API is responding${NC}"
else
    echo -e "${RED}❌ API is not responding correctly${NC}"
fi

# Connect via SSH to verify status
echo "🔍 Checking deployment details via SSH..."

SSH_COMMAND="ssh -i $KEY_PATH -o StrictHostKeyChecking=no ec2-user@$EC2_HOST"

# Verify that the key exists
if [ ! -f "$KEY_PATH" ]; then
    echo -e "${RED}❌ SSH key not found at $KEY_PATH${NC}"
    exit 1
fi

# Get deployment information
DEPLOYMENT_INFO=$($SSH_COMMAND '
cd /opt/asmovie/app/apps/api 2>/dev/null || cd /opt/asmovie/app 2>/dev/null || echo "REPO_NOT_FOUND"

if [ "$(pwd)" = "REPO_NOT_FOUND" ]; then
    echo "REPO_STATUS=NOT_FOUND"
else
    echo "REPO_STATUS=FOUND"
    echo "CURRENT_COMMIT=$(git log --format="%H" -1 2>/dev/null || echo "UNKNOWN")"
    echo "CURRENT_MESSAGE=$(git log --format="%s" -1 2>/dev/null || echo "UNKNOWN")"
    echo "CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "UNKNOWN")"
    echo "LAST_PULL=$(stat -c %Y .git/FETCH_HEAD 2>/dev/null || echo "UNKNOWN")"
fi

# Verify PM2
echo "PM2_STATUS=$(pm2 list | grep asmovie-api | awk "{print \$10}" || echo "NOT_RUNNING")"

# Verify if deployment info exists
if [ -f "/opt/asmovie/deployment-info.json" ]; then
    echo "DEPLOYMENT_INFO_EXISTS=YES"
    cat /opt/asmovie/deployment-info.json
else
    echo "DEPLOYMENT_INFO_EXISTS=NO"
fi
')

echo ""
echo -e "${BLUE}📊 Deployment Status Report${NC}"
echo "================================"

# Parse the information
while IFS= read -r line; do
    case "$line" in
        REPO_STATUS=*)
            REPO_STATUS="${line#*=}"
            ;;
        CURRENT_COMMIT=*)
            CURRENT_COMMIT="${line#*=}"
            ;;
        CURRENT_MESSAGE=*)
            CURRENT_MESSAGE="${line#*=}"
            ;;
        PM2_STATUS=*)
            PM2_STATUS="${line#*=}"
            ;;
        *)
            if [[ "$line" == "{"* ]]; then
                echo -e "${BLUE}📝 Deployment Info:${NC} $line"
            fi
            ;;
    esac
done <<< "$DEPLOYMENT_INFO"

echo ""
if [ "$REPO_STATUS" = "FOUND" ]; then
    echo -e "${GREEN}✅ Repository: Found${NC}"
    echo -e "${BLUE}📍 Current commit: ${CURRENT_COMMIT:0:8}${NC}"
    echo -e "${BLUE}💬 Commit message: $CURRENT_MESSAGE${NC}"
else
    echo -e "${RED}❌ Repository: Not found${NC}"
fi

if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ PM2 Status: Running${NC}"
else
    echo -e "${RED}❌ PM2 Status: $PM2_STATUS${NC}"
fi

# Get the most recent local commit for comparison
echo ""
echo -e "${BLUE}🔄 Comparing with local repository...${NC}"
LOCAL_COMMIT=$(git log --format="%H" -1)
echo -e "${BLUE}📍 Local commit: ${LOCAL_COMMIT:0:8}${NC}"

if [ "$CURRENT_COMMIT" = "$LOCAL_COMMIT" ]; then
    echo -e "${GREEN}✅ EC2 is on the latest commit${NC}"
else
    echo -e "${YELLOW}⚠️ EC2 is NOT on the latest commit${NC}"
    echo -e "${YELLOW}💡 Consider running: npm run deploy:aws:force${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo "• Force redeploy: npm run deploy:aws:force"
echo "• SSH to server: ssh -i ~/.ssh/asmovie-keypair.pem ec2-user@$EC2_HOST"
echo "• Check logs: ssh -i ~/.ssh/asmovie-keypair.pem ec2-user@$EC2_HOST 'pm2 logs asmovie-api'"
