"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
class UserMapper {
    static toEntity(user) {
        return {
            id: user.id,
            parentName: user.parentName,
            studentName: user.studentName,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            role: user.role,
            birthday: user.birthday,
            bonusPoints: user.bonusPoints,
        };
    }
    static toEntityWithPassword(user) {
        return Object.assign(Object.assign({}, UserMapper.toEntity(user)), { password: user.password });
    }
}
exports.UserMapper = UserMapper;
