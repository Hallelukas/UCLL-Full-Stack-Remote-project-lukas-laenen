import database from '../util/database';
import { Classroom } from '../model/classroom';

const getClassroomByName = async (name: string): Promise<Classroom | null> => {
    try {
        const classroomPrisma = await database.classroom.findFirst({
            where: { name: name },
        });
        return classroomPrisma ? Classroom.from(classroomPrisma) : null;
    } catch (error) {
        throw new Error('Database error. See server log for details.');
    }
}

const addClassroom = async ( classroom: Classroom ): Promise<Classroom> => {
    try {
        const classroomPrisma = await database.classroom.create({
            data: {
                name: classroom.name,
            }
        });
        return Classroom.from(classroomPrisma);
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Database error. See server log for details.');
    }
}

export default {
    getClassroomByName,
    addClassroom,
};