import { IModuleRepository } from '../../repositories/ModuleRepository/IModuleRepository';
import { CreateModuleDto } from '../../repositories/ModuleRepository/dto/CreateModuleDto';
import { UpdateModuleDto } from '../../repositories/ModuleRepository/dto/UpdateModuleDto';
import { ModuleEntity } from '../../entities/ModuleEntity';

export class ModuleService {
    constructor(private readonly moduleRepository: IModuleRepository) {}

    async create(dto: CreateModuleDto): Promise<ModuleEntity> {
        return this.moduleRepository.create(dto);
    }

    async findById(id: number): Promise<ModuleEntity | null> {
        return this.moduleRepository.findById(id);
    }

    async findAll(): Promise<ModuleEntity[]> {
        return this.moduleRepository.findAll();
    }

    async update(id: number, dto: UpdateModuleDto): Promise<ModuleEntity | null> {
        return this.moduleRepository.update(id, dto);
    }

    async delete(id: number): Promise<void> {
        return this.moduleRepository.delete(id);
    }
}
