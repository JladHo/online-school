export interface CreateReviewDto {
    userId: number;
    courseId: number;
    text: string;
    rating: number;
}