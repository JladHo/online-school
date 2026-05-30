export type ApplicationStatus = 'new' | 'in_progress' | 'closed' | 'rejected';

export interface ApplicationEntity {
    id: number;
    parentName: string;
    studentName: string;
    phone: string;
    email: string;
    status: ApplicationStatus;
    createdAt: Date;
    courseId: number | null;
    managerId: number | null;
}
