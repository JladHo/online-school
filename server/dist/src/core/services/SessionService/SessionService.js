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
exports.SessionService = void 0;
const HttpError_1 = require("../../../errors/HttpError");
class SessionService {
    constructor(sessionRepository, attendanceRepository) {
        this.sessionRepository = sessionRepository;
        this.attendanceRepository = attendanceRepository;
    }
    createLessonSession(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessionRepository.create(dto);
        });
    }
    updateLessonSession(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessionRepository.update(id, dto);
        });
    }
    deleteLessonSession(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessionRepository.delete(id);
        });
    }
    getAllSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessionRepository.findAll();
        });
    }
    markAttendance(sessionId, studentId, isPresent) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.sessionRepository.findById(sessionId);
            if (!session) {
                throw new HttpError_1.NotFoundError('Сессия не найдена');
            }
            // Check if attendance record already exists
            const allAttendances = yield this.attendanceRepository.findAll();
            const existingAttendance = allAttendances.find(a => a.sessionId === sessionId && a.studentId === studentId);
            if (existingAttendance) {
                const updated = yield this.attendanceRepository.update(existingAttendance.id, { isPresent });
                if (!updated) {
                    throw new HttpError_1.NotFoundError('Не удалось обновить посещаемость');
                }
                return updated;
            }
            return this.attendanceRepository.create({
                sessionId,
                studentId,
                isPresent
            });
        });
    }
    getAttendanceBySessionId(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const allAttendances = yield this.attendanceRepository.findAll();
            return allAttendances.filter(a => a.sessionId === sessionId);
        });
    }
    getAttendancesByStudentId(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.attendanceRepository.findAttendancesByStudentId(studentId);
        });
    }
}
exports.SessionService = SessionService;
