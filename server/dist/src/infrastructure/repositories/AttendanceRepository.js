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
exports.AttendanceRepository = void 0;
const db_1 = require("../db");
const AttendanceMapper_1 = require("../db/mappers/AttendanceMapper");
class AttendanceRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const attendance = yield db_1.prisma.attendance.create({
                data: Object.assign({}, dto),
            });
            return AttendanceMapper_1.AttendanceMapper.toEntity(attendance);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const attendance = yield db_1.prisma.attendance.findUnique({
                where: { id },
            });
            return attendance ? AttendanceMapper_1.AttendanceMapper.toEntity(attendance) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const attendances = yield db_1.prisma.attendance.findMany();
            return attendances.map(AttendanceMapper_1.AttendanceMapper.toEntity);
        });
    }
    findAttendancesByStudentId(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const attendances = yield db_1.prisma.attendance.findMany({
                where: { studentId }
            });
            return attendances.map(AttendanceMapper_1.AttendanceMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const attendance = yield db_1.prisma.attendance.update({
                where: { id },
                data: Object.assign({}, dto),
            });
            return AttendanceMapper_1.AttendanceMapper.toEntity(attendance);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.attendance.delete({
                where: { id },
            });
        });
    }
}
exports.AttendanceRepository = AttendanceRepository;
