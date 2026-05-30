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
exports.CourseRepository = void 0;
const db_1 = require("../db");
const CourseMapper_1 = require("../db/mappers/CourseMapper");
class CourseRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield db_1.prisma.course.create({
                data: Object.assign({}, dto),
            });
            return CourseMapper_1.CourseMapper.toEntity(course);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield db_1.prisma.course.findUnique({
                where: { id },
            });
            return course ? CourseMapper_1.CourseMapper.toEntity(course) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const courses = yield db_1.prisma.course.findMany();
            return courses.map(CourseMapper_1.CourseMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield db_1.prisma.course.update({
                where: { id },
                data: Object.assign({}, dto),
            });
            return CourseMapper_1.CourseMapper.toEntity(course);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.course.delete({
                where: { id },
            });
        });
    }
}
exports.CourseRepository = CourseRepository;
