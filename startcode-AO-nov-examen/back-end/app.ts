import * as dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { expressjwt } from 'express-jwt';
import { userRouter } from './controller/user.routes';
import helmet from 'helmet';
import { teacherRouter } from './controller/teacher.routes';
import { classroomRouter } from './controller/classroom.routes';
import path from "path";
import fs from 'fs';
import http from 'http';
import https from 'https';
import { logger } from './util/logger';
import { authLimiter, createAccountLimiter } from './util/rate_limiter';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
app.use(cookieParser());

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "../certs/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../certs/cert.pem")),
    minVersion: "TLSv1.2" as const,
    honorCipherOrder: true
};

app.disable('x-powered-by');

app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'", "https://localhost:4000"],
                "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com"],
                "img-src": ["'self'","https://localhost:4000"],
                "connect-src": ["'self'", "https://localhost:3000", "https://localhost:3000"],
                "frame-ancestors": ["'self'"],
                "form-action": ["'self'"]
            },
        }
    })
)

app.use(
  helmet.hsts({
    maxAge: 63072000,
    includeSubDomains: true,
    preload: false,
  })
);

const port = process.env.APP_PORT || 3000;
const httpport = process.env.APP_PORT || 3001;

app.use(cors({
  origin: 'https://localhost:4000',
  credentials: true
}));

app.use(bodyParser.json());

app.use(['/users/register'], createAccountLimiter);
app.use(['/users/login'], authLimiter );

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET missing. Exiting.");
  process.exit(1);
}

app.use(
    expressjwt({
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256'],
    }).unless({
        path: [
            '/api-docs',
            /^\/api-docs\/.*/,
            '/users/login',
            '/users/login-verify',
            '/users/register',
            '/users/reset-request',
            '/users/reset-confirm',
            '/users/verify',
            '/status',
            '/teachers',
            /^\/teachers\/.*/,
            '/users',
        ],
    })
);

app.use('/teachers', teacherRouter);
app.use('/users', userRouter);
app.use('/classrooms', classroomRouter);

app.get('/status', (req, res) => {
    res.json({ message: 'Exam API is running...' });
});

const swaggerOpts = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Exam API',
            version: '1.0.0',
        },
    },
    apis: ['./controller/*.routes.ts'],
};
const swaggerSpec = swaggerJSDoc(swaggerOpts);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {

    logger.error(`Error: ${err.message} | URL: ${req.url}`);

    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ status: 'unauthorized', message: "Unauthorized error"});
    } else if (err.name === 'ClassesError') {
        res.status(400).json({ status: 'domain error', message: err.message });
    } else {
        res.status(400).json({ status: 'application error', message: "There was an error" });
    }
});

https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`Exam API (https) is running on port ${port}.`);
});

http.createServer((req, res) => {
    const host = req.headers['host'] || `localhost:${httpport}}`;
    res.writeHead(301, { "Location": `https://${host}${req.url}` });
    res.end();
}).listen(httpport, () => {
    console.log(`Exam API (http) redirector running on port ${httpport}.`);
});