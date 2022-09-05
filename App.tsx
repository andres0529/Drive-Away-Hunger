import React, { useState, useEffect, useContext } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  MsalProvider,
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useIsAuthenticated,
} from "@azure/msal-react";
//import Button from "@bdo/kitchensink/lib/components/button/Button";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Button, Switch } from "@bdo/kitchensink";
import "@bdo/kitchensink/lib/styles/index.css";
import DonationsTable from "./pages/MainPage/DonationsTable";
import {
  PublicClientApplication,
  IPublicClientApplication,
  AuthenticationResult,
} from "@azure/msal-browser";

import { loginRequest } from "./authConfig";
import { callMsGraph } from "./graph";
import { ProfileData } from "./components/ProfileData";
import UserInfoProvider, { UserInfoContext } from "./context/UserInfoContext";
import { IUserInfo, UserInfoContextType } from "./models/UserInfo";
import { helpHttp } from "./helper/helpHttp";
import { setTimeout } from "timers/promises";
import {
  BrowserRouter,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import DonationMgmt from "./pages/DonationMgmt/DonationMgmt";
import FirmGoal from "./pages/FirmGoal";
import Offices from "./pages/Offices";
import { useTranslation } from "react-i18next";
import "./i18n";

const ProfileContent = () => {
  const { instance, accounts } = useMsal();
  const [graphData, setGraphData] = useState(null);

  function RequestProfileData1() {
    // Silently acquires an access token which is then attached to a request for MS Graph data
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      .then((response) => {
        console.log("Access Token>>", response);
        callMsGraph(response.accessToken).then((response) => {
          setGraphData(response);
        });
      });
  }

  return (
    <>
      <h5 className="card-title">Welcome {accounts[0].name}</h5>
      {graphData ? (
        <ProfileData graphData={graphData} />
      ) : (
        <button onClick={RequestProfileData1}>
          Request Profile Information
        </button>
      )}
    </>
  );
};


// const host = "https://bdo-ca1-dah-api-dev-01.azurewebsites.net";
// let url = host + "/api/driveawayhunger/UserRoles/";
const host = process.env.REACT_APP_DEV_MODE;
let url = host + "/api/driveawayhunger/UserRoles/";
let api = helpHttp();

//MainContent Component
const MainContent = () => {
  const { t, i18n } = useTranslation(["home", "main"]);
  let lan = "/" + i18n.language;
  console.log("Language is ", lan);
  // const [IsAuthenticated, setAuthenticated] = useState(-1);
  const { instance, accounts } = useMsal();
  const { userInfo, setLoginUserInfo } = useContext(UserInfoContext);
  const [SSOErrorFlag, setSSOErrorFlag] = useState(false);
  const GraphUserInfo = {} as IUserInfo;

  const RequestProfileData = async (val: AuthenticationResult["account"]) => {
    console.log("account >>  account: accounts[0]", accounts[0]);
    console.log("val >>", val);
    // Silently acquires an access token which is then attached to a request for MS Graph data
    await instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0] ?? val,
      })
      .then((response) => {
        console.log("Access Token>>", response);
        callMsGraph(response.accessToken)
          .then((response) => {
            GraphUserInfo.ID = response["id"];
            GraphUserInfo.Name = response["displayName"];
            GraphUserInfo.EmailId = response["userPrincipalName"];
            GraphUserInfo.EmailId = GraphUserInfo.EmailId.slice(
              0,
              GraphUserInfo.EmailId.indexOf("@")
            ).toLowerCase();
            GraphUserInfo.IsOfficeAdmin = false;
            GraphUserInfo.IsSuperAdmin = false;
            GraphUserInfo.ISRegularUser = true;
            GraphUserInfo.IsAuthenticated = true;
          })
          .then((response) => {
            RequestUserRole(GraphUserInfo.EmailId);
          });
      });
  };

  //Get User Role and Update to the User Info
  const RequestUserRole = async (userEmailID: string) => {
    //  let userID = userEmailID.slice(0, userEmailID.indexOf("@"));
    let userID = userEmailID;
    let URLCall = url + userID;
    await api.get(URLCall).then((res) => {
      GraphUserInfo.IsOfficeAdmin = res["officeAdmin"];
      GraphUserInfo.IsSuperAdmin = res["superAdmin"];
      GraphUserInfo.ISRegularUser = res["regularUser"];
      setLoginUserInfo(GraphUserInfo);
    });
  };

  useEffect(() => {
    //Single Sign On
    const handleLoginSSO = async () => {
      console.log(
        "********++++++++++++++ APP STARTED QA ++++++++++++++**********"
        
      );
      await instance
        .ssoSilent(loginRequest)
        .then((val: AuthenticationResult) => {
          console.log(
            "++++++++++************RequestProfileData Start *****************++++++++++",
            val
          );
          RequestProfileData(val.account);

          console.log(
            "++++++++++************RequestProfileData End *****************++++++++++"
          );
        })
        .catch((e: any) => {
          //     setSSOErrorFlag(true);
          console.log("Error in SSO 1 >>", e);
        });
    };
    //run SSO Sign on
    handleLoginSSO().catch((e: any) => {
      //    setSSOErrorFlag(true);
      console.log("Error in SSO 2 >>", e);
      //   handleLoginRD();
    });
  }, []);

  //popup
  const handleLoginPop = async () => {
    await instance
      .loginPopup(loginRequest)
      .then((response: any) => {
        console.log("check", response);
      })
      .catch((e: any) => {
        console.log("Error in PopUp >>", e);
      });
  };
  //Redirect
  const handleLoginRD = async () => {
    await instance
      .loginRedirect(loginRequest)
      .then(() => {
        RequestProfileData(accounts[0]);
      })
      .catch((e: any) => {
        console.log("Error in Redirect >>", e);
      });
  };

  return (
    <div className="App">
      <AuthenticatedTemplate>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DonationsTable />} />
            <Route path={lan} element={<DonationsTable />} />
            <Route path="/setgoal" element={<FirmGoal />} />
            <Route path="/offices" element={<Offices />} />
            {/* <Route path="fr/offices" element={<Offices />} />*/}
            <Route path="/donation" element={<DonationMgmt />} />
            {/*<Route path="fr/donation" element={<DonationMgmt />} />*/}
          </Routes>
        </BrowserRouter>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        {SSOErrorFlag && <h5>Please sign-in.</h5> && (
          <button onClick={() => handleLoginRD()}>Login</button>
        )}
      </UnauthenticatedTemplate>
    </div>
  );
};

function App() {
  // const isAuthenticated = useIsAuthenticated();

  return (
    <React.Fragment>
      {
        <UserInfoProvider>
          <MainContent />
        </UserInfoProvider>
      }
    </React.Fragment>
  );
}

export default App;
