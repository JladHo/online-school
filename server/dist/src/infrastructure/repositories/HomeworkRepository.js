"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeworkRepository = void 0;
const db_1 = require("../db");
const HomeworkMapper_1 = require("../db/mappers/HomeworkMapper");
class HomeworkRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const homework = yield db_1.prisma.homework.create({
                data: Object.assign({}, dto),
            });
            return HomeworkMapper_1.HomeworkMapper.toEntity(homework);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const homework = yield db_1.prisma.homework.findUnique({
                where: { id },
            });
            return homework ? HomeworkMapper_1.HomeworkMapper.toEntity(homework) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const homeworks = yield db_1.prisma.homework.findMany();
            return homeworks.map(HomeworkMapper_1.HomeworkMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const homework = yield db_1.prisma.homework.update({
                where: { id },
                data: Object.assign({}, dto),
            });
            return HomeworkMapper_1.HomeworkMapper.toEntity(homework);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.homework.delete({
                where: { id },
            });
        });
    }
}
exports.HomeworkRepository = HomeworkRepository;
