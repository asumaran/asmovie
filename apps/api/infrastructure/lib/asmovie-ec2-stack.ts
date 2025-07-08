import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import { execSync } from 'child_process';
import { Construct } from 'constructs';

export class ASMovieEC2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Obtener el commit hash actual para forzar updates
    const currentCommit = this.getCurrentCommitHash();
    console.log(`🔍 Deploying commit: ${currentCommit}`);

    // VPC para la infraestructura
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

    // Security Group para la instancia EC2
    const webServerSG = new ec2.SecurityGroup(this, 'WebServerSecurityGroup', {
      vpc,
      description: 'Security group for ASMovie API server',
      allowAllOutbound: true,
    });

    // Permitir tráfico HTTP y HTTPS
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

    // Security Group para RDS
    const dbSecurityGroup = new ec2.SecurityGroup(
      this,
      'DatabaseSecurityGroup',
      {
        vpc,
        description: 'Security group for RDS database',
      },
    );

    // Permitir conexión desde el servidor web a la base de datos
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
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Solo para desarrollo
      deleteAutomatedBackups: true,
      backupRetention: cdk.Duration.days(0),
      deletionProtection: false,
    });

    // IAM Role para la instancia EC2
    const ec2Role = new iam.Role(this, 'EC2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonSSMManagedInstanceCore',
        ),
      ],
    });

    // Permitir a EC2 leer el secreto de la base de datos
    if (database.secret) {
      database.secret.grantRead(ec2Role);
    }

    // Script de inicialización para la instancia EC2
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      // Actualizar el sistema
      'yum update -y',

      // Instalar Node.js 20
      'curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -',
      'yum install -y nodejs',

      // Instalar Git y otras herramientas
      'yum install -y git nginx postgresql15',

      // Instalar PM2 globalmente
      'npm install -g pm2',

      // Crear directorio para la aplicación
      'mkdir -p /opt/asmovie',
      'chown ec2-user:ec2-user /opt/asmovie',

      // Configurar Nginx como proxy reverso
      'cat > /etc/nginx/conf.d/asmovie.conf << EOF',
      'server {',
      '    listen 80;',
      '    server_name _;',
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

      // Remover configuración por defecto de Nginx
      'rm -f /etc/nginx/conf.d/default.conf',

      // Habilitar y iniciar Nginx
      'systemctl enable nginx',
      'systemctl start nginx',

      // Crear script de deployment
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
      '# Configurar git globalmente',
      'git config --global --add safe.directory $REPO_DIR || true',
      'git config --global user.email "deploy@asmovie.com" || true',
      'git config --global user.name "Deploy Bot" || true',
      '',
      '# Forzar descarga del código más reciente',
      'if [ -d "$REPO_DIR" ]; then',
      '    echo "🧹 Removing existing repository directory..."',
      '    rm -rf $REPO_DIR',
      'fi',
      '',
      'echo "� Cloning repository (fresh copy)..."',
      'git clone $REPO_URL $REPO_DIR',
      'cd $REPO_DIR',
      '',
      '# Verificar que estamos en la rama main y en el último commit',
      'echo "🔍 Current commit: $(git log --oneline -1)"',
      'echo "📍 Current branch: $(git branch --show-current)"',
      '',
      '# Cambiar al directorio de la API',
      'cd $REPO_DIR/apps/api',
      '',
      '# Instalar dependencias',
      'echo "📦 Installing dependencies..."',
      'npm ci --production',
      '',
      '# Instalar Prisma CLI',
      'npm install prisma --save-dev',
      '',
      '# Remover archivos de infrastructure para evitar conflictos de TypeScript',
      'echo "🧹 Removing infrastructure files to prevent TypeScript conflicts..."',
      'rm -rf infrastructure',
      '',
      '# Construir la aplicación',
      'echo "🔨 Building application..."',
      'npm run build',
      '',
      '# Obtener credenciales de la base de datos desde AWS Secrets Manager',
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
      '# Crear archivo .env para producción',
      'cat > .env << EOL',
      'NODE_ENV=production',
      'PORT=3001',
      'DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:5432/$DB_NAME"',
      'JWT_SECRET="production-jwt-secret-key-32-chars-minimum-asmovie-2025"',
      'JWT_EXPIRES_IN="1h"',
      'API_TOKEN="production-api-token-asmovie-2025"',
      'ALLOWED_ORIGINS="*"',
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
      '# Validar que todas las variables de entorno estén configuradas',
      'echo "🔍 Validating environment variables..."',
      'if [ -z "$DB_USER" ] || [ -z "$DB_PASS" ] || [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ]; then',
      '    echo "❌ Database credentials are missing!"',
      '    exit 1',
      'fi',
      '',
      '# Verificar que el archivo .env se creó correctamente',
      'if [ ! -f ".env" ]; then',
      '    echo "❌ .env file was not created!"',
      '    exit 1',
      'fi',
      '',
      '# Verificar que las variables críticas están en el archivo',
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
      '# Ejecutar migraciones de base de datos',
      'echo "🗄️ Running database migrations..."',
      'npx prisma migrate deploy',
      '',
      '# Generar Prisma Client',
      'echo "🔧 Generating Prisma client..."',
      'npx prisma generate',
      '',
      '# Ejecutar seed de datos',
      'echo "🌱 Seeding database..."',
      'npm run seed',
      '',
      '# Reiniciar la aplicación con PM2',
      'echo "🔄 Starting application with PM2..."',
      'pm2 stop asmovie-api || true',
      'pm2 start npm --name asmovie-api -- run start:prod',
      'pm2 save',
      '',
      'echo "✅ Deployment completed successfully!"',
      'echo "🌐 API is running on port 3001"',
      'echo "🔗 Access via Nginx proxy on port 80"',
      'EOF',

      // Hacer el script ejecutable
      'chmod +x /opt/asmovie/deploy.sh',

      // Configurar PM2 para que se inicie automáticamente
      'sudo -u ec2-user bash -c "cd /home/ec2-user && pm2 startup systemd -u ec2-user --hp /home/ec2-user"',

      // Instalar AWS CLI y jq
      'yum install -y awscli jq',

      // Ejecutar deployment automáticamente
      'echo "🚀 Starting automatic deployment..."',
      'cd /opt/asmovie',
      '',
      '# Configurar git globalmente antes de cualquier operación',
      'git config --global --add safe.directory /opt/asmovie/app || true',
      'git config --global user.email "deploy@asmovie.com" || true',
      'git config --global user.name "Deploy Bot" || true',
      '',
      '# Asegurar que tenemos una copia fresca del repositorio',
      'rm -rf app',
      'echo "📥 Cloning fresh repository copy..."',
      'git clone https://github.com/asumaran/asmovie.git app',
      'cd app',
      '',
      '# Verificar commit actual',
      'echo "🔍 Deploying commit: $(git log --oneline -1)"',
      'echo "📍 Branch: $(git branch --show-current)"',
      'cd app/apps/api',

      // Instalar dependencias
      'echo "📦 Installing dependencies..."',
      'npm ci --production',
      'npm install prisma --save-dev',

      // Remover infrastructure para evitar conflictos de TypeScript
      'echo "🧹 Removing infrastructure files to prevent TypeScript conflicts..."',
      'rm -rf infrastructure',

      // Construir aplicación
      'echo "🔨 Building application..."',
      'npm run build',

      // Crear .env automáticamente
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
      'ALLOWED_ORIGINS="*"',
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

      // Ejecutar migraciones y seed
      'echo "🗄️ Running database migrations..."',
      'npx prisma migrate deploy',
      'echo "🔧 Generating Prisma client..."',
      'npx prisma generate',
      'echo "🌱 Seeding database..."',
      'npm run seed',

      // Iniciar con PM2
      'echo "🔄 Starting application with PM2..."',
      'pm2 stop asmovie-api || true',
      'pm2 delete asmovie-api || true',
      'pm2 start npm --name asmovie-api -- run start:prod',
      'pm2 save',
      '',
      '# Registrar información del deployment',
      'echo "✅ Deployment completed successfully!"',
      'echo "🌐 API is running on port 3001"',
      'echo "🔗 Access via Nginx proxy on port 80"',
      'echo "📝 Deployed commit: $(git log --oneline -1)"',
      'echo "⏰ Deployment time: $(date)"',
      '',
      '# Crear archivo de deployment info',
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

      // Mensaje de finalización
      'echo "✅ Complete automated deployment finished!"',
      'echo "🌐 API is running and accessible"',

      'echo "✅ EC2 instance setup completed!"',
    );

    // Crear la instancia EC2
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
      keyName: 'asmovie-keypair', // Necesitarás crear este key pair
    });

    // Agregar tags para forzar recreación cuando cambie el código
    cdk.Tags.of(webServer).add('DeploymentCommit', currentCommit);
    cdk.Tags.of(webServer).add('DeploymentTime', new Date().toISOString());

    // Outputs útiles
    new cdk.CfnOutput(this, 'WebServerPublicIP', {
      value: webServer.instancePublicIp,
      description: 'Public IP of the web server',
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
      value: `ssh -i ~/.ssh/asmovie-keypair.pem ec2-user@${webServer.instancePublicDnsName}`,
      description: 'SSH command to connect to the server',
    });

    new cdk.CfnOutput(this, 'APIURL', {
      value: `http://${webServer.instancePublicDnsName}`,
      description: 'URL to access the API',
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
