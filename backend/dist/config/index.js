"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.env = void 0;
var env_1 = require("./env");
Object.defineProperty(exports, "env", { enumerable: true, get: function () { return env_1.env; } });
var database_1 = require("./database");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return __importDefault(database_1).default; } });
//# sourceMappingURL=index.js.map