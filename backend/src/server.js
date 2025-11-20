/**
 * ALIVE Advertising Backend - Server Entry Point
 * This file starts the Express server and handles initialization
 */

import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables
dotenv.config();

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// DATABASE CONNECTION CHECK
// ============================================

// NOTE: Prisma client requires `npx prisma generate` to be run first
// Uncomment this section once Prisma client is generated

// import pkg from '@prisma/client';
// const { PrismaClient } = pkg;
// const prisma = new PrismaClient();

/**
 * Check database connection
 */
async function checkDatabaseConnection() {
  // TODO: Implement database connection check once Prisma client is generated
  console.log('⚠ Database connection check skipped (Prisma client not generated yet)');
  console.log('ℹ Run `npm run prisma:generate` after setting up your database');
  return true;

  // Uncomment this once Prisma client is available:
  // try {
  //   await prisma.$connect();
  //   console.log('✓ Database connected successfully');
  //   return true;
  // } catch (error) {
  //   console.error('✗ Database connection failed:', error.message);
  //   console.error('Make sure DATABASE_URL is set correctly in .env');
  //   return false;
  // }
}

// ============================================
// SERVER STARTUP
// ============================================

/**
 * Start the server
 */
async function startServer() {
  try {
    // Check database connection first
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected && NODE_ENV === 'production') {
      console.error('Cannot start server without database in production');
      process.exit(1);
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('================================================');
      console.log('🚀 ALIVE Advertising Backend');
      console.log('================================================');
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoint: http://localhost:${PORT}/api`);
      console.log('================================================');
      console.log('');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`✗ Port ${PORT} is already in use`);
      } else {
        console.error('✗ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✓ HTTP server closed');

        // Disconnect Prisma (uncomment once Prisma client is available)
        // await prisma.$disconnect();
        // console.log('✓ Database disconnected');

        console.log('✓ Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('✗ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

// ============================================
// HANDLE UNCAUGHT EXCEPTIONS
// ============================================

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error('Reason:', reason);
  process.exit(1);
});

// ============================================
// START THE SERVER
// ============================================

startServer();
