import { LessonEntity } from '../../entities/LessonEntity';
import { CreateLessonDto } from './dto/CreateLessonDto';
import { UpdateLessonDto } from './dto/UpdateLessonDto';

export interface ILessonRepository {
    create(dto: CreateLessonDto): Promise<LessonEntity>;
    findById(id: number): Promise<LessonEntity | null>;
    findAll(): Promise<LessonEntity[]>;
    update(id: number, dto: UpdateLessonDto): Promise<LessonEntity | null>;
    delete(id: number): Promise<void>;
}
