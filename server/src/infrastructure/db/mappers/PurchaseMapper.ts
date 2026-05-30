import { Purchase } from '@prisma/client';
import { PurchaseEntity } from '../../../core/entities/PurchaseEntity';

export class PurchaseMapper {
    static toEntity(purchase: Purchase): PurchaseEntity {
        return {
            id: purchase.id,
            purchasePrice: purchase.purchasePrice,
            purchaseAt: purchase.purchaseAt,
            userId: purchase.userId,
            courseId: purchase.courseId,
            customerName: purchase.customerName,
            customerEmail: purchase.customerEmail,
            customerPhone: purchase.customerPhone
        };
    }
}
