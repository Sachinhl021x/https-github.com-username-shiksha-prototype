import { app, redisClient } from './app';

const PORT = process.env.PORT || 5000;

// Connect to Redis and start server
async function startServer() {
    try {
        // Connect to Redis
        await redisClient.connect();
        console.log('✅ Redis connected successfully');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await redisClient.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await redisClient.disconnect();
    process.exit(0);
});

// Start the server
startServer();