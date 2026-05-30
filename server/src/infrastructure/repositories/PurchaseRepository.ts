import { IPurchaseRepository } from "../../core/repositories/PurchaseRepository/IPurchaseRepository";
import { CreatePurchaseDto } from "../../core/repositories/PurchaseRepository/dto/CreatePurchaseDto";
import { UpdatePurchaseDto } from "../../core/repositories/PurchaseRepository/dto/UpdatePurchaseDto";
import { PurchaseEntity } from "../../core/entities/PurchaseEntity";
import { prisma } from "../db";
import { PurchaseMapper } from "../db/mappers/PurchaseMapper";

export class PurchaseRepository implements IPurchaseRepository {
    async create(dto: CreatePurchaseDto): Promise<PurchaseEntity> {
        const purchase = await prisma.purchase.create({
            data: { ...dto },
        });
        return PurchaseMapper.toEntity(purchase);
    }

    async findById(id: number): Promise<PurchaseEntity | null> {
        const purchase = await prisma.purchase.findUnique({
            where: { id },
        });
        return purchase ? PurchaseMapper.toEntity(purchase) : null;
    }

    async findAll(): Promise<PurchaseEntity[]> {
        const purchases = await prisma.purchase.findMany();
        return purchases.map(PurchaseMapper.toEntity);
    }

    async update(id: number, dto: UpdatePurchaseDto): Promise<PurchaseEntity | null> {
        const purchase = await prisma.purchase.update({
            where: { id },
            data: { ...dto },
        });
        return PurchaseMapper.toEntity(purchase);
    }

    async delete(id: number): Promise<void> {
        await prisma.purchase.delete({
            where: { id },
        });
    }
}
