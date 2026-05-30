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
exports.UserRepository = void 0;
const db_1 = require("../db");
const UserMapper_1 = require("../db/mappers/UserMapper");
class UserRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.create({
                data: Object.assign({}, data),
            });
            return UserMapper_1.UserMapper.toEntity(user);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.user.delete({
                where: { id },
            });
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield db_1.prisma.user.findMany();
            return users.map(UserMapper_1.UserMapper.toEntity);
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.findUnique({
                where: { email },
            });
            return user ? UserMapper_1.UserMapper.toEntity(user) : null;
        });
    }
    findByEmailWithPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.findUnique({
                where: { email },
            });
            return user ? UserMapper_1.UserMapper.toEntityWithPassword(user) : null;
        });
    }
    findByPhone(phone) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.findFirst({
                where: { phone },
            });
            return user ? UserMapper_1.UserMapper.toEntity(user) : null;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.findUnique({
                where: { id },
            });
            return user ? UserMapper_1.UserMapper.toEntity(user) : null;
            ;
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.update({
                where: { id },
                data: Object.assign({}, dto)
            });
            return user ? UserMapper_1.UserMapper.toEntity(user) : null;
        });
    }
}
exports.UserRepository = UserRepository;
