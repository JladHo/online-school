import { ILessonSessionRepository } from '../../repositories/LessonSessionRepository/ILessonSessionRepository';
import { IAttendanceRepository } from '../../repositories/AttendanceRepository/IAttendanceRepository';
import { CreateLessonSessionDto } from '../../repositories/LessonSessionRepository/dto/CreateLessonSessionDto';
import { LessonSessionEntity } from '../../entities/LessonSessionEntity';
import { AttendanceEntity } from '../../entities/AttendanceEntity';
import { NotFoundError } from '../../../errors/HttpError';

export class SessionService {
    constructor(
        private readonly sessionRepository: ILessonSessionRepository,
        private readonly attendanceRepository: IAttendanceRepository
    ) {}

    async createLessonSession(dto: CreateLessonSessionDto): Promise<LessonSessionEntity> {
        return this.sessionRepository.create(dto);
    }

    async updateLessonSession(id: number, dto: any): Promise<LessonSessionEntity | null> {
        return this.sessionRepository.update(id, dto);
    }

    async deleteLessonSession(id: number): Promise<void> {
        return this.sessionRepository.delete(id);
    }

    async getAllSessions(): Promise<LessonSessionEntity[]> {
        return this.sessionRepository.findAll();
    }

    async markAttendance(sessionId: number, studentId: number, isPresent: boolean): Promise<AttendanceEntity> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new NotFoundError('Сессия не найдена');
        }

        // Check if attendance record already exists
        const allAttendances = await this.attendanceRepository.findAll();
        const existingAttendance = allAttendances.find(
            a => a.sessionId === sessionId && a.studentId === studentId
        );

        if (existingAttendance) {
            const updated = await this.attendanceRepository.update(existingAttendance.id, { isPresent });
            if (!updated) {
                throw new NotFoundError('Не удалось обновить посещаемость');
            }
            return updated;
        }

        return this.attendanceRepository.create({
            sessionId,
            studentId,
            isPresent
        });
    }

    async getAttendanceBySessionId(sessionId: number): Promise<AttendanceEntity[]> {
        const allAttendances = await this.attendanceRepository.findAll();
        return allAttendances.filter(a => a.sessionId === sessionId);
    }

    async getAttendancesByStudentId(studentId: number): Promise<AttendanceEntity[]> {
        return this.attendanceRepository.findAttendancesByStudentId(studentId);
    }
}
