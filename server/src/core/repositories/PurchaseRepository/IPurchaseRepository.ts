import {CreatePurchaseDto} from "./dto/CreatePurchaseDto";
import {PurchaseEntity} from "../../entities/PurchaseEntity";

export interface IPurchaseRepository {
    create(dto: CreatePurchaseDto): Promise<PurchaseEntity>;
    findById(id: number): Promise<PurchaseEntity | null>;
    findAll(): Promise<PurchaseEntity[]>;
    delete(id: number): Promise<void>;
}