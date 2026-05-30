import {Router} from "express";
import {userRouter} from "./UserRoutes";
import {courseRouter} from "./CourseRoutes";
import {moduleRouter} from "./ModuleRoutes";
import {lessonRouter} from "./LessonRoutes";
import {homeworkRouter} from "./HomeworkRoutes";
import {applicationRouter} from "./ApplicationRoutes";
import {groupRouter} from "./GroupRoutes";
import {sessionRouter} from "./SessionRoutes";
import {courseProgressRouter} from "./CourseProgressRoutes";
import {adminRouter} from "./AdminRoutes";
import {uploadRouter} from "./UploadRoutes";

const apiRouter = Router();

apiRouter.use('/users', userRouter);
apiRouter.use('/courses', courseRouter);
apiRouter.use('/modules', moduleRouter);
apiRouter.use('/lessons', lessonRouter);
apiRouter.use('/homeworks', homeworkRouter);
apiRouter.use('/applications', applicationRouter);
apiRouter.use('/groups', groupRouter);
apiRouter.use('/sessions', sessionRouter);
apiRouter.use('/course-progress', courseProgressRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/upload', uploadRouter);

export { apiRouter };
