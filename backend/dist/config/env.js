"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    // Server
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    // API Key
    API_KEY_SALT: process.env.API_KEY_SALT || 'default-salt',
    // Helpers
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};
//# sourceMappingURL=env.js.map