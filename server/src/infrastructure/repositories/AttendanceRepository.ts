import { IAttendanceRepository } from "../../core/repositories/AttendanceRepository/IAttendanceRepository";
import { CreateAttendanceDto } from "../../core/repositories/AttendanceRepository/dto/CreateAttendanceDto";
import { UpdateAttendanceDto } from "../../core/repositories/AttendanceRepository/dto/UpdateAttendanceDto";
import { AttendanceEntity } from "../../core/entities/AttendanceEntity";
import { prisma } from "../db";
import { AttendanceMapper } from "../db/mappers/AttendanceMapper";

export class AttendanceRepository implements IAttendanceRepository {
    async create(dto: CreateAttendanceDto): Promise<AttendanceEntity> {
        const attendance = await prisma.attendance.create({
            data: { ...dto },
        });
        return AttendanceMapper.toEntity(attendance);
    }

    async findById(id: number): Promise<AttendanceEntity | null> {
        const attendance = await prisma.attendance.findUnique({
            where: { id },
        });
        return attendance ? AttendanceMapper.toEntity(attendance) : null;
    }

    async findAll(): Promise<AttendanceEntity[]> {
        const attendances = await prisma.attendance.findMany();
        return attendances.map(AttendanceMapper.toEntity);
    }

    async findAttendancesByStudentId(studentId: number): Promise<AttendanceEntity[]> {
        const attendances = await prisma.attendance.findMany({
            where: { studentId }
        });
        return attendances.map(AttendanceMapper.toEntity);
    }

    async update(id: number, dto: UpdateAttendanceDto): Promise<AttendanceEntity | null> {
        const attendance = await prisma.attendance.update({
            where: { id },
            data: { ...dto },
        });
        return AttendanceMapper.toEntity(attendance);
    }

    async delete(id: number): Promise<void> {
        await prisma.attendance.delete({
            where: { id },
        });
    }
}
