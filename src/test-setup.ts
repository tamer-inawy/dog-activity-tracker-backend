import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

export async function createTestingModule(
  providers: any[] = [],
  imports: any[] = [],
) {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
        isGlobal: true,
      }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER || 'test_user',
        password: process.env.DATABASE_PASSWORD || 'test_password',
        database: process.env.DATABASE_NAME || 'test_db',
        entities: ['src/**/*.entity.ts'],
        synchronize: true,
        dropSchema: true,
      }),
      ...imports,
    ],
    providers,
  }).compile();

  return module;
}
