//import { AdminName } from "./AdminName";
import { ReactElement } from "react";
import { OfficeAdmin } from "./OfficeAdmin";

export interface Office {
  id: number;
  officeName: string;
  year: string;
  //officeAdminId: number;
  dateCreated: string;
  locationIdAPI: string;
  officeAdminName: AdminName[];
}

export interface AdminName {
  officeAdminId: number;
  officeAdminName: string;
  userId: string;
}

export interface IDataTableOffices {
  key: number;
  officeName: string;
  adminName: string;
  options: ReactElement;
}

export interface IModalAddNewOffice {
  stateModalAddNewOffice: {
    setModalAddNewOffice: React.Dispatch<React.SetStateAction<any>>;
    modalAddNewOffice: {
      officeId: number;
      visible: boolean;
    };
  };
  year: string;
  populateOfficeTable: Function;
}
