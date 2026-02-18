export type ApplicationStatus = 'new' | 'in_progress' | 'closed' | 'rejected';

export interface ApplicationEntity {
    id: number;
    courseId: number;
    lastName: string;
    firstName: string;
    middleName?: string;
    phone: string;
    email: string;
    status: ApplicationStatus;
}