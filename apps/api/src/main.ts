import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
  console.log(
    'Hello World from NestJS API running on http://localhost:3001 🚀',
  );
}
void bootstrap();
