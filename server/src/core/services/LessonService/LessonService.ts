import { ILessonRepository } from '../../repositories/LessonRepository/ILessonRepository';
import { CreateLessonDto } from '../../repositories/LessonRepository/dto/CreateLessonDto';
import { UpdateLessonDto } from '../../repositories/LessonRepository/dto/UpdateLessonDto';
import { LessonEntity } from '../../entities/LessonEntity';

export class LessonService {
    constructor(private readonly lessonRepository: ILessonRepository) {}

    async create(dto: CreateLessonDto): Promise<LessonEntity> {
        return this.lessonRepository.create(dto);
    }

    async findById(id: number): Promise<LessonEntity | null> {
        return this.lessonRepository.findById(id);
    }

    async findAll(): Promise<LessonEntity[]> {
        return this.lessonRepository.findAll();
    }

    async update(id: number, dto: UpdateLessonDto): Promise<LessonEntity | null> {
        return this.lessonRepository.update(id, dto);
    }

    async delete(id: number): Promise<void> {
        return this.lessonRepository.delete(id);
    }
}
