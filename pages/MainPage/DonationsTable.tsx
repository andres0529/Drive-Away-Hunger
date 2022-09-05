import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  Timeline,
  Card,
  Select,
  Typography,
} from "@bdo/kitchensink";
import { helpHttp } from "../../helper/helpHttp";
import { IDonation } from "./../../models/Donation";
import { Goal } from "../../models/Goal";
import { CaretUpOutlined } from "@ant-design/icons";

import "./style.css";
import { UserInfoContext } from "../../context/UserInfoContext";
import { useTranslation } from "react-i18next";
import NavbarBottom from "../../components/NavbarBottom";
import "../../i18n";

const { Title } = Typography;

const DonationsTable = () => {
  const { t, i18n } = useTranslation(["home", "main"]);

  // **----------------------------------------------context---------------------------
  const { userInfo, setLoginUserInfo } = useContext(UserInfoContext);

  // const userInfo = {
  //   ISRegularUser: false,
  //   IsSuperAdmin : true,
  //   IsOfficeAdmin: false
  // };

  //State to hold Donation data
  const [donation, setDonation] = useState<IDonation[] | []>([]);
  const [donationTotal, setDonationTotal] = useState(0);
  const [goalList, setGoalList] = useState<Goal[]>([]);

  const [selectedYear, setYear] = useState(new Date().getFullYear().toString()); //By default Current year will be selected
  //const [selectedYear, setYear] = useState("");
  const [selectedGoalData, setGoalData] = useState<Goal>();
  let GoalV = 0;

  const host = process.env.REACT_APP_DEV_MODE;
  //Goal Data to populate Year Drop Down
  let goalurl = host + "/api/driveawayhunger/Goal/";
  let donationurl = host + "/api/driveawayhunger/donation/" + selectedYear;
  let api = helpHttp();

  const getAPIData = async (url: string) => {
    let response = await api.get(url);
    if (!response.err) {
      return response;
    } else {
      return [];
    }
  };
  //Image component
  const donationImage = () => {
    let path = process.env.PUBLIC_URL;
    let image = "/MainImage.png";
    return (
      <Card className="dhaCard">
        {<img alt="donationImage" src={path + image} className="dhaImg"></img>}
      </Card>
    );
  };

  const timeLine = (GoalVal: number, DonationTot: number) => {
    if (GoalVal === 0) {
      GoalVal = goalList.find((f) => f.year === selectedYear)?.goalValue ?? 0;
    }
    const range = (start: number, stop: number, step: number) =>
      Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
      );

    const goalTimeLineAmt: Number[] = range(
      0,
      GoalVal ?? 0,
      (GoalVal ?? 0) / 10
    );

    const outputSorted = goalTimeLineAmt.sort(
      (n1, n2) => new Number(n2).valueOf() - new Number(n1).valueOf()
    );

    const donationTotalIndex =
      outputSorted.findIndex((element) => element <= DonationTot) > 0
        ? outputSorted.findIndex((element) => element <= DonationTot)
        : 0;

    outputSorted.splice(donationTotalIndex, 0, DonationTot);

    const outputTimeLineJSX = outputSorted.map((rowValue, index) => (
      // console.log("este: ",index,"  ", rowValue===GoalVal)
      <Timeline.Item
        key="{rowValue}"
        className={(rowValue === GoalVal || donationTotal===rowValue) ? "timeLineItemGoal" : "timeLineItem"}
        dot={
          index === donationTotalIndex ? (
            <CaretUpOutlined className="timeline-icon" />
          ) : null
        }
        color="green"
      >
        {rowValue != null
          ? Math.trunc(rowValue.valueOf()).toLocaleString(i18n.language)
          : null}
      </Timeline.Item>
    ));

    console.log("outputTimeLineJSX", outputTimeLineJSX);

    return (
      <div className="containerTimeLine">
        <Timeline mode="right" className="timeline">
          {outputTimeLineJSX}
        </Timeline>
        {donationImage()}
      </div>
    );
  };

  useEffect(() => {
    getAPIData(goalurl)
      .then((res: Goal[]) => {
        GoalV = res.find((f) => f.year === selectedYear)?.goalValue ?? 0;
        setGoalList(res);
      })
      .then(() => {
        //Populate donation data
        getAPIData(donationurl).then((donation) => {
          setDonation(donation);
          let initialValue = 0;
          let DonationAmtArray = donation.map((m: IDonation) => m.amountTotal);
          console.log(DonationAmtArray);
          let DonationTotal = DonationAmtArray.reduce(
            (previousValue: number, currentValue: number) =>
              previousValue + currentValue,
            initialValue
          );
          console.log(DonationTotal);
          setGoalData(goalList.find((goal) => goal.year === selectedYear));
          setDonationTotal(DonationTotal);
        });
      });
  }, [selectedYear]);

  useEffect(() => {
    getAPIData(goalurl)
      .then((res: Goal[]) => {
        GoalV =
          res.find((f) => f.year === new Date().getFullYear().toString())
            ?.goalValue ?? 0;
        setGoalList(res);
      })
      .then(() => {
        //Populate donation data
        getAPIData(donationurl).then((donation) => {
          setDonation(donation);
          let initialValue = 0;
          let DonationAmtArray = donation.map((m: IDonation) => m.amountTotal);
          console.log(DonationAmtArray);
          let DonationTotal = DonationAmtArray.reduce(
            (previousValue: number, currentValue: number) =>
              previousValue + currentValue,
            initialValue
          );
          console.log(DonationTotal);
          setGoalData(
            goalList.find(
              (goal) => goal.year === new Date().getFullYear().toString()
            )
          );
          setDonationTotal(DonationTotal);
        });
      });
  }, []);

  //   const populateDonationData = () => {
  //     api.get(url).then((res) => {
  //       console.log("populateDonationData res >>>>>>>>>>> ", res);
  //       if (!res.err && res.length > 0) {
  //         setDonation(res);
  //         // Setting the Grand Total of Donations
  //         console.log("<<<<<<<donation>>>", donation);
  //         setDonationTotal(
  //           donation
  //             .map((m) => m.amountTotal)
  //             .reduce(
  //               (previousValue, currentValue) => previousValue + currentValue
  //             )
  //         );
  //       } else {
  //         setDonation([]);
  //         setDonationTotal(0);
  //       }
  //     });
  //   };

  //   const CallGoalUrl = async () => {
  //     await api.get(goalurl).then((res: Goal[]) => {
  //       console.log("1 Running Goal .", res);
  //       //if (!res.err) {
  //       try {
  //         console.log("1.1 setGoalList .");
  //         let goalRec: Goal[] = res;
  //         setGoalList([...goalRec]);

  //         console.log("1.2 setGoalList .", goalList);
  //         console.log("1.2 setGoalList .", goalRec);
  //         // handleYearSelectionChange();
  //       } catch (e: any) {
  //         console.log("Error", e);
  //       }
  //       //}
  //     });
  //   };

  //   //use effect hook to populate year list at the time of load

  //   //use effect hook to populate year list at the time of load
  //   useEffect(() => {
  //     api.get(goalurl).then((res) => {
  //       if (!res.err) {
  //         try {
  //           setGoalList(res);
  //           handleYearSelectionChange(selectedYear);
  //         } catch (e: any) {
  //           alert("error");
  //         }

  //         setGoalData(goalList.find((goal) => goal.year == selectedYear)); //Set the current year goal data
  //         console.log("selectedYear USEEFF", res);
  //         console.log("GoalData  USEEFF", selectedGoalData);
  //       } else {
  //         setGoalList([]);
  //       }
  //     });
  //   }, [selectedYear]);

  //   //handle year selection change
  //   const handleYearSelectionChange = (year: string) => {
  //     populateDonationData();
  //     setGoalData(goalList.find((goal) => goal.year == selectedYear)); //Set the selected year goal data
  //     console.log("selectedYear", selectedYear);
  //     console.log("GoalData", selectedGoalData);
  //     console.log("DonationTotal", donationTotal);
  //   };

  //   //time line component
  //   const timeLine = () => {
  //     console.log("3 Running Time Line .");

  //     const range = (start: number, stop: number, step: number) =>
  //       Array.from(
  //         { length: (stop - start) / step + 1 },
  //         (_, i) => start + i * step
  //       );

  //     const goalTimeLineAmt: Number[] = range(
  //       0,
  //       selectedGoalData?.goalValue ?? 0,
  //       (selectedGoalData?.goalValue ?? 0) / 10
  //     );

  //     const outputSorted = goalTimeLineAmt.sort(
  //       (n1, n2) => new Number(n2).valueOf() - new Number(n1).valueOf()
  //     );

  //     const donationTotalIndex =
  //       outputSorted.findIndex((element) => element <= donationTotal) > 0
  //         ? outputSorted.findIndex((element) => element <= donationTotal)
  //         : 0;

  //     outputSorted.splice(donationTotalIndex, 0, donationTotal);

  //     console.log("donationTotalIndex", donationTotalIndex);
  //     console.log("donationTotal", donationTotal);
  //     console.log("outputTimeLineJSX3www3", outputSorted);
  //     console.log("selectedGoalData", selectedGoalData);

  //     const outputTimeLineJSX = outputSorted.map((rowValue, index) => (
  //       <Timeline.Item
  //         key="{donationTotalIndex}"
  //         className="timeLineItem"
  //         dot={
  //           index == donationTotalIndex ? (
  //             <CaretUpOutlined className="timeline-icon" />
  //           ) : null
  //         }
  //         color="green"
  //       >
  //         {rowValue}
  //       </Timeline.Item>
  //     ));

  //     console.log("outputTimeLineJSX", outputTimeLineJSX);

  //     return (
  //       <div className="containerTimeLine">
  //         <Timeline mode="right" className="timeline">
  //           {outputTimeLineJSX}
  //         </Timeline>
  //         {donationImage()}
  //       </div>
  //     );
  //   };

  //   //Image component
  //   const donationImage = () => {
  //     let path = process.env.PUBLIC_URL;
  //     let image = "/MainImage.png";
  //     return (
  //       <Card className="dhaCard">
  //         {<img alt="donationImage" src={path + image} className="dhaImg"></img>}
  //       </Card>
  //     );
  //   };

  const yearSelection = () => {
    // if the api returned data show it
    if (goalList.length !== 0) {
      // sort the list by year
      goalList.sort((a: Goal, b: Goal) => {
        return parseInt(a.year) - parseInt(b.year); //turn the string into a number
      });
      return (
        <Select
          className="select"
          placeholder={t("text42")}
          defaultValue={selectedYear}
          onChange={(e) => {
            setYear(e.toString());
          }}
        >
          {goalList.map((goal: Goal) => (
            <Select.Option key={goal.year} value={goal.year}>
              {goal.year}
            </Select.Option>
          ))}
        </Select>
      );
    }
    // else {
    //   return <Select className="select" placeholder={t("text42")}></Select>;
    // }
  };

  //   //get the data

  //   useEffect(() => {
  //     populateDonationData();
  //   }, [url]);

  //Assign DataSource
  // const dataSource = donation;

  const formatter = new Intl.NumberFormat(i18n.language, {
    style: "currency",
    currency: "USD",
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });
  const dataSource = donation.map((record: IDonation) => {
    return {
      officeId: record.officeId,
      year: record.year,
      amountTotal: record.amountTotal != null ? formatter.format(record.amountTotal).replace("US", "") : null,
      officeName: record.officeName,
      rank: record.rank,
    };
  });

  const columns = [
    {
      title: t("text29"),
      dataIndex: "rank",
      key: "rank",
    },
    {
      title: t("text25"),
      dataIndex: "officeName",
      key: "officeName",
    },
    {
      title: t("text9"),
      dataIndex: "amountTotal",
      key: "amountTotal",
    },
  ];

  return (
    <>
      <br />
      <br />
      <div className="container">
        <div className="officeTableComponent mainPage">
          <div className="select-year">
                      <div className="select-year-label">
                          {!userInfo.ISRegularUser ? (
                              <>
                                  <Title level={5}>{t("text43")}</Title>
                                  </>
                          ) : "" }

              {/* If the user is SuperAdmin show the dropdown, in other case hide it*/}
              {userInfo.IsSuperAdmin ? (
                <>
                  <label>{t("text33")}</label> {yearSelection()}
                </>
              ) : (
                ""
              )}
            </div>
          </div>
          <br />
          <div className="containerTimeLine">
            <div>{timeLine(GoalV ?? 0, donationTotal ?? 0)}</div>
            {/* <div>{donationImage()}</div> */}
          </div>
          {/* <div className="container"> */}
          <Table
            className="table"
            dataSource={dataSource}
            columns={columns}
            pagination={{
              defaultPageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "20", "50", "100"],
            }}
          />
        </div>

        <NavbarBottom />
      </div>
    </>
  );
};
export default DonationsTable;
