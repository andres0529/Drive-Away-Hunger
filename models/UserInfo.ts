//User infor type
export interface IUserInfo {
  Name: string;
  ID: string;
  EmailId: string;
  IsOfficeAdmin: boolean;
  IsSuperAdmin: boolean;
  ISRegularUser: boolean;
  IsAuthenticated: boolean;
}

export type UserInfoContextType = {
  userInfo: IUserInfo;
  setLoginUserInfo: (userInfo: IUserInfo) => void;
};
