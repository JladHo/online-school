import { ICourseRepository } from "../../core/repositories/CourseRepository/ICourseRepository";
import { CreateCourseDto } from "../../core/repositories/CourseRepository/dto/CreateCourseDto";
import { UpdateCourseDto } from "../../core/repositories/CourseRepository/dto/UpdateCourseDto";
import { CourseEntity } from "../../core/entities/CourseEntity";
import { prisma } from "../db";
import { CourseMapper } from "../db/mappers/CourseMapper";

export class CourseRepository implements ICourseRepository {
    async create(dto: CreateCourseDto): Promise<CourseEntity> {
        const course = await prisma.course.create({
            data: { ...dto },
        });
        return CourseMapper.toEntity(course);
    }

    async findById(id: number): Promise<CourseEntity | null> {
        const course = await prisma.course.findUnique({
            where: { id },
        });
        return course ? CourseMapper.toEntity(course) : null;
    }

    async findAll(): Promise<CourseEntity[]> {
        const courses = await prisma.course.findMany();
        return courses.map(CourseMapper.toEntity);
    }

    async update(id: number, dto: UpdateCourseDto): Promise<CourseEntity | null> {
        const course = await prisma.course.update({
            where: { id },
            data: { ...dto },
        });
        return CourseMapper.toEntity(course);
    }

    async delete(id: number): Promise<void> {
        await prisma.course.delete({
            where: { id },
        });
    }
}
