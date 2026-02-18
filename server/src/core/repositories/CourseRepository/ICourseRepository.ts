import {CreateCourseDto} from "./dto/CreateCourseDto";
import {UpdateCourseDto} from "./dto/UpdateCourseDto";
import {CourseEntity} from "../../entities/CourseEntity";

export interface ICourseRepository {
    create(dto: CreateCourseDto): Promise<CourseEntity>;
    findById(id: number): Promise<CourseEntity | null>;
    findAll(): Promise<CourseEntity[]>;
    update(id: number, dto: UpdateCourseDto): Promise<CourseEntity | null>;
    delete(id: number): Promise<void>;
}