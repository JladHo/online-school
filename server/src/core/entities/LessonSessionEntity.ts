export interface LessonSessionEntity {
    id: number;
    scheduledAt: Date;
    durationMin: number;
    meetingLink: string | null;
    lessonId: number;
    groupId: number;
    teacherId: number | null;
}
