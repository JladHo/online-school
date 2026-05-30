import { Request, Response, NextFunction } from 'express';
import { HomeworkService } from '../../core/services/HomeworkService/HomeworkService';
import { CreateHomeworkSchema } from '../../core/repositories/HomeworkRepository/dto/CreateHomeworkDto';
import { CreateHomeworkSubmissionSchema } from '../../core/repositories/HomeworkSubmissionRepository/dto/CreateHomeworkSubmissionDto';

export class HomeworkController {
    constructor(private readonly homeworkService: HomeworkService) {}

    async getHomeworksByLessonId(req: Request, res: Response, next: NextFunction) {
        try {
            const lessonId = parseInt(String(req.params.lessonId), 10);
            const homeworks = await this.homeworkService.getHomeworksByLessonId(lessonId);
            res.status(200).json(homeworks);
        } catch (error) {
            next(error);
        }
    }

    async getAllHomeworks(req: Request, res: Response, next: NextFunction) {
        try {
            const homeworks = await this.homeworkService.getAllHomeworks();
            res.status(200).json(homeworks);
        } catch (error) {
            next(error);
        }
    }

    async getSubmissionsByStudentId(req: Request, res: Response, next: NextFunction) {
        try {
            const studentId = parseInt(String(req.params.studentId), 10);
            const submissions = await this.homeworkService.getSubmissionsByStudentId(studentId);
            res.status(200).json(submissions);
        } catch (error) {
            next(error);
        }
    }

    async getSubmissionsByTeacherId(req: Request, res: Response, next: NextFunction) {
        try {
            const teacherId = parseInt(String(req.params.teacherId), 10);
            const submissions = await this.homeworkService.getSubmissionsByTeacherId(teacherId);
            res.status(200).json(submissions);
        } catch (error) {
            next(error);
        }
    }

    async getAllSubmissions(req: Request, res: Response, next: NextFunction) {
        try {
            const submissions = await this.homeworkService.getAllSubmissions();
            res.status(200).json(submissions);
        } catch (error) {
            next(error);
        }
    }

    async createHomework(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const homework = await this.homeworkService.createHomework(data);
            res.status(201).json(homework);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const data = req.body;
            const homework = await this.homeworkService.updateHomework(id, data);
            res.status(200).json(homework);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            await this.homeworkService.deleteHomework(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async submitHomework(req: Request, res: Response, next: NextFunction) {
        try {
            const data = CreateHomeworkSubmissionSchema.parse(req.body);
            const submission = await this.homeworkService.submitHomework(data);
            res.status(201).json(submission);
        } catch (error) {
            next(error);
        }
    }

    async gradeHomework(req: Request, res: Response, next: NextFunction) {
        try {
            const submissionId = parseInt(String(req.params.submissionId), 10);
            const { score, teacherId, comment } = req.body;
            const updatedSubmission = await this.homeworkService.gradeHomework(submissionId, score, teacherId, comment);
            res.status(200).json(updatedSubmission);
        } catch (error) {
            next(error);
        }
    }
}
