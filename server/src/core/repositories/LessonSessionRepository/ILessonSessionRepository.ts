import { LessonSessionEntity } from '../../entities/LessonSessionEntity';
import { CreateLessonSessionDto } from './dto/CreateLessonSessionDto';
import { UpdateLessonSessionDto } from './dto/UpdateLessonSessionDto';

export interface ILessonSessionRepository {
    create(dto: CreateLessonSessionDto): Promise<LessonSessionEntity>;
    findById(id: number): Promise<LessonSessionEntity | null>;
    findAll(): Promise<LessonSessionEntity[]>;
    update(id: number, dto: UpdateLessonSessionDto): Promise<LessonSessionEntity | null>;
    delete(id: number): Promise<void>;
}
