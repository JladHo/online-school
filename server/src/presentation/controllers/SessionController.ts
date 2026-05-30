import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../../core/services/SessionService/SessionService';
import { CreateLessonSessionSchema } from '../../core/repositories/LessonSessionRepository/dto/CreateLessonSessionDto';

export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

    async createLessonSession(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Creating session:", req.body);
            const data = CreateLessonSessionSchema.parse(req.body);
            const session = await this.sessionService.createLessonSession(data);
            res.status(201).json(session);
        } catch (error) {
            console.error("Error creating session:", error);
            next(error);
        }
    }

    async updateLessonSession(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const session = await this.sessionService.updateLessonSession(id, req.body);
            if (!session) {
                res.status(404).json({ message: 'Сессия не найдена' });
                return;
            }
            res.status(200).json(session);
        } catch (error) {
            next(error);
        }
    }

    async deleteLessonSession(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            await this.sessionService.deleteLessonSession(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getAllSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const sessions = await this.sessionService.getAllSessions();
            res.status(200).json(sessions);
        } catch (error) {
            next(error);
        }
    }

    async markAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const sessionId = parseInt(String(req.params.id), 10);
            const { studentId, isPresent } = req.body;
            const attendance = await this.sessionService.markAttendance(sessionId, studentId, isPresent);
            res.status(200).json(attendance);
        } catch (error) {
            next(error);
        }
    }

    async getAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const sessionId = parseInt(String(req.params.id), 10);
            const attendances = await this.sessionService.getAttendanceBySessionId(sessionId);
            res.status(200).json(attendances);
        } catch (error) {
            next(error);
        }
    }

    async getAttendancesByStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const studentId = parseInt(String(req.params.studentId), 10);
            const attendances = await this.sessionService.getAttendancesByStudentId(studentId);
            res.status(200).json(attendances);
        } catch (error) {
            next(error);
        }
    }
}
