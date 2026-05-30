import { Request, Response, NextFunction } from 'express';
import { GroupService } from '../../core/services/GroupService/GroupService';
import { CreateGroupSchema } from '../../core/repositories/GroupRepository/dto/CreateGroupDto';

export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    async createGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const data = CreateGroupSchema.parse(req.body);
            const group = await this.groupService.createGroup(data);
            res.status(201).json(group);
        } catch (error) {
            next(error);
        }
    }

    async assignTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const { teacherId } = req.body;
            const updatedGroup = await this.groupService.assignTeacher(id, teacherId);
            res.status(200).json(updatedGroup);
        } catch (error) {
            next(error);
        }
    }

    async updateGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const updatedGroup = await this.groupService.updateGroup(id, req.body);
            res.status(200).json(updatedGroup);
        } catch (error) {
            next(error);
        }
    }

    async deleteGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            await this.groupService.deleteGroup(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async claimStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const teacherId = parseInt(String(req.params.teacherId), 10);
            const { studentId, courseId } = req.body;
            const link = await this.groupService.claimStudent(teacherId, studentId, courseId);
            res.status(201).json(link);
        } catch (error) {
            next(error);
        }
    }

    async addStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const { studentId } = req.body;
            const link = await this.groupService.addStudent(id, studentId);
            res.status(201).json(link);
        } catch (error) {
            next(error);
        }
    }

    async removeStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = parseInt(String(req.params.id), 10);
            const studentId = parseInt(String(req.params.studentId), 10);
            await this.groupService.removeStudent(groupId, studentId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async listGroupStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const students = await this.groupService.listGroupStudents(id);
            res.status(200).json(students);
        } catch (error) {
            next(error);
        }
    }

    async getAllGroups(req: Request, res: Response, next: NextFunction) {
        try {
            const groups = await this.groupService.getAllGroups();
            res.status(200).json(groups);
        } catch (error) {
            next(error);
        }
    }

    async getGroupsByTeacherId(req: Request, res: Response, next: NextFunction) {
        try {
            const teacherId = parseInt(String(req.params.teacherId), 10);
            const groups = await this.groupService.getGroupsByTeacherId(teacherId);
            res.status(200).json(groups);
        } catch (error) {
            next(error);
        }
    }

    async updateStudentNote(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = parseInt(String(req.params.groupId), 10);
            const studentId = parseInt(String(req.params.studentId), 10);
            const { note } = req.body;
            const link = await this.groupService.updateStudentNote(groupId, studentId, note);
            res.status(200).json(link);
        } catch (error) {
            next(error);
        }
    }
}
