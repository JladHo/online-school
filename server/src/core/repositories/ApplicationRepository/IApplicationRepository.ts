import {CreateApplicationDto} from "./dto/CreateApplicationDto";
import {UpdateApplicationDto} from "./dto/UpdateApplicationDto";
import {ApplicationEntity} from "../../entities/ApplicationEntity";

export interface IApplicationRepository {
    create(dto: CreateApplicationDto): Promise<ApplicationEntity>;
    findById(id: number): Promise<ApplicationEntity | null>;
    findAll(): Promise<ApplicationEntity[]>;
    update(id: number, dto: UpdateApplicationDto): Promise<ApplicationEntity | null>;
    delete(id: number): Promise<void>;
}