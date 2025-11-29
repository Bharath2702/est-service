"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const user_1 = __importDefault(require("./user"));
const express_1 = require("express");
const jsonParser = body_parser_1.default.json({ limit: "50mb" });
const router = (0, express_1.Router)();
router.use('/user', jsonParser, user_1.default);
router.get('/userMaster', (req, res, next) => {
    try {
        return res.status(200).send({
            success: true,
            message: 'Welcome to the User Service!',
        });
    }
    catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Something went wrong in User master'
        });
    }
});
exports.default = router;
