/**
 * @swagger
 *  components:
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 *      schemas:
 *          Classroom:
 *              type: object
 *              properties:
 *                  id:
 *                      type: number
 *                      format: int64
 *                  name:
 *                      type: string
 *          ClassroomInput:
 *              type: object
 *              properties:
 *                  name:
 *                      type: string
 */

import express, { NextFunction, Request, Response } from 'express';
import classroomService from '../service/classroom.service';
import { ClassroomInput } from '../types';

const classroomRouter = express.Router();

/**
 * @swagger
 * /classrooms/{name}:
 *      get:
 *          security:
 *            - bearerAuth: []
 *          summary: Get a classroom by name
 *          parameters:
 *            - in: path
 *              name: name
 *              required: true
 *              schema:
 *                  type: string
 *              description: the name of the classroom
 *          responses:
 *              200:
 *                  description: The classroom data
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Classroom'
 *              400:
 *                  desciption: Bad request
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                  message:
 *                                      type: string
 *              404:
 *                  description: Classroom not found
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                  message:
 *                                      type: string
 */
classroomRouter.get('/:name', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const classroom = await classroomService.getClassroomByName(req.params.name);
        res.status(200).json(classroom);
    } catch ( error ) {
        next( error );
    }
});

 /**
 * @swagger
 * /classrooms/add:
 *      post:
 *          security:
 *            - bearerAuth: []
 *          summary: Create a new customer
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ClassroomInput'
 *          responses:
 *              200:
 *                description: The classroom is created.
 *                content:
 *                   application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Classroom'                  
 */
 classroomRouter.post("/add", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const classroomInput: ClassroomInput = req.body;
        const classroom = await classroomService.addClassroom(classroomInput);
        res.status(200).json(classroom);
    } catch ( error ) {
        next( error );
    }
});

export { classroomRouter };