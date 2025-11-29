"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.port = void 0;
require('dotenv').config();
const server_1 = __importDefault(require("./server"));
const service = new server_1.default();
if (require.main && (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'uat')) {
    service.start();
}
else {
    console.error('Server not started.');
}
exports.port = process.env.PORT;
exports.app = service.app;
