import { createAccountLimiter, authLimiter } from '../util/rate_limiter';
import { validatePassword } from '../util/password_validator';
import express, { NextFunction, Request, Response } from 'express';
import userService from '../service/user.service';
import { LoginRequestResponse, UserInput } from '../types/index';
import { logEvent } from '../util/logging'; 
import userDb from '../repository/user.db';
import { generateJwtToken, verifyJwt } from '../util/jwt';

/**
 * @swagger
 *   components:
 *    securitySchemes:
 *     bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *    schemas:
 *      AuthenticationResponse:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              description: Authentication response.
 *            token:
 *              type: string
 *              description: JWT access token.
 *            username:
 *              type: string
 *              description: User name.
 *            fullname:
 *             type: string
 *             description: Full name.
 *      AuthenticationRequest:
 *          type: object
 *          properties:
 *            username:
 *              type: string
 *              description: User name.
 *            password:
 *              type: string
 *              description: User password.
 *      User:
 *          type: object
 *          properties:
 *            id:
 *              type: number
 *              format: int64
 *            username:
 *              type: string
 *              description: User name.
 *            password:
 *              type: string
 *              description: User password.
 *            firstName:
 *              type: string
 *              description: First name.
 *            lastName:
 *              type: string
 *              description: Last name.
 *            email:
 *              type: string
 *              description: E-mail.
 *            role:
 *               $ref: '#/components/schemas/Role'
 *      UserInput:
 *          type: object
 *          properties:
 *            username:
 *              type: string
 *              description: User name.
 *            password:
 *              type: string
 *              description: User password.
 *            firstName:
 *              type: string
 *              description: First name.
 *            lastName:
 *              type: string
 *              description: Last name.
 *            email:
 *              type: string
 *              description: E-mail.
 *            role:
 *               $ref: '#/components/schemas/Role'
 *      Role:
 *          type: string
 *          enum: [student, teacher, admin]
 */

const userRouter = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get the list of users
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/User'
 */
userRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *      summary: Login using username/password. Returns an object with JWT token and user name when succesful.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AuthenticationRequest'
 *      responses:
 *         200:
 *            description: The created user object
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/AuthenticationResponse'
 */
userRouter.post("/login", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, rememberMe } = req.body;

    try {
        logEvent("LOGIN_ATTEMPT", {
            message: `Login attempt for user ${username}`,
            user: username,
            ip: req.ip,
            url: req.originalUrl,
            status: "attempt"
        });

        const loginResponse = await userService.authenticate(
            { username, password },
            false
        );

        if (loginResponse.requiresMfa) {
            logEvent("REQUIRED_MFAA", {
                message: `MFA required for ${username}`,
                user: username,
                ip: req.ip,
                url: req.originalUrl,
                status: "pending"
            });
            return res.status(200).json(loginResponse);
        }

        const maxAge = rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 2 * 60 * 60 * 1000;

        res.cookie("auth_token", loginResponse.token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge
        });

        logEvent("SUCCESS_LOGIN", {
            message: `Login successful for ${username}`,
            user: username,
            ip: req.ip,
            url: req.originalUrl,
            status: "success"
        });

        return res.status(200).json(loginResponse);

    } catch (err: any) {
        logEvent("FAIL_LOGIN", {
            message: `Failed login for ${username}: ${err.message}`,
            user: username,
            ip: req.ip,
            url: req.originalUrl,
            status: "failure"
        });

        next(err);
    }
});

userRouter.post("/login-verify", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, code, rememberMe } = req.body;

    const mfaResponse = await userService.verifyMfa(username, code);

    const maxAge = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 2 * 60 * 60 * 1000;

    const token = generateJwtToken(
      { username: mfaResponse.username, role: mfaResponse.role },
      { expiresInMs: maxAge }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge,
    });

    return res.status(200).json({
      requiresMfa: false,
      message: "Login successful",
    } as LoginRequestResponse);
  } catch (err) {
    next(err);
  }
});

userRouter.post('/register', createAccountLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userInput = <UserInput>req.body;
        const { valid, details } = validatePassword(userInput.password);
        if (!valid) {
            return res.status(400).json({ status: 'error', message: 'Password does not meet requirements', details });
        }

        const user = await userService.createUser(userInput);
        res.status(201).json({ message: 'User created. Please check your email to verify your account.', username: user.username });
        logEvent("Registration", {
          message: `Registration of new user ${userInput.username}`,
          user: userInput.username,
          ip: req.ip,
          url: req.originalUrl,
          status: "attempt"
        });
    } catch (error) {
        next(error);
    }
});

userRouter.get('/verify', async (req, res, next) => {
    try {
        const token = req.query.token as string;
        if (!token) {
            logEvent("FAIL_VERIFICATION", {
              message: `Failed verification - missing token`,
              user: "unknown",
              ip: req.ip,
              url: req.originalUrl,
              status: "failure"
            });
            return res.status(400).json({ message: 'Missing token' });
        }
        const user = await userService.verifyUser(token);
        res.json({ message: 'Email verified. You can log in now.' });
        logEvent("SUCCESS_VERIFICATION", {
              message: `Succesful verification of user ${user.username}`,
              user: user.username,
              ip: req.ip,
              url: req.originalUrl,
              status: "success"
        });
    } catch (err) {
        next(err);
    }
});

userRouter.post('/reset-request', async (req, res, next) => {
  try {
    const { email } = req.body;
    await userService.PasswordResetRequest(email);
    const user = await userDb.getUserByEmail(email);
    logEvent("REQUEST_RESET", {
              message: `Request reset password for user ${user.username}`,
              user: user.username,
              ip: req.ip,
              url: req.originalUrl,
              status: "request"
    });
    res.json({ message: "If this email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
});

userRouter.post('/reset-confirm', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const { valid, details } = validatePassword(password);
    if (!valid) {
        return res.status(400).json({ status: 'error', message: 'Password does not meet requirements', details });
    }
    const user = await userDb.getUserByResetToken(token);
    await userService.resetPassword(token, password);
    logEvent("SUCCESS_RESET", {
              message: `Successful reset password for user ${user.username}`,
              user: user.username,
              ip: req.ip,
              url: req.originalUrl,
              status: "success"
    });
    res.status(201).json({ message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
});

userRouter.post("/logout", (req, res) => {
  res.cookie("auth_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(0)
  });

  res.status(200).json({ message: "Logged out successfully" });
});

export { userRouter };
