export interface LessonEntity {
    id: number;
    title: string;
    description: string | null;
    content: string | null;
    orderNumber: number;
    moduleId: number;
}
