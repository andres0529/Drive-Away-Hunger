import { Button } from "@bdo/kitchensink";
import { Link } from "react-router-dom";
import "./style.css";
import { useTranslation } from "react-i18next";
import "../../i18n";
import { UserInfoContext } from "../../context/UserInfoContext";
import { useContext } from "react";

const NavbarBottom = () => {
  const { t, i18n } = useTranslation(["home", "main"]);
  // **----------------------------------------------context---------------------------
  const { userInfo, setLoginUserInfo } = useContext(UserInfoContext);
  
  // const userInfo = {
  //   ISRegularUser: false,
  //   IsSuperAdmin: false,
  //   IsOfficeAdmin: true,
  // ...
  // };


  /* If regularUser is false, then show the 2 buttons and evalueates the 3rd button in the next condition */
  if (!userInfo.ISRegularUser) {
    return (
      <div className="navbarBottom">
        <div className="menuButtons">
          <div>
            <Link to={"/donation"}>
              <Button type="primary">{t("text60")}</Button>
            </Link>
          </div>

          <div>
            <Link to={"/offices"}>
              <Button type="primary">{t("text61")}</Button>
            </Link>
          </div>
          {/* This button is only displayed if IsOfficeAdmin is false (If the user IS ADMIN the button is hidden)*/}
          {!userInfo.IsOfficeAdmin ? (
            <div>
              <Link to={"/setgoal"}>
                <Button type="primary">{t("text35")}</Button>
              </Link>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default NavbarBottom;
