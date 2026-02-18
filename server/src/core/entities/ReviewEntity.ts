export interface ReviewEntity {
    id: number;
    userId: number;
    courseId: number;
    text: string;
    rating: number;
}