#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 ASMovie API - One-Click Deployment${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo "Usage: $0 [--force-recreate]"
echo "  --force-recreate  : Destroy and recreate EC2 instance (ensures latest code)"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not installed. Please install it first.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed. Please install it first.${NC}"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"

# Set region
aws configure set region us-east-1

# Create key pair if it doesn't exist
echo "🔑 Setting up EC2 key pair..."
if ! aws ec2 describe-key-pairs --key-names asmovie-keypair &> /dev/null; then
    echo "Creating new key pair..."
    aws ec2 create-key-pair --key-name asmovie-keypair --query 'KeyMaterial' --output text > ~/.ssh/asmovie-keypair.pem
    chmod 400 ~/.ssh/asmovie-keypair.pem
    echo -e "${GREEN}✅ Key pair created${NC}"
else
    echo -e "${GREEN}✅ Key pair already exists${NC}"
fi

# Deploy infrastructure
echo "🏗️ Deploying infrastructure..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$SCRIPT_DIR/infrastructure"

cd "$INFRA_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing CDK dependencies..."
    npm install
fi

echo "🚀 Deploying CDK stack (this will take ~5-10 minutes)..."

# Check if we should force recreate the instance (to ensure fresh code)
if [ "$1" == "--force-recreate" ]; then
    echo "🔄 Force recreating EC2 instance to ensure latest code..."
    # Get current stack status
    STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name ASMovieEC2Stack --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "DOES_NOT_EXIST")
    
    if [ "$STACK_EXISTS" != "DOES_NOT_EXIST" ]; then
        echo "🗑️ Destroying existing stack first..."
        npm run destroy || true
        echo "⏳ Waiting for stack destruction to complete..."
        aws cloudformation wait stack-delete-complete --stack-name ASMovieEC2Stack
    fi
fi

# Check if stack already exists for regular deploy
STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name ASMovieEC2Stack --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "DOES_NOT_EXIST")

DEPLOY_OUTPUT=$(npm run deploy 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract API URL from CloudFormation outputs
API_URL=$(echo "$DEPLOY_OUTPUT" | grep -E "(APIURL|ASMovieEC2Stack\.APIURL)" | grep -o 'http://[^[:space:]]*' | head -1)
EC2_HOST=$(echo "$API_URL" | sed 's|http://||')

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"

# Update Bruno environment with production API URL
if [ -n "$API_URL" ]; then
    echo "🔄 Updating Bruno environment with production API URL..."
    cd "$SCRIPT_DIR"
    node update-bruno-environment.js "$API_URL"
    echo -e "${GREEN}✅ Bruno Production environment updated${NC}"
else
    echo -e "${RED}⚠️ Could not extract API URL from deployment output${NC}"
fi

# If this was a regular deploy (not force-recreate) and stack existed, update the code
if [ "$1" != "--force-recreate" ] && [ "$STACK_EXISTS" != "DOES_NOT_EXIST" ]; then
    echo ""
    echo -e "${BLUE}🔄 Stack already existed, updating code on existing instance...${NC}"
    
    if [ -n "$EC2_HOST" ]; then
        echo "🚀 Running remote code update..."
        ./update-remote-code.sh "$EC2_HOST"
    else
        echo -e "${RED}❌ Could not determine EC2 host for code update${NC}"
    fi
fi
echo ""
echo "📋 Your API is being set up automatically and will be ready in ~5 minutes."
echo ""
echo "🔗 The CloudFormation outputs above show:"
echo "   • API URL (test this in 5-10 minutes)"
echo "   • SSH command to access the server"
echo "   • Database endpoint"
echo ""
echo "🧪 Test users will be available:"
echo "   • admin@asmovie.com (Password: AdminPassword123!)"
echo "   • test@asmovie.com (Password: TestPassword123!)"
echo ""
echo "🔧 Bruno API Testing:"
echo "   • Production environment automatically updated"
echo "   • Switch to 'Production' environment in Bruno"
echo "   • Test endpoints with real production data"
echo ""
echo "⌛ The EC2 instance is automatically:"
echo "   • Installing dependencies"
echo "   • Building the application"
echo "   • Running database migrations"
echo "   • Seeding the database"
echo "   • Starting the API with PM2"
echo ""
echo -e "${BLUE}🚀 No further action required! Your API will be live shortly.${NC}"
