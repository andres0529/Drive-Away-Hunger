import { LeftOutlined } from "@ant-design/icons";
import { Button } from "@bdo/kitchensink";
import { Link } from "react-router-dom";
import OfficeTable from "../../components/OfficeTable";
import "./../pageStyle.css";
import { useTranslation } from "react-i18next";
import "../../i18n";
import { useContext } from "react";
import { UserInfoContext } from "../../context/UserInfoContext";

const Offices = () => {
  const { t, i18n } = useTranslation(["home", "main"]);
  const { userInfo, setLoginUserInfo } = useContext(UserInfoContext);

  // if (userInfo.ISRegularUser) {
  return (
    <div className="containerPage">
      <div className="componentPage">
        <OfficeTable></OfficeTable>
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

export default Offices;
