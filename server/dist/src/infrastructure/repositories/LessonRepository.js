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
exports.LessonRepository = void 0;
const db_1 = require("../db");
const LessonMapper_1 = require("../db/mappers/LessonMapper");
class LessonRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = Object.assign({}, dto);
            if (payload.description === undefined)
                payload.description = null;
            if (payload.content === undefined)
                payload.content = null;
            const lesson = yield db_1.prisma.lesson.create({
                data: payload,
            });
            return LessonMapper_1.LessonMapper.toEntity(lesson);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const lesson = yield db_1.prisma.lesson.findUnique({
                where: { id },
            });
            return lesson ? LessonMapper_1.LessonMapper.toEntity(lesson) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const lessons = yield db_1.prisma.lesson.findMany();
            return lessons.map(LessonMapper_1.LessonMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = Object.assign({}, dto);
            if (payload.description === undefined && 'description' in payload)
                payload.description = null;
            if (payload.content === undefined && 'content' in payload)
                payload.content = null;
            const lesson = yield db_1.prisma.lesson.update({
                where: { id },
                data: payload,
            });
            return LessonMapper_1.LessonMapper.toEntity(lesson);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.lesson.delete({
                where: { id },
            });
        });
    }
}
exports.LessonRepository = LessonRepository;
