import { User } from './user';
import { Teacher as TeacherPrisma, User as UserPrisma } from '@prisma/client';

export class Teacher {
    readonly id?: number;
    readonly user: User;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    readonly learningPath: string;

    constructor(teacher: {
        id?: number;
        user: User;
        createdAt?: Date;
        updatedAt?: Date;
        learningPath: string;
    }) {
        this.id = teacher.id;
        this.user = teacher.user;
        this.createdAt = teacher.createdAt;
        this.updatedAt = teacher.updatedAt;
        this.learningPath = teacher.learningPath;
    }

    static from({
        id,
        user,
        createdAt,
        updatedAt,
        learningPath
    }: TeacherPrisma & { user: UserPrisma}) {
        return new Teacher({
            id, 
            user: User.from(user),
            createdAt,
            updatedAt,
            learningPath
        });
    }
}
