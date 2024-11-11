import { Classroom as ClassroomPrisma } from '@prisma/client';

export class Classroom {
    readonly id?: number;
    readonly name: string;

    constructor (classroom: {
        id?: number;
        name: string;
    }) {
        this.id = classroom.id;
        this.name = classroom.name
    }

    static from({
        id,
        name
    }: ClassroomPrisma) {
        return new Classroom({
            id,
            name
        });
    }
}