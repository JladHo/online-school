"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseMapper = void 0;
class PurchaseMapper {
    static toEntity(purchase) {
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
exports.PurchaseMapper = PurchaseMapper;
