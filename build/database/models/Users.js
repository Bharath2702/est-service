"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = require("../database");
const User = database_1.sequelize.define("users", {
    id: {
        type: sequelize_1.default.UUID,
        defaultValue: sequelize_1.default.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    code: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: false
    },
    name: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: false
    },
    userName: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: true
    },
    mobileNumber: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: false
    },
    designationCode: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: false
    },
    active: {
        type: sequelize_1.default.BOOLEAN,
        defaultValue: true
    },
    salt: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: false
    },
    createdAt: {
        allowNull: true,
        type: sequelize_1.default.DATE
    },
    updatedAt: {
        allowNull: true,
        type: sequelize_1.default.DATE
    }
}, {
    collate: 'utf8mb4_general_ci',
    timestamps: true,
    tableName: 'mdm_users'
});
exports.default = User;
