import 'dotenv/config';
import app from './app.js';
import prisma from './config/database.js';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await prisma.$connect;
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect;
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect;
  process.exit(0);
});

start();
