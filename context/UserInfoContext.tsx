import React, { createContext, useState, FC } from "react";
import { IUserInfo, UserInfoContextType } from "../models/UserInfo";

//type

//Default
const contextDefaultValue: UserInfoContextType = {
  userInfo: {} as IUserInfo,
  setLoginUserInfo: () => {},
};

//Context
export const UserInfoContext =
  createContext<UserInfoContextType>(contextDefaultValue);

//Provider
const UserInfoProvider: FC = ({ children }) => {
  const [userInfo, setUserInfoState] = useState<IUserInfo>(
    contextDefaultValue.userInfo
  );

  const setLoginUserInfo = (userInfoInput: IUserInfo) => {
    console.log("IN CONTEXT", userInfoInput);
    setUserInfoState(userInfoInput);
  };

  //pass as a object
  return (
    <UserInfoContext.Provider value={{ userInfo, setLoginUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
};

export default UserInfoProvider;
