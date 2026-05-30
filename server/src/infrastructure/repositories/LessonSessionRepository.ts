import { ILessonSessionRepository } from "../../core/repositories/LessonSessionRepository/ILessonSessionRepository";
import { CreateLessonSessionDto } from "../../core/repositories/LessonSessionRepository/dto/CreateLessonSessionDto";
import { UpdateLessonSessionDto } from "../../core/repositories/LessonSessionRepository/dto/UpdateLessonSessionDto";
import { LessonSessionEntity } from "../../core/entities/LessonSessionEntity";
import { prisma } from "../db";
import { LessonSessionMapper } from "../db/mappers/LessonSessionMapper";

export class LessonSessionRepository implements ILessonSessionRepository {
    async create(dto: CreateLessonSessionDto): Promise<LessonSessionEntity> {
        const session = await prisma.lessonSession.create({
            data: { ...dto },
        });
        return LessonSessionMapper.toEntity(session);
    }

    async findById(id: number): Promise<LessonSessionEntity | null> {
        const session = await prisma.lessonSession.findUnique({
            where: { id },
        });
        return session ? LessonSessionMapper.toEntity(session) : null;
    }

    async findAll(): Promise<LessonSessionEntity[]> {
        const sessions = await prisma.lessonSession.findMany();
        return sessions.map(LessonSessionMapper.toEntity);
    }

    async update(id: number, dto: UpdateLessonSessionDto): Promise<LessonSessionEntity | null> {
        const session = await prisma.lessonSession.update({
            where: { id },
            data: { ...dto },
        });
        return LessonSessionMapper.toEntity(session);
    }

    async delete(id: number): Promise<void> {
        await prisma.lessonSession.deleteMany({
            where: { id },
        });
    }
}
