"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const users_1 = __importDefault(require("../database/models/users"));
class AuthController {
    // POST /api/auth/register
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: "Name, email and password are required" });
            }
            // check existing email
            const existing = await users_1.default.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({ success: false, message: "Email already registered" });
            }
            // hash password
            const hashed = await bcrypt_1.default.hash(password, 10);
            // create user
            const user = await users_1.default.create({ name, email, password: hashed });
            return res.status(201).json({
                success: true,
                message: "Registered successfully",
                user: { id: user.id, name: user.name, email: user.email }
            });
        }
        catch (err) {
            console.error("AuthController.register error:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }
    // POST /api/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: "Email and password are required" });
            }
            // find user
            const user = await users_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }
            // compare password
            const match = await bcrypt_1.default.compare(password, user.getDataValue("password"));
            if (!match) {
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }
            // generate token
            const token = (0, jwt_1.generateToken)({ userId: user.id });
            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
                user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar ?? null }
            });
        }
        catch (err) {
            console.error("AuthController.login error:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }
}
exports.default = new AuthController();
