import { Office } from "./Office";

export interface Transaction {
  id: number;
  officeId: string;
  officeName: string;
  year: string;
  amount: any;
  description: string;
  dateCreated: string;
  active_yn: string;
  userId: string;
}
