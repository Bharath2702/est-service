import Sequelize from 'sequelize';
import { sequelize } from '../database';

const User = sequelize.define("users", {
	id: {
		type: Sequelize.UUID,
		defaultValue: Sequelize.UUIDV4,
		allowNull: false,
		primaryKey: true,
		unique: true
	},
	code: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: false
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: false
	},
	userName: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	mobileNumber: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	email: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: false
	},
	designationCode: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: false
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue:true
	  },
	salt: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: false
	},
	createdAt: {
		allowNull: true,
		type: Sequelize.DATE
	},
	updatedAt: {
		allowNull: true,
		type: Sequelize.DATE
	}
},
	{
		collate:'utf8mb4_general_ci',
		timestamps: true,
		tableName:'users'
	});

export default User;

