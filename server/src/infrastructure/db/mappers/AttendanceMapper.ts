import { Attendance as PrismaAttendance } from '@prisma/client';
import { AttendanceEntity } from '../../../core/entities/AttendanceEntity';

export class AttendanceMapper {
    public static toEntity(attendance: PrismaAttendance): AttendanceEntity {
        return {
            id: attendance.id,
            isPresent: attendance.isPresent,
            sessionId: attendance.sessionId,
            studentId: attendance.studentId,
        };
    }
}
