import { HomeworkEntity } from '../../entities/HomeworkEntity';
import { CreateHomeworkDto } from './dto/CreateHomeworkDto';
import { UpdateHomeworkDto } from './dto/UpdateHomeworkDto';

export interface IHomeworkRepository {
    create(dto: CreateHomeworkDto): Promise<HomeworkEntity>;
    findById(id: number): Promise<HomeworkEntity | null>;
    findAll(): Promise<HomeworkEntity[]>;
    update(id: number, dto: UpdateHomeworkDto): Promise<HomeworkEntity | null>;
    delete(id: number): Promise<void>;
}
