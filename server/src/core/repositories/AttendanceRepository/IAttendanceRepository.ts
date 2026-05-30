import { AttendanceEntity } from '../../entities/AttendanceEntity';
import { CreateAttendanceDto } from './dto/CreateAttendanceDto';
import { UpdateAttendanceDto } from './dto/UpdateAttendanceDto';

export interface IAttendanceRepository {
    create(dto: CreateAttendanceDto): Promise<AttendanceEntity>;
    findById(id: number): Promise<AttendanceEntity | null>;
    findAll(): Promise<AttendanceEntity[]>;
    findAttendancesByStudentId(studentId: number): Promise<AttendanceEntity[]>;
    update(id: number, dto: UpdateAttendanceDto): Promise<AttendanceEntity | null>;
    delete(id: number): Promise<void>;
}
