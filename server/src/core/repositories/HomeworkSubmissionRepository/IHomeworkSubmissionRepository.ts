import { HomeworkSubmissionEntity } from '../../entities/HomeworkSubmissionEntity';
import { CreateHomeworkSubmissionDto } from './dto/CreateHomeworkSubmissionDto';
import { UpdateHomeworkSubmissionDto } from './dto/UpdateHomeworkSubmissionDto';

export interface IHomeworkSubmissionRepository {
    create(dto: CreateHomeworkSubmissionDto): Promise<HomeworkSubmissionEntity>;
    findById(id: number): Promise<HomeworkSubmissionEntity | null>;
    findAll(): Promise<HomeworkSubmissionEntity[]>;
    update(id: number, dto: UpdateHomeworkSubmissionDto): Promise<HomeworkSubmissionEntity | null>;
    delete(id: number): Promise<void>;

    findSubmissionsByHomeworkId(homeworkId: number): Promise<HomeworkSubmissionEntity[]>;
    findSubmissionsByStudentId(studentId: number): Promise<HomeworkSubmissionEntity[]>;
    findSubmissionsByTeacherId(teacherId: number): Promise<HomeworkSubmissionEntity[]>;
}
