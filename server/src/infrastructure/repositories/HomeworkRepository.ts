import { IHomeworkRepository } from "../../core/repositories/HomeworkRepository/IHomeworkRepository";
import { CreateHomeworkDto } from "../../core/repositories/HomeworkRepository/dto/CreateHomeworkDto";
import { UpdateHomeworkDto } from "../../core/repositories/HomeworkRepository/dto/UpdateHomeworkDto";
import { HomeworkEntity } from "../../core/entities/HomeworkEntity";
import { prisma } from "../db";
import { HomeworkMapper } from "../db/mappers/HomeworkMapper";

export class HomeworkRepository implements IHomeworkRepository {
    async create(dto: CreateHomeworkDto): Promise<HomeworkEntity> {
        const homework = await prisma.homework.create({
            data: { ...dto },
        });
        return HomeworkMapper.toEntity(homework);
    }

    async findById(id: number): Promise<HomeworkEntity | null> {
        const homework = await prisma.homework.findUnique({
            where: { id },
        });
        return homework ? HomeworkMapper.toEntity(homework) : null;
    }

    async findAll(): Promise<HomeworkEntity[]> {
        const homeworks = await prisma.homework.findMany();
        return homeworks.map(HomeworkMapper.toEntity);
    }

    async update(id: number, dto: UpdateHomeworkDto): Promise<HomeworkEntity | null> {
        const homework = await prisma.homework.update({
            where: { id },
            data: { ...dto },
        });
        return HomeworkMapper.toEntity(homework);
    }

    async delete(id: number): Promise<void> {
        await prisma.homework.delete({
            where: { id },
        });
    }
}
