"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../lib/utils");
const sequelize_1 = __importDefault(require("sequelize"));
const Users_1 = __importDefault(require("../database/models/Users"));
const Op = sequelize_1.default.Op;
const { Validator } = require("node-input-validator");
class UserController {
    constructor() { }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const validatorRules = {
                    id: "required|nullable",
                    code: "required",
                    name: "required",
                    userName: "required",
                    mobileNumber: "required|numeric|minLength:10|maxLength:10",
                    email: "email",
                    password: "required|nullable",
                    designationCode: "required|string",
                    reportingId: "required|string|nullable",
                    roles: "required|array",
                    active: "required|nullable",
                };
                const v = new Validator(payload, validatorRules);
                const matched = yield v.check();
                if (!matched) {
                    res.status(422).send(v.errors);
                }
                else {
                    if (payload.id === null || payload.id === undefined) {
                        Users_1.default.findOne({
                            where: {
                                [Op.or]: [
                                    { code: payload.code },
                                    { userName: payload.userName },
                                    { mobileNumber: payload.mobileNumber },
                                    { email: payload.email },
                                ],
                            },
                        })
                            .then((userFound) => __awaiter(this, void 0, void 0, function* () {
                            let userPwd = null;
                            if (req.body.password === null || req.body.password === "") {
                                userPwd = "Test@123";
                            }
                            else {
                                userPwd = req.body.password;
                            }
                            const saltHash = utils.genPassword(userPwd);
                            if (!userFound) {
                                let user = {
                                    code: payload.code,
                                    name: payload.name,
                                    mobileNumber: payload.mobileNumber,
                                    userName: payload.userName,
                                    email: payload.email,
                                    password: saltHash.hash,
                                    designationCode: payload.designationCode,
                                    salt: saltHash.salt,
                                    active: payload.active,
                                };
                                const newUser = yield Users_1.default.create(user);
                                newUser
                                    .save()
                                    .then((newUsers) => __awaiter(this, void 0, void 0, function* () {
                                    return res.json({
                                        success: true,
                                        message: "Successfully Registered!",
                                    });
                                }))
                                    .catch((err) => {
                                    return res
                                        .status(500)
                                        .json({ success: false, message: err });
                                });
                            }
                            else {
                                return res.status(200).json({
                                    success: false,
                                    message: "User Already Exists Please Login",
                                });
                            }
                        }))
                            .catch((err) => {
                            return res.status(500).json({ success: false, message: err });
                        });
                    }
                    else {
                        Users_1.default.findOne({
                            where: {
                                id: {
                                    [Op.not]: payload.id,
                                },
                                [Op.or]: [
                                    { code: payload.code },
                                    { userName: payload.userName },
                                    { mobileNumber: payload.mobileNumber },
                                    { email: payload.email },
                                ],
                            },
                        }).then((userFound) => __awaiter(this, void 0, void 0, function* () {
                            if (!userFound) {
                                let userPwd = false;
                                if (req.body.password === null || req.body.password === "") {
                                    userPwd = false;
                                }
                                else {
                                    userPwd = true;
                                }
                                let user = {
                                    code: payload.code,
                                    name: payload.name,
                                    mobileNumber: payload.mobileNumber,
                                    userName: payload.userName,
                                    email: payload.email,
                                    designationCode: payload.designationCode,
                                    active: payload.active,
                                };
                                if (userPwd) {
                                    const saltHash = utils.genPassword(req.body.password);
                                    user = {
                                        code: payload.code,
                                        name: payload.name,
                                        mobileNumber: payload.mobileNumber,
                                        userName: payload.userName,
                                        email: payload.email,
                                        password: saltHash.hash,
                                        designationCode: payload.designationCode,
                                        salt: saltHash.salt,
                                        active: payload.active,
                                    };
                                }
                                try {
                                    // Corrected update syntax
                                    yield Users_1.default.update(user, { where: { id: payload.id } });
                                    return res.status(200).json({
                                        success: true,
                                        message: "User Updated Successfully",
                                    });
                                }
                                catch (err) {
                                    return res.status(500).json({ success: false, message: err });
                                }
                            }
                            else {
                                let exists = [];
                                if (userFound.code === payload.code) {
                                    exists.push("Code");
                                }
                                if (userFound.userName === payload.userName) {
                                    exists.push("Username");
                                }
                                if (userFound.mobileNumber === payload.mobileNumber) {
                                    exists.push("Mobile Number");
                                }
                                if (userFound.email === payload.email) {
                                    exists.push("Email");
                                }
                                let text = exists.join(", ");
                                return res.status(200).json({
                                    success: false,
                                    message: `Values already exist: ${text}`,
                                });
                            }
                        }));
                    }
                }
            }
            catch (err) {
                return res.status(500).json({ success: false, message: err });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const validatorRules = {
                    userName: "required",
                    password: "string",
                };
                const v = new Validator(payload, validatorRules);
                const matched = yield v.check();
                if (!matched) {
                    res.status(422).send(v.errors);
                }
                else {
                    Users_1.default.findOne({
                        where: {
                            [Op.or]: [
                                { userName: payload.userName },
                                { mobileNumber: payload.userName },
                                { email: payload.userName },
                            ],
                        },
                    })
                        .then((user) => __awaiter(this, void 0, void 0, function* () {
                        if (!user) {
                            // No user found with the provided username
                            return res
                                .status(200)
                                .json({ success: false, message: "Username is incorrect" });
                        }
                        // Check if the password is correct
                        const isValidPassword = utils.validPassword(req.body.password, user.password, user.salt);
                        if (isValidPassword) {
                            // Both username and password are correct
                            let roleArray = [];
                            let permission = [];
                            const tokenObject = utils.issueJWT(user);
                            let response = {
                                success: true,
                                message: "Login successfully",
                                user: user,
                                expiresIn: tokenObject.expires,
                                roles: roleArray,
                                permissions: permission,
                                token: tokenObject.token,
                            };
                            return res.status(200).json(response);
                        }
                        else {
                            // Password is incorrect
                            return res
                                .status(200)
                                .json({ success: false, message: "Password is incorrect" });
                        }
                    }))
                        .catch((err) => {
                        throw err;
                    });
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = utils.inValidateToken(req.headers["authorization"]);
                if (result) {
                    return res.status(200).json({
                        success: true,
                        messgae: "You have been logged out",
                    });
                }
                else {
                    return res.status(500).json({
                        success: false,
                        messgae: "OOPS! Something went wrong",
                    });
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
}
const userController = new UserController();
exports.default = userController;
