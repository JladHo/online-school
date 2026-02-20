import {Router} from "express";
import {userRouter} from "./UserRoutes";

const apiRouter = Router();

apiRouter.use('/users', userRouter);

export { apiRouter };