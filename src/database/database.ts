import { Sequelize } from 'sequelize';

let database = process.env.database;
let user = process.env.user;
let port = typeof(process.env.db_port) == 'number' ? process.env.db_port : 0;

const sequelize = new Sequelize(
    `${database}`,
    `${user}`,
    process.env.password,
    {
        dialect: 'mysql',
        host: process.env.host,
        port: port,
        logging: false,
        timezone: '+05:30' //for writing to database
    },

);
export { sequelize }