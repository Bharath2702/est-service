"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = require("./database/database");
const index_1 = __importDefault(require("./routes/index"));
const compression_1 = __importDefault(require("compression"));
const body_parser_1 = __importDefault(require("body-parser"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const connect_timeout_1 = __importDefault(require("connect-timeout"));
const os = __importStar(require("os"));
class AppService {
    constructor() {
        this.dbBootstraped = false;
        this.esMigrated = false;
        this.app = (0, express_1.default)();
        this.port = process.env.PORT;
        this.env = process.env.NODE_ENV;
        this.initializeApp();
        // this.initCronJobs();
    }
    initializeApp() {
        this.app.use((0, cors_1.default)({ origin: 'http://localhost:9001' }));
        // Set a timeout for incoming requests (5 minutes)
        this.app.use((0, connect_timeout_1.default)('5m'));
        // Set a timeout for response processing (5 minutes)
        this.app.use((req, res, next) => {
            req.setTimeout(300000); // Timeout for request
            res.setTimeout(300000, () => {
                console.error(`Request timed out: ${req.url}`);
                res.status(504).send('Request timed out');
            });
            next();
        });
        this.app.use('/api/v1', index_1.default);
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use(body_parser_1.default.json({ limit: "50mb" }));
        console.log(1138 * 100);
    }
    initDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                database_1.sequelize.sync()
                    .then((data) => {
                    this.dbBootstraped = true;
                    console.log('connected to database');
                })
                    .catch((err) => console.log(err));
            }
            catch (e) {
                console.log({
                    message: e.message,
                    stack: e.stack,
                });
                console.log('Error bootstraping the database.');
                this.app.set('HEALTH_STATUS', 'DB_MIGRATION_FAILED');
                return Promise.reject(e);
            }
        });
    }
    initCronJobs() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //   const cronJob = cron.schedule('0 0 */4 * * *', async function() {
                //     await cronJobs.syncActivities();
                //     console.log('Process running every 4 hours');
                //   });
                //   cronJob.start();
            }
            catch (e) {
                console.log({
                    message: e.message,
                });
            }
        });
    }
    init() {
        console.log('Initializing backend-app');
        const { PORT, NODE_ENV, } = process.env;
        // ENV Argument Checks
        if (!PORT || !NODE_ENV) {
            const msg = 'Configuration Error: you must specify these ENV variables: PORT, NODE_ENV';
            console.log(msg);
            throw new Error(msg);
        }
        this.port = PORT;
        this.env = NODE_ENV;
    }
    // eslint-disable-next-line complexity
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const DOCKER_HOST = '0.0.0.0';
            this.server = http_1.default.createServer(this.app);
            this.server.listen(this.port, DOCKER_HOST, (err) => {
                if (err) {
                    this.app.set('HEALTH_STATUS', 'SERVER_LISTEN_FAILED');
                    throw err;
                }
                let localIp = 'localhost';
                if (this.env === 'development') {
                    const interfaces = os.networkInterfaces();
                    for (const name of Object.keys(interfaces)) {
                        for (const iface of interfaces[name] || []) {
                            if (iface.family === 'IPv4' && !iface.internal) {
                                localIp = iface.address;
                                break;
                            }
                        }
                    }
                }
                console.log(`Local:    http://localhost:${this.port}`);
                console.log(`Network:  http://${localIp}:${this.port}`);
            });
            if (!this.dbBootstraped) {
                yield this.initDB();
            }
            this.app.set('HEALTH_STATUS', 'READY');
            console.log('Initialization successful. Service is Ready.');
            // Shutdown Hook
            process.on('SIGTERM', () => {
                this.stop();
            });
            process.on('unhandledRejection', (e) => {
                console.log({
                    message: e.message,
                    stack: e.stack,
                });
                console.log('Error due to unhandledRejection.');
            });
            console.log('backend-svc: Server started!');
            return Promise.resolve();
        });
    }
    /**
     * Closes the connection and exits with status code 0 after 3000 ms.
     * Sets HEALTH_STATUS to SHUTTING_DOWN while in progress
     *
     * @memberof Service
     */
    stop() {
        console.log('Starting graceful shutdown...');
        this.app.set('HEALTH_STATUS', 'SHUTTING_DOWN');
        // LoadingDock.readShutdown();
        setTimeout(() => {
            this.app.close(() => {
                console.log('Shutdown Complete.');
                process.exit(0);
            });
        }, 3000);
    }
    shouldCompress(req, res) {
        if (req.headers['x-no-compression']) {
            // don't compress responses with this request header
            return false;
        }
        // fallback to standard filter function
        return compression_1.default.filter(req, res);
    }
}
exports.default = AppService;
