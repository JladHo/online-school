import { IModuleRepository } from "../../core/repositories/ModuleRepository/IModuleRepository";
import { CreateModuleDto } from "../../core/repositories/ModuleRepository/dto/CreateModuleDto";
import { UpdateModuleDto } from "../../core/repositories/ModuleRepository/dto/UpdateModuleDto";
import { ModuleEntity } from "../../core/entities/ModuleEntity";
import { prisma } from "../db";
import { ModuleMapper } from "../db/mappers/ModuleMapper";

export class ModuleRepository implements IModuleRepository {
    async create(dto: CreateModuleDto): Promise<ModuleEntity> {
        const payload: any = { ...dto };
        if (payload.description === undefined) payload.description = null;

        const module = await prisma.module.create({
            data: payload,
        });
        return ModuleMapper.toEntity(module);
    }

    async findById(id: number): Promise<ModuleEntity | null> {
        const module = await prisma.module.findUnique({
            where: { id },
        });
        return module ? ModuleMapper.toEntity(module) : null;
    }

    async findAll(): Promise<ModuleEntity[]> {
        const modules = await prisma.module.findMany();
        return modules.map(ModuleMapper.toEntity);
    }

    async update(id: number, dto: UpdateModuleDto): Promise<ModuleEntity | null> {
        const payload: any = { ...dto };
        if (payload.description === undefined && 'description' in payload) payload.description = null;

        const module = await prisma.module.update({
            where: { id },
            data: payload,
        });
        return ModuleMapper.toEntity(module);
    }

    async delete(id: number): Promise<void> {
        await prisma.module.delete({
            where: { id },
        });
    }
}
