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
exports.GroupController = void 0;
const CreateGroupDto_1 = require("../../core/repositories/GroupRepository/dto/CreateGroupDto");
class GroupController {
    constructor(groupService) {
        this.groupService = groupService;
    }
    createGroup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = CreateGroupDto_1.CreateGroupSchema.parse(req.body);
                const group = yield this.groupService.createGroup(data);
                res.status(201).json(group);
            }
            catch (error) {
                next(error);
            }
        });
    }
    assignTeacher(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const { teacherId } = req.body;
                const updatedGroup = yield this.groupService.assignTeacher(id, teacherId);
                res.status(200).json(updatedGroup);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateGroup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const updatedGroup = yield this.groupService.updateGroup(id, req.body);
                res.status(200).json(updatedGroup);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteGroup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                yield this.groupService.deleteGroup(id);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    claimStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const teacherId = parseInt(String(req.params.teacherId), 10);
                const { studentId, courseId } = req.body;
                const link = yield this.groupService.claimStudent(teacherId, studentId, courseId);
                res.status(201).json(link);
            }
            catch (error) {
                next(error);
            }
        });
    }
    addStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const { studentId } = req.body;
                const link = yield this.groupService.addStudent(id, studentId);
                res.status(201).json(link);
            }
            catch (error) {
                next(error);
            }
        });
    }
    removeStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const groupId = parseInt(String(req.params.id), 10);
                const studentId = parseInt(String(req.params.studentId), 10);
                yield this.groupService.removeStudent(groupId, studentId);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    listGroupStudents(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const students = yield this.groupService.listGroupStudents(id);
                res.status(200).json(students);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllGroups(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const groups = yield this.groupService.getAllGroups();
                res.status(200).json(groups);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getGroupsByTeacherId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const teacherId = parseInt(String(req.params.teacherId), 10);
                const groups = yield this.groupService.getGroupsByTeacherId(teacherId);
                res.status(200).json(groups);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateStudentNote(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const groupId = parseInt(String(req.params.groupId), 10);
                const studentId = parseInt(String(req.params.studentId), 10);
                const { note } = req.body;
                const link = yield this.groupService.updateStudentNote(groupId, studentId, note);
                res.status(200).json(link);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.GroupController = GroupController;
