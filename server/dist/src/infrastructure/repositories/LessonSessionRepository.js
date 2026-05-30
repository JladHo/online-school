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
exports.LessonSessionRepository = void 0;
const db_1 = require("../db");
const LessonSessionMapper_1 = require("../db/mappers/LessonSessionMapper");
class LessonSessionRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield db_1.prisma.lessonSession.create({
                data: Object.assign({}, dto),
            });
            return LessonSessionMapper_1.LessonSessionMapper.toEntity(session);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield db_1.prisma.lessonSession.findUnique({
                where: { id },
            });
            return session ? LessonSessionMapper_1.LessonSessionMapper.toEntity(session) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const sessions = yield db_1.prisma.lessonSession.findMany();
            return sessions.map(LessonSessionMapper_1.LessonSessionMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield db_1.prisma.lessonSession.update({
                where: { id },
                data: Object.assign({}, dto),
            });
            return LessonSessionMapper_1.LessonSessionMapper.toEntity(session);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.lessonSession.deleteMany({
                where: { id },
            });
        });
    }
}
exports.LessonSessionRepository = LessonSessionRepository;
