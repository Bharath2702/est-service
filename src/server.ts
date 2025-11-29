
import express from 'express';
import morgan from 'morgan';
import { sequelize } from './database/database';
import routes from './routes/index';
import passport from 'passport';
import compression from 'compression';
import bodyParser from 'body-parser';
import fs from 'fs';
import http from 'http';
import path from 'path';
import cors from 'cors';
import cron from 'node-cron';
import timeout from 'connect-timeout';
import * as os from 'os';

class AppService {

  public dbBootstraped = false;
  public esMigrated = false;
  public app: any;
  public port: any;
  public env: any;
  public server: any;

  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.env = process.env.NODE_ENV;
    this.initializeApp();
    // this.initCronJobs();
  }

  public initializeApp() {
    this.app.use(cors({ origin: 'http://localhost:9001' }));
    // Set a timeout for incoming requests (5 minutes)
    this.app.use(timeout('5m'));
 
    // Set a timeout for response processing (5 minutes)
    this.app.use((req: any, res: any, next: any) => {
      req.setTimeout(300000); // Timeout for request
      res.setTimeout(300000, () => { // Timeout for response
        console.error(`Request timed out: ${req.url}`);
        res.status(504).send('Request timed out');
      });
      next();
    });
    this.app.use('/api/v1', routes);
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use(bodyParser.json({ limit: "50mb" }));
    console.log(1138 * 100);
  }

  public async initDB() {
    try {
      sequelize.sync()
        .then((data: any) => {
          this.dbBootstraped = true;
          console.log('connected to database')
        })
        .catch((err: any) => console.log(err))
    } catch (e: any) {
      console.log({
        message: e.message,
        stack: e.stack,
      })
      console.log('Error bootstraping the database.');
      this.app.set('HEALTH_STATUS', 'DB_MIGRATION_FAILED');
      return Promise.reject(e);
    }
  }


  public async initCronJobs() {
    try {
    //   const cronJob = cron.schedule('0 0 */4 * * *', async function() {
    //     await cronJobs.syncActivities();
    //     console.log('Process running every 4 hours');
    //   });
    //   cronJob.start();
    }
    catch (e: any) {
      console.log({
        message: e.message,
      })
    }
  }




  public init() {
    console.log('Initializing backend-app');
    const {
      PORT,
      NODE_ENV,
    } = process.env;

    // ENV Argument Checks
    if (!PORT || !NODE_ENV) {
      const msg =
        'Configuration Error: you must specify these ENV variables: PORT, NODE_ENV';
      console.log(msg);
      throw new Error(msg);
    }

    this.port = PORT;
    this.env = NODE_ENV;
  }

  // eslint-disable-next-line complexity


  public async start() {
   const DOCKER_HOST = '0.0.0.0';
   this.server = http.createServer(this.app);
    this.server.listen(this.port, DOCKER_HOST, (err: any) => {
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
      await this.initDB();
    }

    this.app.set('HEALTH_STATUS', 'READY');
    console.log('Initialization successful. Service is Ready.');

    // Shutdown Hook
    process.on('SIGTERM', () => {
      this.stop();
    });
    process.on('unhandledRejection', (e: any) => {
      console.log({
        message: e.message,
        stack: e.stack,
      })
      console.log('Error due to unhandledRejection.');
    });

    console.log('backend-svc: Server started!');
    return Promise.resolve();
  }

  /**
   * Closes the connection and exits with status code 0 after 3000 ms.
   * Sets HEALTH_STATUS to SHUTTING_DOWN while in progress
   *
   * @memberof Service
   */
  public stop() {
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

  public shouldCompress(req: any, res: any) {
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false;
    }
    // fallback to standard filter function
    return compression.filter(req, res);
  }
}

export default AppService;


