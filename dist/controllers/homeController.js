"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HomeController {
    async home(req, res) {
        try {
            res.json({ message: "OK" });
        }
        catch (error) {
            res.status(500).json({ error });
        }
    }
}
exports.default = new HomeController();
