"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
// src/utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload) => {
    const raw = process.env.JWT_EXPIRES_IN ?? "1d";
    // Cast to the exact type expected by jsonwebtoken v9
    const expiresIn = raw;
    const options = {
        expiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyToken = verifyToken;
