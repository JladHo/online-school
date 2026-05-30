import { ILessonRepository } from '../../repositories/LessonRepository/ILessonRepository';
import { IHomeworkSubmissionRepository } from '../../repositories/HomeworkSubmissionRepository/IHomeworkSubmissionRepository';
import { IAttendanceRepository } from '../../repositories/AttendanceRepository/IAttendanceRepository';
import { IHomeworkRepository } from '../../repositories/HomeworkRepository/IHomeworkRepository';
import { ILessonSessionRepository } from '../../repositories/LessonSessionRepository/ILessonSessionRepository';
import { IModuleRepository } from '../../repositories/ModuleRepository/IModuleRepository';
import { NotFoundError } from '../../../errors/HttpError';

export class CourseProgressService {
    constructor(
        private readonly lessonRepository: ILessonRepository,
        private readonly submissionRepository: IHomeworkSubmissionRepository,
        private readonly attendanceRepository: IAttendanceRepository,
        private readonly homeworkRepository: IHomeworkRepository,
        private readonly sessionRepository: ILessonSessionRepository,
        private readonly moduleRepository: IModuleRepository
    ) {}

    async canAccessLesson(studentId: number, lessonId: number): Promise<boolean> {
        const targetLesson = await this.lessonRepository.findById(lessonId);
        if (!targetLesson) {
            throw new NotFoundError('Урок не найден');
        }

        const targetModule = await this.moduleRepository.findById(targetLesson.moduleId);
        if (!targetModule) return true; // Fallback

        const courseModules = await this.moduleRepository.findAll();
        const courseModuleIds = courseModules.filter(m => m.courseId === targetModule.courseId).map(m => m.id);

        const allLessons = await this.lessonRepository.findAll();
        const courseLessons = allLessons
            .filter(l => courseModuleIds.includes(l.moduleId))
            .sort((a, b) => {
                const aModIndex = courseModuleIds.indexOf(a.moduleId);
                const bModIndex = courseModuleIds.indexOf(b.moduleId);
                if (aModIndex === bModIndex) {
                    return a.orderNumber - b.orderNumber;
                }
                return aModIndex - bModIndex;
            });

        const currentIndex = courseLessons.findIndex(l => l.id === targetLesson.id);
        if (currentIndex <= 0) {
            return true;
        }

        const previousLesson = courseLessons[currentIndex - 1];

        // Check Homework for previous lesson
        const allHomeworks = await this.homeworkRepository.findAll();
        const previousLessonHomeworks = allHomeworks.filter(h => h.lessonId === previousLesson.id);

        // If there's no homework for the previous lesson, we assume it's "completed" automatically
        if (previousLessonHomeworks.length === 0) {
            return true;
        }

        const submissions = await this.submissionRepository.findSubmissionsByStudentId(studentId);
        const hasAcceptedHomework = previousLessonHomeworks.every(hw =>
            submissions.some(sub => sub.homeworkId === hw.id && sub.score === 100)
        );

        return hasAcceptedHomework;
    }
}
