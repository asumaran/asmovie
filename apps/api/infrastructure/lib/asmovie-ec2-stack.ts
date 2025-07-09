import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import { execSync } from 'child_process';
import { Construct } from 'constructs';

export class ASMovieEC2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get the current commit hash to force updates
    const currentCommit = this.getCurrentCommitHash();
    console.log(`🔍 Deploying commit: ${currentCommit}`);

    // VPC for the infrastructure
    const vpc = new ec2.Vpc(this, 'ASMovieVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // Security Group for the EC2 instance
    const webServerSG = new ec2.SecurityGroup(this, 'WebServerSecurityGroup', {
      vpc,
      description: 'Security group for ASMovie API server',
      allowAllOutbound: true,
    });

    // Allow HTTP and HTTPS traffic
    webServerSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP',
    );
    webServerSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS',
    );
    webServerSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3001),
      'Allow NestJS API',
    );
    webServerSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH',
    );

    // Security Group for RDS
    const dbSecurityGroup = new ec2.SecurityGroup(
      this,
      'DatabaseSecurityGroup',
      {
        vpc,
        description: 'Security group for RDS database',
      },
    );

    // Allow connection from the web server to the database
    dbSecurityGroup.addIngressRule(
      webServerSG,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from web server',
    );

    // RDS PostgreSQL Database
    const database = new rds.DatabaseInstance(this, 'ASMovieDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_7,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      credentials: rds.Credentials.fromGeneratedSecret('asmovie_admin'),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'asmovie',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only
      deleteAutomatedBackups: true,
      backupRetention: cdk.Duration.days(0),
      deletionProtection: false,
    });

    // IAM Role for the EC2 instance
    const ec2Role = new iam.Role(this, 'EC2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonSSMManagedInstanceCore',
        ),
      ],
    });

    // Allow EC2 to read the database secret
    if (database.secret) {
      database.secret.grantRead(ec2Role);
    }

    // Initialization script for the EC2 instance
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      // Update the system
      'yum update -y',

      // Install Node.js 20
      'curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -',
      'yum install -y nodejs',

      // Install Git and other tools (including certbot for SSL)
      'yum install -y git nginx postgresql15 python3-certbot-nginx',

      // Install PM2 globally
      'npm install -g pm2',

      // Create directory for the application
      'mkdir -p /opt/asmovie',
      'chown ec2-user:ec2-user /opt/asmovie',

      // Configure Nginx as reverse proxy with SSL support
      'cat > /etc/nginx/conf.d/asmovie.conf << "EOF"',
      'server {',
      '    listen 80;',
      '    server_name api.asumaran.com;',
      '',
      "    # Allow HTTP for Let's Encrypt challenge",
      '    location /.well-known/acme-challenge/ {',
      '        root /var/www/html;',
      '    }',
      '',
      '    # Redirect other HTTP requests to HTTPS (after SSL setup)',
      '    location / {',
      '        proxy_pass http://localhost:3001;',
      '        proxy_http_version 1.1;',
      '        proxy_set_header Upgrade \\$http_upgrade;',
      '        proxy_set_header Connection "upgrade";',
      '        proxy_set_header Host \\$host;',
      '        proxy_set_header X-Real-IP \\$remote_addr;',
      '        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;',
      '        proxy_set_header X-Forwarded-Proto \\$scheme;',
      '        proxy_cache_bypass \\$http_upgrade;',
      '    }',
      '}',
      'EOF',

      // Remove default Nginx config
      'rm -f /etc/nginx/conf.d/default.conf',

      // Create directory for Let\'s Encrypt challenge
      'mkdir -p /var/www/html',

      // Enable and start Nginx
      'systemctl enable nginx',
      'systemctl start nginx',

      // Configure SSL with Let\'s Encrypt after the app is running
      'cat > /opt/asmovie/setup-ssl.sh << "SSL_SCRIPT_EOF"',
      '#!/bin/bash',
      'set -e',
      '',
      'echo "🔒 Setting up SSL certificate with Let\'s Encrypt..."',
      '',
      '# Configure SSL for api.asumaran.com domain',
      'DOMAIN="api.asumaran.com"',
      'echo "🌐 Domain: $DOMAIN"',
      '',
      '# Request SSL certificate for the domain',
      'echo "📜 Requesting SSL certificate for $DOMAIN..."',
      'certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@asumaran.com --redirect',
      '',
      '# Set up automatic renewal',
      'systemctl enable certbot-timer',
      'systemctl start certbot-timer',
      '',
      'echo "✅ SSL certificate configured successfully!"',
      'echo "🔒 Your API is now available at: https://$DOMAIN"',
      'SSL_SCRIPT_EOF',
      '',
      'chmod +x /opt/asmovie/setup-ssl.sh',

      // Create deployment script
      'cat > /opt/asmovie/deploy.sh << "EOF"',
      '#!/bin/bash',
      'set -e',
      '',
      'echo "🚀 Starting ASMovie API deployment..."',
      '',
      '# Variables',
      'APP_DIR="/opt/asmovie"',
      'REPO_DIR="/opt/asmovie/app"',
      'REPO_URL="https://github.com/asumaran/asmovie.git"',
      '',
      '# Configure git globally',
      'git config --global --add safe.directory $REPO_DIR || true',
      'git config --global user.email "deploy@asmovie.com" || true',
      'git config --global user.name "Deploy Bot" || true',
      '',
      '# Force download of the latest code',
      'if [ -d "$REPO_DIR" ]; then',
      '    echo "🧹 Removing existing repository directory..."',
      '    rm -rf $REPO_DIR',
      'fi',
      '',
      'echo "📥 Cloning repository (fresh copy)..."',
      'git clone $REPO_URL $REPO_DIR',
      'cd $REPO_DIR',
      '',
      '# Ensure we are on the main branch and latest commit',
      'echo "🔍 Current commit: $(git log --oneline -1)"',
      'echo "📍 Current branch: $(git branch --show-current)"',
      '',
      '# Change to API directory',
      'cd $REPO_DIR/apps/api',
      '',
      '# Install dependencies',
      'echo "📦 Installing dependencies..."',
      'npm ci --production',
      '',
      '# Install Prisma CLI',
      'npm install prisma --save-dev',
      '',
      '# Remove infrastructure files to prevent TypeScript conflicts',
      'echo "🧹 Removing infrastructure files to prevent TypeScript conflicts..."',
      'rm -rf infrastructure',
      '',
      '# Build the application',
      'echo "🔨 Building application..."',
      'npm run build',
      '',
      '# Get database credentials from AWS Secrets Manager',
      'echo "🔐 Getting database credentials..."',
      'DB_SECRET=$(aws secretsmanager get-secret-value --region ' +
        cdk.Aws.REGION +
        ' --secret-id ' +
        (database.secret?.secretArn ?? '') +
        ' --query SecretString --output text)',
      'DB_HOST=$(echo $DB_SECRET | jq -r .host)',
      'DB_USER=$(echo $DB_SECRET | jq -r .username)',
      'DB_PASS=$(echo $DB_SECRET | jq -r .password)',
      'DB_NAME=$(echo $DB_SECRET | jq -r .dbname)',
      '',
      '# Create .env file for production',
      'cat > .env << EOL',
      'NODE_ENV=production',
      'PORT=3001',
      'DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:5432/$DB_NAME"',
      'JWT_SECRET="production-jwt-secret-key-32-chars-minimum-asmovie-2025"',
      'JWT_EXPIRES_IN="1h"',
      'API_TOKEN="production-api-token-asmovie-2025"',
      'ALLOWED_ORIGINS="https://asmovie-client.vercel.app,http://localhost:3000"',
      'RATE_LIMIT_WINDOW=900000',
      'RATE_LIMIT_MAX=100',
      'LOG_LEVEL=info',
      'ENABLE_DETAILED_LOGS=false',
      'SLOW_QUERY_THRESHOLD=1000',
      'MAX_MEMORY_USAGE=10485760',
      'PAGINATION_DEFAULT_LIMIT=10',
      'PAGINATION_MAX_LIMIT=100',
      'DB_MAX_CONNECTIONS=10',
      'DB_CONNECTION_TIMEOUT=5000',
      'ENABLE_API_DOCS=true',
      'ENABLE_METRICS=false',
      'EOL',
      '',
      '# Validate that all environment variables are set',
      'echo "🔍 Validating environment variables..."',
      'if [ -z "$DB_USER" ] || [ -z "$DB_PASS" ] || [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ]; then',
      '    echo "❌ Database credentials are missing!"',
      '    exit 1',
      'fi',
      '',
      '# Check that the .env file was created correctly',
      'if [ ! -f ".env" ]; then',
      '    echo "❌ .env file was not created!"',
      '    exit 1',
      'fi',
      '',
      '# Check that critical variables are in the file',
      'if ! grep -q "API_TOKEN" .env; then',
      '    echo "❌ API_TOKEN missing in .env file!"',
      '    exit 1',
      'fi',
      '',
      'if ! grep -q "JWT_SECRET" .env; then',
      '    echo "❌ JWT_SECRET missing in .env file!"',
      '    exit 1',
      'fi',
      '',
      'echo "✅ Environment variables validated successfully"',
      '',
      '# Run database migrations',
      'echo "🗄️ Running database migrations..."',
      'npx prisma migrate deploy',
      '',
      '# Generate Prisma Client',
      'echo "🔧 Generating Prisma client..."',
      'npx prisma generate',
      '',
      '# Run data seed',
      'echo "🌱 Seeding database..."',
      'npm run seed',
      '',
      '# Restart the application with PM2',
      'echo "🔄 Starting application with PM2..."',
      'pm2 stop asmovie-api || true',
      'pm2 start npm --name asmovie-api -- run start:prod',
      'pm2 save',
      '',
      'echo "✅ Deployment completed successfully!"',
      'echo "🌐 API is running on port 3001"',
      'echo "🔗 Access via Nginx proxy on port 80"',
      'EOF',

      // Make the script executable
      'chmod +x /opt/asmovie/deploy.sh',

      // Configure PM2 to start automatically
      'sudo -u ec2-user bash -c "cd /home/ec2-user && pm2 startup systemd -u ec2-user --hp /home/ec2-user"',

      // Install AWS CLI and jq
      'yum install -y awscli jq',

      // Run deployment automatically
      'echo "🚀 Starting automatic deployment..."',
      'cd /opt/asmovie',
      '',
      '# Configure git globally before any operation',
      'git config --global --add safe.directory /opt/asmovie/app || true',
      'git config --global user.email "deploy@asmovie.com" || true',
      'git config --global user.name "Deploy Bot" || true',
      '',
      '# Ensure we have a fresh copy of the repository',
      'rm -rf app',
      'echo "📥 Cloning fresh repository copy..."',
      'git clone https://github.com/asumaran/asmovie.git app',
      'cd app',
      '',
      '# Check current commit',
      'echo "🔍 Deploying commit: $(git log --oneline -1)"',
      'echo "📍 Branch: $(git branch --show-current)"',
      'cd apps/api',

      // Install dependencies
      'echo "📦 Installing dependencies..."',
      'npm ci --production',
      'npm install prisma --save-dev',

      // Remove infrastructure to prevent TypeScript conflicts
      'echo "🧹 Removing infrastructure files to prevent TypeScript conflicts..."',
      'rm -rf infrastructure',

      // Build application
      'echo "🔨 Building application..."',
      'npm run build',

      // Create .env automatically
      'echo "🔐 Setting up environment..."',
      'DB_SECRET=$(aws secretsmanager get-secret-value --region ' +
        cdk.Aws.REGION +
        ' --secret-id ' +
        (database.secret?.secretArn ?? '') +
        ' --query SecretString --output text)',
      'DB_HOST=$(echo $DB_SECRET | jq -r .host)',
      'DB_USER=$(echo $DB_SECRET | jq -r .username)',
      'DB_PASS=$(echo $DB_SECRET | jq -r .password)',
      'DB_NAME=$(echo $DB_SECRET | jq -r .dbname)',

      'cat > .env << AUTO_ENV_EOF',
      'NODE_ENV=production',
      'PORT=3001',
      'DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:5432/$DB_NAME"',
      'JWT_SECRET="production-jwt-secret-key-32-chars-minimum"',
      'API_TOKEN="production-api-token-16-chars"',
      'ALLOWED_ORIGINS="https://asmovie-client.vercel.app,http://localhost:3000"',
      'RATE_LIMIT_WINDOW=900000',
      'RATE_LIMIT_MAX=100',
      'JWT_EXPIRES_IN="1h"',
      'SLOW_QUERY_THRESHOLD=1000',
      'MAX_MEMORY_USAGE=10485760',
      'PAGINATION_DEFAULT_LIMIT=10',
      'PAGINATION_MAX_LIMIT=100',
      'DB_MAX_CONNECTIONS=10',
      'DB_CONNECTION_TIMEOUT=5000',
      'AUTO_ENV_EOF',

      // Run migrations and seed
      'echo "🗄️ Running database migrations..."',
      'npx prisma migrate deploy',
      'echo "🔧 Generating Prisma client..."',
      'npx prisma generate',
      'echo "🌱 Seeding database..."',
      'npm run seed',

      // Start with PM2
      'echo "🔄 Starting application with PM2..."',
      'pm2 stop asmovie-api || true',
      'pm2 delete asmovie-api || true',
      'pm2 start npm --name asmovie-api -- run start:prod',
      'pm2 save',
      '',
      '# Register deployment info',
      'echo "✅ Deployment completed successfully!"',
      'echo "🌐 API is running on port 3001"',
      'echo "🔗 Access via Nginx proxy on port 80"',
      'echo "📝 Deployed commit: $(git log --oneline -1)"',
      'echo "⏰ Deployment time: $(date)"',
      '',
      '# Create deployment info file',
      'cat > /opt/asmovie/deployment-info.json << DEPLOY_INFO_EOF',
      '{',
      '  "deploymentTime": "$(date -Iseconds)",',
      '  "commit": "$(git log --format="%H" -1)",',
      '  "commitMessage": "$(git log --format="%s" -1)",',
      '  "branch": "$(git branch --show-current)"',
      '}',
      'DEPLOY_INFO_EOF',
      'echo "🚀 Starting application with PM2..."',
      'pm2 start dist/src/main.js --name asmovie-api',
      'pm2 save',
      'pm2 startup systemd -u root --hp /root',

      // Run SSL setup after deployment
      'echo "🔒 Setting up SSL certificate..."',
      'sleep 30', // Wait for the app to be fully initialized
      '/opt/asmovie/setup-ssl.sh',

      // Finish message
      'echo "✅ Complete automated deployment finished!"',
      'echo "🌐 API is running and accessible"',

      'echo "✅ EC2 instance setup completed!"',
    );

    // Create the EC2 instance
    const webServer = new ec2.Instance(this, 'ASMovieWebServer', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.SMALL,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: webServerSG,
      role: ec2Role,
      userData,
      keyName: 'asmovie-keypair', // You will need to create this key pair
    });

    // Create an Elastic IP for the web server to maintain consistent IP
    const elasticIP = new ec2.CfnEIP(this, 'WebServerEIP', {
      domain: 'vpc',
      tags: [
        {
          key: 'Name',
          value: 'ASMovie-WebServer-EIP',
        },
      ],
    });

    // Associate the Elastic IP with the EC2 instance
    new ec2.CfnEIPAssociation(this, 'WebServerEIPAssociation', {
      eip: elasticIP.ref,
      instanceId: webServer.instanceId,
    });

    // Add tags to force recreation when code changes
    cdk.Tags.of(webServer).add('DeploymentCommit', currentCommit);
    cdk.Tags.of(webServer).add('DeploymentTime', new Date().toISOString());

    // Useful outputs
    new cdk.CfnOutput(this, 'WebServerPublicIP', {
      value: elasticIP.ref,
      description: 'Elastic IP of the web server (static)',
    });

    new cdk.CfnOutput(this, 'WebServerElasticIP', {
      value: elasticIP.ref,
      description: 'Elastic IP Address (use this for DNS)',
    });

    new cdk.CfnOutput(this, 'WebServerDNS', {
      value: webServer.instancePublicDnsName,
      description: 'Public DNS of the web server',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL endpoint',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: database.secret?.secretArn ?? 'No secret created',
      description: 'ARN of the database credentials secret',
    });

    new cdk.CfnOutput(this, 'SSHCommand', {
      value: `ssh -i ~/.ssh/asmovie-keypair.pem ec2-user@${elasticIP.ref}`,
      description: 'SSH command to connect to the server',
    });

    new cdk.CfnOutput(this, 'APIURL', {
      value: 'https://api.asumaran.com',
      description: 'URL to access the API (HTTPS)',
    });

    new cdk.CfnOutput(this, 'APIURLHttp', {
      value: 'http://api.asumaran.com',
      description: 'URL to access the API (HTTP - will redirect to HTTPS)',
    });

    new cdk.CfnOutput(this, 'DeploymentCommand', {
      value: 'sudo /opt/asmovie/deploy.sh',
      description: 'Command to run deployment on the server',
    });
  }

  private getCurrentCommitHash(): string {
    try {
      return execSync('git rev-parse HEAD').toString().trim();
    } catch (error) {
      console.error('Error getting current commit hash:', error);
      return 'unknown';
    }
  }
}
