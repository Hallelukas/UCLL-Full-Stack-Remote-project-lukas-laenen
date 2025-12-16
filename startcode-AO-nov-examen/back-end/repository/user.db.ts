import { User } from '../model/user';
import database from '../util/database';
import bcrypt from 'bcrypt';

const getAllUsers = async (): Promise<User[]> => {
    try {
        const usersPrisma = await database.user.findMany();
        return usersPrisma.map((userPrisma) => User.from(userPrisma));
    } catch (error) {
        throw new Error('Database error. See server log for details.');
    }
};

const getUserById = async ({ id }: { id: number }): Promise<User | null> => {
    try {
        const userPrisma = await database.user.findUnique({
            where: { id },
        });
        return userPrisma ? User.from(userPrisma) : null;
    } catch (error) {
        throw new Error('Database error. See server log for details.');
    }
};

const getUserByEmail = async ({ email }: { email: string }): Promise<User | null> => {
    try {
        const userPrisma = await database.user.findUnique({
            where: { email },
        });
        return userPrisma ? User.from(userPrisma) : null;
    } catch (error) {
        throw new Error('Database error. See server log for details.');
    }
};

const getUserByUsername = async ({ username }: { username: string }): Promise<User | null> => {
    try {
        const userPrisma = await database.user.findFirst({
            where: { username },
        });
        return userPrisma ? User.from(userPrisma) : null;
    } catch (error) {
        throw new Error('Database error. See server log for details.');
    }
};

const createUser = async ({
    username,
    password,
    firstName,
    lastName,
    email,
    role,
    verificationToken,
    isVerified=false
}: User): Promise<User> => {
    try {
        const userPrisma = await database.user.create({
            data: { username, password, firstName, lastName, email, role, verificationToken, isVerified },
        });
        return User.from(userPrisma);
    } catch (error) {
        throw new Error('Database error. See server log for details.');
    }
};

async function saveMfaCode(username: string, code: string, expires: Date) {
    return database.user.update({
        where: { username },
        data: { mfaCode: code, mfaExpires: expires }
    });
}

async function getUserByVerificationToken(token: string) {
  const users = await database.user.findMany({
    where: { verificationToken: { not: null } }
  });

  for (const user of users) {
    if (user.verificationToken && await bcrypt.compare(token, user.verificationToken)) {
      return user;
    }
  }

  return null;
}

async function verifyUser(username: string) {
    return database.user.update({
        where: { username },
        data: { isVerified: true, verificationToken: null }
    });
}

async function savePasswordResetToken(
  username: string,
  hash: string | null,
  expires: Date | null
) {
  return database.user.update({
    where: { username },
    data: {
      resetToken: hash,
      resetTokenExpires: expires
    }
  });
}

async function getUserByResetToken(token: string) {
  const users = await database.user.findMany({
    where: {
      resetToken: { not: null }
    }
  });

  for (const user of users) {
    if (user.resetToken && await bcrypt.compare(token, user.resetToken)) {
      return user;
    }
  }

  return null;
}

async function removePasswordResetToken(
  username: string,
) {
  return database.user.update({
    where: { username },
    data: {
      resetToken: null,
      resetTokenExpires: null
    }
  });
}

async function updatePassword(username: string, passwordHash: string) {
  return database.user.update({
    where: { username },
    data: { password: passwordHash }
  });
}

export default {
    getAllUsers,
    createUser,
    getUserById,
    getUserByUsername,
    saveMfaCode,
    getUserByVerificationToken,
    verifyUser,
    getUserByEmail,
    savePasswordResetToken,
    getUserByResetToken,
    removePasswordResetToken,
    updatePassword
};
