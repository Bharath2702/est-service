"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
let database = process.env.database;
let user = process.env.user;
let port = typeof (process.env.db_port) == 'number' ? process.env.db_port : 0;
const sequelize = new sequelize_1.Sequelize(`${database}`, `${user}`, process.env.password, {
    dialect: 'mysql',
    host: process.env.host,
    port: port,
    logging: false,
    timezone: '+05:30' //for writing to database
});
exports.sequelize = sequelize;
