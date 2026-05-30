export type GroupType = 'individual' | 'group';

export interface GroupEntity {
    id: number;
    name: string;
    type: GroupType;
    courseId: number | null;
    teacherId: number | null;
}
