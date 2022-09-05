import { Admin } from "./Admin";

export interface OfficeAdmin {
    id: number;
    adminId: number;
    officeId: number;
    dateCreated: string;
    adminName: string;
    userId: string;
    adminType: string;
}