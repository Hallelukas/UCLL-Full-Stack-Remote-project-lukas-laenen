import bcrypt from 'bcrypt';
import { User } from '../model/user';
import userDB from '../repository/user.db';
import { LoginRequestResponse, UserInput } from '../types';
import { generateJwtToken } from '../util/jwt';
import { generateToken, hashToken, generateMfaCode, hash, compareHash } from '../util/tokens';
import { sendMail } from "../util/mail";
import database from '../util/database';
import { logEvent } from "../util/logging";



const getAllUsers = async (): Promise<User[]> => userDB.getAllUsers();

const getUserByUsername = async ({ username }: { username: string }): Promise<User> => {
    const user = await userDB.getUserByUsername({ username });
    if (!user) {
        throw new Error(`User with username: ${username} does not exist.`);
    }
    return user;
};

const authenticate = async ({ username, password }: UserInput, skipMfa = false): Promise<LoginRequestResponse> => {
    const user = await getUserByUsername({ username });

    if (!user.isVerified) {
        logEvent("FAIL_LOGIN", {
              message: `Failed login by ${user.username} - unverified`,
              user: user.username,
              status: "request"
        });
        throw new Error("Please verify your email first.");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        logEvent("FAIL_LOGIN", {
              message: `Failed login by ${user.username} - password incorrect`,
              user: user.username,
              status: "request"
        });
        throw new Error('Incorrect password.');
    }

    if (skipMfa) {
        const token = generateJwtToken({
            username: user.username,
            role: user.role
        });

        return {
            requiresMfa: false,
            message: "Login successful",
            token,
        };
    }

    const mfa = generateMfaCode();
    const mfaHash = await hash(mfa);
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await userDB.saveMfaCode(username, mfaHash, expires);

    await sendMail({
        to: user.email,
        subject: "Login code",
        html: `
            <h1>Exam App</h1>
            <p>Your login code is: ${mfa}. It expires in 5 minutes.
            `,
    });

    return {
        message: 'MFA code sent to email',
        requiresMfa: true
    } as LoginRequestResponse;
};

const verifyMfa = async (username: string, code: string) => {
    const user = await userDB.getUserByUsername({ username });
    if (!user) {
        logEvent("FAIL_LOGIN", {
              message: `Failed login by ${user.username} - user not found`,
              user: user.username,
              status: "request"
        });
        throw new Error('User not found');
    }

    if (!user.mfaCode || !user.mfaExpires) {
        logEvent("FAIL_LOGIN", {
              message: `Failed login by ${user.username} - no mfa`,
              user: user.username,
              status: "request"
        });
        throw new Error('No MFA request pending');
    }

    if (new Date() > user.mfaExpires) {
        logEvent("FAIL_LOGIN", {
              message: `Failed login by ${user.username} - mfa expired`,
              user: user.username,
              status: "request"
        });
        throw new Error('MFA code expired');
    }
    
    const storedMfaHash = user.mfaCode?.toString().trim();
    const trimmedCode = code.trim();
    const isMatch = await compareHash(trimmedCode, storedMfaHash);

    if (!isMatch) {
        logEvent("FAIL_LOGIN", {
              message: `Failed login by ${user.username} - mfa code incorrect`,
              user: user.username,
              status: "request"
        });
        throw new Error('Invalid MFA code');
    }
    
    await userDB.saveMfaCode(username, null, null);

    const token = generateJwtToken({
        username,
        role: user.role
    });

    logEvent("SUCCESS_LOGIN", {
              message: `Successful login by ${user.username}`,
              user: user.username,
              status: "request"
        });

    return {
        token,
        username: user.username,
        fullname: `${user.firstName} ${user.lastName}`,
        role: user.role
    };
};

const createUser = async ({
    username,
    password,
    firstName,
    lastName,
    email,
    role
    }: UserInput): Promise<User> => {
    const existingUser = await userDB.getUserByUsername({ username });

    if (existingUser) {
        logEvent("FAIL_REGISTRATION", {
              message: `Failed registration - username exists`,
              user: existingUser.username,
              status: "request"
        });
        throw new Error(`Unable to register user at this time.`);
    }

    const hashedPassword = await hash(password);
    const verificationToken = generateToken();
    const verificationTokenHash = await hashToken(verificationToken);
    
    const user = new User({ 
        username, 
        password: hashedPassword, 
        firstName, 
        lastName, 
        email, 
        role,
        verificationToken: verificationTokenHash,
        isVerified: false
    });

    const createdUser = await userDB.createUser(user);
    logEvent("SUCCESS_REGISTRATION", {
              message: `Successful registration by ${createdUser.username}`,
              user: createdUser.username,
              status: "request"
    });

    await sendMail({
        to: email,
        subject: "Verify your Exam API account",
        html: `
            <h1>Exam App</h1>
            <h2>Welcome, ${firstName}!</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="https://localhost:4000/register/verify?token=${verificationToken}">
                Verify your account
            </a>
            <p>If you didn't create this account, ignore this email.</p>
        `
    });
    
    return createdUser;
};

const verifyUser = async (token: string): Promise<User> => {
    const userPrisma = await userDB.getUserByVerificationToken(token);
    if (!userPrisma) throw new Error('Invalid verification token');

    const user = await userDB.verifyUser(userPrisma.username);
    logEvent("SUCCESS_VERIFICATION", {
              message: `Successful verification of ${user.username}`,
              user: user.username,
              status: "request"
    });
    return User.from(user);
};

const PasswordResetRequest = async (email: string) => {
    const user = await userDB.getUserByEmail({ email });

    if (!user) return;

    const resetToken = generateToken();
    const resetHash = await hashToken(resetToken);

    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await userDB.savePasswordResetToken(user.username, resetHash, expires);
    logEvent("REQUEST_RESET", {
                message: `Successful verification of ${user.username}`,
                user: user.username,
                status: "request"
    });

    await sendMail({
        to: email,
        subject: "Reset your password",
        html: `
        <h1>Exam App</h1>
        <h2>Reset you password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="https://localhost:4000/login/reset-password?token=${resetToken}">
            Reset your password
        </a>
        <p>This link expires in 10 minutes.</p>
        `
    });
};

const resetPassword = async (token: string, newPassword: string) => {
  const user = await userDB.getUserByResetToken( token );

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  if (new Date() > user.resetTokenExpires) {
    throw new Error("Reset token expired");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await database.user.update({
    where: { username: user.username },
    data: { password: hashedPassword }
  });

  await userDB.removePasswordResetToken(user.username);
  logEvent("SUCCESS_RESET", {
                message: `Successful password reset for ${user.username}`,
                user: user.username,
                status: "request"
    });

  return { message: "Password updated." };
};

export default {
    getUserByUsername,
    authenticate,
    createUser,
    getAllUsers,
    verifyUser,
    verifyMfa,
    PasswordResetRequest,
    resetPassword
};
