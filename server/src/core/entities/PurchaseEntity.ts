export interface PurchaseEntity {
    id: number;
    userId: number;
    courseId: number;
    purchasePrice: number;
    purchaseAt: Date;
}