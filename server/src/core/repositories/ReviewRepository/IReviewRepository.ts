import {CreateReviewDto} from "./dto/CreateReviewDto";
import {ReviewEntity} from "../../entities/ReviewEntity";

export interface IReviewRepository {
    create(dto: CreateReviewDto): Promise<ReviewEntity>;
    findById(id: number): Promise<ReviewEntity | null>;
    findAll(): Promise<ReviewEntity[]>;
    delete(id: number): Promise<void>;
}