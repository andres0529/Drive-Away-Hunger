import { Office } from "./Office";

export interface Location {
    id: number;
    locationName: string;
    office: Office;
    year: string;
    dateCreated: string;
}