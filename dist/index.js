"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const os_1 = __importDefault(require("os"));
const app = (0, express_1.default)();
// ----------------------------------------------------
// Get Local IPv4 Address for CORS & Local Development
// ----------------------------------------------------
function getLocalIP() {
    const nets = os_1.default.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }
    return "localhost";
}
const localIp = getLocalIP();
// -----------------------
// Middlewares
// -----------------------
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        `http://${localIp}:3000`,
        `http://${localIp}:5173`,
    ],
    credentials: true,
}));
// -----------------------
// Test Route
// -----------------------
app.get("/", (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Backend API running successfully 💯",
            localIp,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.default = app;
