export interface CreateApplicationDto {
    courseId: number;
    lastName: string;
    firstName: string;
    middleName?: string;
    phone: string;
    email: string
}