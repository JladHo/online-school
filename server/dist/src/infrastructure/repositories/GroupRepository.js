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
exports.GroupRepository = void 0;
const db_1 = require("../db");
const GroupMapper_1 = require("../db/mappers/GroupMapper");
class GroupRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield db_1.prisma.group.create({
                data: Object.assign({}, dto),
            });
            return GroupMapper_1.GroupMapper.toEntity(group);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield db_1.prisma.group.findUnique({
                where: { id },
            });
            return group ? GroupMapper_1.GroupMapper.toEntity(group) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = yield db_1.prisma.group.findMany();
            return groups.map(GroupMapper_1.GroupMapper.toEntity);
        });
    }
    findGroupsByTeacherId(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = yield db_1.prisma.group.findMany({
                where: { teacherId }
            });
            return groups.map(GroupMapper_1.GroupMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield db_1.prisma.group.update({
                where: { id },
                data: Object.assign({}, dto),
            });
            return GroupMapper_1.GroupMapper.toEntity(group);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.group.delete({
                where: { id },
            });
        });
    }
}
exports.GroupRepository = GroupRepository;
