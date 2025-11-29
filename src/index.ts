require('dotenv').config()


import AppService from './server';


const service = new AppService();

if (require.main && (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'uat')) {
    service.start();
} else {
    console.error('Server not started.');
}

export const port = process.env.PORT;
export const app = service.app;
