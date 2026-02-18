import {CreateModuleDto} from "./dto/CreateModuleDto";
import {UpdateModuleDto} from "./dto/UpdateModuleDto";
import {ModuleEntity} from "../../entities/ModuleEntity";

export interface IModuleRepository {
    create(dto: CreateModuleDto): Promise<ModuleEntity>;
    findById(id: number): Promise<ModuleEntity | null>;
    findAll(): Promise<ModuleEntity[]>;
    update(id: number, dto: UpdateModuleDto): Promise<ModuleEntity | null>;
    delete(id: number): Promise<void>;
}