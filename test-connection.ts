import { createConnection } from 'typeorm';

async function testConnection() {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    console.log('✓ Database connection successful!');
    console.log('Connection Details:', {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || '5432',
      database: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USER,
    });
    await connection.close();
  } catch (error) {
    console.error('✗ Database connection failed:', error);
  }
}

testConnection();
