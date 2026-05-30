import { ICourseRepository } from '../../repositories/CourseRepository/ICourseRepository';
import { CreateCourseDto } from '../../repositories/CourseRepository/dto/CreateCourseDto';
import { UpdateCourseDto } from '../../repositories/CourseRepository/dto/UpdateCourseDto';
import { CourseEntity } from '../../entities/CourseEntity';

export class CourseService {
    constructor(private readonly courseRepository: ICourseRepository) {}

    async create(dto: CreateCourseDto): Promise<CourseEntity> {
        return this.courseRepository.create(dto);
    }

    async findById(id: number): Promise<CourseEntity | null> {
        return this.courseRepository.findById(id);
    }

    async findAll(): Promise<CourseEntity[]> {
        return this.courseRepository.findAll();
    }

    async update(id: number, dto: UpdateCourseDto): Promise<CourseEntity | null> {
        return this.courseRepository.update(id, dto);
    }

    async delete(id: number): Promise<void> {
        return this.courseRepository.delete(id);
    }
}
