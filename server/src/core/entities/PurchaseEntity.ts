export interface PurchaseEntity {
    id: number;
    purchasePrice: number;
    purchaseAt: Date;
    userId: number | null;
    courseId: number | null;
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
}
