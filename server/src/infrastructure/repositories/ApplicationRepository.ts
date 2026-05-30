import { IApplicationRepository } from "../../core/repositories/ApplicationRepository/IApplicationRepository";
import { CreateApplicationDto } from "../../core/repositories/ApplicationRepository/dto/CreateApplicationDto";
import { UpdateApplicationDto } from "../../core/repositories/ApplicationRepository/dto/UpdateApplicationDto";
import { ApplicationEntity } from "../../core/entities/ApplicationEntity";
import { prisma } from "../db";
import { ApplicationMapper } from "../db/mappers/ApplicationMapper";

export class ApplicationRepository implements IApplicationRepository {
    async create(dto: CreateApplicationDto): Promise<ApplicationEntity> {
        const application = await prisma.application.create({
            data: { ...dto },
        });
        return ApplicationMapper.toEntity(application);
    }

    async findById(id: number): Promise<ApplicationEntity | null> {
        const application = await prisma.application.findUnique({
            where: { id },
        });
        return application ? ApplicationMapper.toEntity(application) : null;
    }

    async findAll(): Promise<ApplicationEntity[]> {
        const applications = await prisma.application.findMany();
        return applications.map(ApplicationMapper.toEntity);
    }

    async update(id: number, dto: UpdateApplicationDto): Promise<ApplicationEntity | null> {
        const application = await prisma.application.update({
            where: { id },
            data: { ...dto },
        });
        return ApplicationMapper.toEntity(application);
    }

    async delete(id: number): Promise<void> {
        await prisma.application.delete({
            where: { id },
        });
    }
}
