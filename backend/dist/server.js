"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = __importDefault(require("./config/database"));
const PORT = env_1.env.PORT;
async function main() {
    try {
        // Test database connection
        await database_1.default.$connect();
        console.log('✅ Database connected successfully');
        // Start server
        app_1.default.listen(PORT, () => {
            console.log(`
🚀 1Fi LMS Server is running!
📍 Port: ${PORT}
🌍 Environment: ${env_1.env.NODE_ENV}
📚 API Docs: http://localhost:${PORT}/health
      `);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        await database_1.default.$disconnect();
        process.exit(1);
    }
}
// Handle shutdown gracefully
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await database_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await database_1.default.$disconnect();
    process.exit(0);
});
main();
//# sourceMappingURL=server.js.map