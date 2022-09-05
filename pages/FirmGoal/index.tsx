import { LeftOutlined } from "@ant-design/icons";
import { Button } from "@bdo/kitchensink";
import { Link } from "react-router-dom";
import SetGoal from "../../components/SetGoal";
import "./../pageStyle.css";
import { useTranslation } from "react-i18next";
import "../../i18n";
import { UserInfoContext } from "../../context/UserInfoContext";
import { useContext } from "react";

const FirmGoal = () => {
  const { t, i18n } = useTranslation(["home", "main"]);
  const { userInfo, setLoginUserInfo } = useContext(UserInfoContext);
  // if (userInfo.ISRegularUser) {
  return (
    <div className="containerPage">
      <div className="componentPage">
        <SetGoal></SetGoal>
      </div>
      <div className="btnPage">
        <div>
          <Link to={"/"}>
            <Button type="primary">
              <LeftOutlined />
              {t("text62")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
  // } else {
  //   return <></>;
  // }
};

export default FirmGoal;
