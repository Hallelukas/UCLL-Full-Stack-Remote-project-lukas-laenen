import classroomDb from "../repository/classroom.db";
import { Classroom } from "../model/classroom";

const getClassroomByName = async ( name: string ): Promise<Classroom> => {
    if ( !name ) {
        throw new Error('Name is required');
    }
    const classroom = await classroomDb.getClassroomByName( name );
    return classroom;
};

const addClassroom = async ( classroom: Classroom ): Promise<Classroom> => {
    const existing = await classroomDb.getClassroomByName( classroom.name );
    if ( existing ) {
        throw new Error('Classroom already exists.');
    }
    const addedClassroom = await classroomDb.addClassroom( classroom );
    return addedClassroom;
};

export default { getClassroomByName, addClassroom };