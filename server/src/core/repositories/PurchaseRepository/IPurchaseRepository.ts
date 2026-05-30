import { PurchaseEntity } from '../../entities/PurchaseEntity';
import { CreatePurchaseDto } from './dto/CreatePurchaseDto';
import { UpdatePurchaseDto } from './dto/UpdatePurchaseDto';

export interface IPurchaseRepository {
    create(dto: CreatePurchaseDto): Promise<PurchaseEntity>;
    findById(id: number): Promise<PurchaseEntity | null>;
    findAll(): Promise<PurchaseEntity[]>;
    update(id: number, dto: UpdatePurchaseDto): Promise<PurchaseEntity | null>;
    delete(id: number): Promise<void>;
}
