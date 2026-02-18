import {ApplicationStatus} from "../../../entities/ApplicationEntity";
export interface UpdateApplicationDto {
    status?: ApplicationStatus;
}