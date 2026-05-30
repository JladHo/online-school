import { ILessonRepository } from "../../core/repositories/LessonRepository/ILessonRepository";
import { CreateLessonDto } from "../../core/repositories/LessonRepository/dto/CreateLessonDto";
import { UpdateLessonDto } from "../../core/repositories/LessonRepository/dto/UpdateLessonDto";
import { LessonEntity } from "../../core/entities/LessonEntity";
import { prisma } from "../db";
import { LessonMapper } from "../db/mappers/LessonMapper";

export class LessonRepository implements ILessonRepository {
    async create(dto: CreateLessonDto): Promise<LessonEntity> {
        const payload: any = { ...dto };
        if (payload.description === undefined) payload.description = null;
        if (payload.content === undefined) payload.content = null;

        const lesson = await prisma.lesson.create({
            data: payload,
        });
        return LessonMapper.toEntity(lesson);
    }

    async findById(id: number): Promise<LessonEntity | null> {
        const lesson = await prisma.lesson.findUnique({
            where: { id },
        });
        return lesson ? LessonMapper.toEntity(lesson) : null;
    }

    async findAll(): Promise<LessonEntity[]> {
        const lessons = await prisma.lesson.findMany();
        return lessons.map(LessonMapper.toEntity);
    }

    async update(id: number, dto: UpdateLessonDto): Promise<LessonEntity | null> {
        const payload: any = { ...dto };
        if (payload.description === undefined && 'description' in payload) payload.description = null;
        if (payload.content === undefined && 'content' in payload) payload.content = null;

        const lesson = await prisma.lesson.update({
            where: { id },
            data: payload,
        });
        return LessonMapper.toEntity(lesson);
    }

    async delete(id: number): Promise<void> {
        await prisma.lesson.delete({
            where: { id },
        });
    }
}
