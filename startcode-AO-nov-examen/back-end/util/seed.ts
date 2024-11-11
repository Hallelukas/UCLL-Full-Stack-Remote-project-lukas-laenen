import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const main = async () => {
    await prisma.teacher.deleteMany();
    await prisma.user.deleteMany();

    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            password: await bcrypt.hash('admin123', 12),
            firstName: 'Admin',
            lastName: 'Istrator',
            email: 'administrator@ucll.be',
            role: 'admin',
        },
    });

    const johanp = await prisma.teacher.create({
        data: {
            user: {
                create: {
                    username: 'johanp',
                    password: await bcrypt.hash('johanp123', 12),
                    firstName: 'Johan',
                    lastName: 'Pieck',
                    email: 'johan.pieck@ucll.be',
                    role: 'teacher',
                },
            },
            learningPath: 'Software development',
        },
    });

    const tiebev = await prisma.teacher.create({
        data: {
            user: {
                create: {
                    username: 'tiebev',
                    password: await bcrypt.hash('tiebev123', 12),
                    firstName: 'Tiebe',
                    lastName: 'Van Nieuwenhove',
                    email: 'tiebe.vannieuwenhove@ucll.be',
                    role: 'teacher',
                },
            },
            learningPath: 'Infrastructure',
        },
    });
};

(async () => {
    try {
        await main();
        await prisma.$disconnect();
    } catch (error) {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    }
})();
