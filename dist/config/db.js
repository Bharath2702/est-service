"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.connectDB = connectDB;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: console.log, // show SQL logs like office
});
async function connectDB() {
    try {
        await exports.sequelize.authenticate();
        console.log("🔥 MySQL Connected via Sequelize");
        // Sync models automatically (optional)
        await exports.sequelize.sync({ alter: false });
    }
    catch (error) {
        console.error("❌ DB Connection Error:", error);
        process.exit(1);
    }
}
