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
exports.SessionController = void 0;
const CreateLessonSessionDto_1 = require("../../core/repositories/LessonSessionRepository/dto/CreateLessonSessionDto");
class SessionController {
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    createLessonSession(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Creating session:", req.body);
                const data = CreateLessonSessionDto_1.CreateLessonSessionSchema.parse(req.body);
                const session = yield this.sessionService.createLessonSession(data);
                res.status(201).json(session);
            }
            catch (error) {
                console.error("Error creating session:", error);
                next(error);
            }
        });
    }
    updateLessonSession(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const session = yield this.sessionService.updateLessonSession(id, req.body);
                if (!session) {
                    res.status(404).json({ message: 'Сессия не найдена' });
                    return;
                }
                res.status(200).json(session);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteLessonSession(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                yield this.sessionService.deleteLessonSession(id);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllSessions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessions = yield this.sessionService.getAllSessions();
                res.status(200).json(sessions);
            }
            catch (error) {
                next(error);
            }
        });
    }
    markAttendance(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = parseInt(String(req.params.id), 10);
                const { studentId, isPresent } = req.body;
                const attendance = yield this.sessionService.markAttendance(sessionId, studentId, isPresent);
                res.status(200).json(attendance);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAttendance(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = parseInt(String(req.params.id), 10);
                const attendances = yield this.sessionService.getAttendanceBySessionId(sessionId);
                res.status(200).json(attendances);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAttendancesByStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const studentId = parseInt(String(req.params.studentId), 10);
                const attendances = yield this.sessionService.getAttendancesByStudentId(studentId);
                res.status(200).json(attendances);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.SessionController = SessionController;
