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
exports.CourseController = void 0;
const CreateCourseDto_1 = require("../../core/repositories/CourseRepository/dto/CreateCourseDto");
const UpdateCourseDto_1 = require("../../core/repositories/CourseRepository/dto/UpdateCourseDto");
class CourseController {
    constructor(courseService) {
        this.courseService = courseService;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = CreateCourseDto_1.CreateCourseSchema.parse(req.body);
                const course = yield this.courseService.create(data);
                res.status(201).json(course);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const course = yield this.courseService.findById(id);
                if (!course) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                res.status(200).json(course);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courses = yield this.courseService.findAll();
                res.status(200).json(courses);
            }
            catch (error) {
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const data = UpdateCourseDto_1.UpdateCourseSchema.parse(req.body);
                const course = yield this.courseService.update(id, data);
                if (!course) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                res.status(200).json(course);
            }
            catch (error) {
                next(error);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                yield this.courseService.delete(id);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.CourseController = CourseController;
