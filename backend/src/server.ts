import app from './app';
import { env } from './config/env';
import prisma from './config/database';

const PORT = env.PORT;

async function main() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`
🚀 1Fi LMS Server is running!
📍 Port: ${PORT}
🌍 Environment: ${env.NODE_ENV}
📚 API Docs: http://localhost:${PORT}/health
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

main();
