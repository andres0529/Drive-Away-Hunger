import React, { useContext, ReactElement, useEffect, useState } from "react";
import { helpHttp } from "../../helper/helpHttp";
import "./style.css";
import { UserInfoContext } from "../../context/UserInfoContext";
import { Transaction } from "../../models/Transaction";
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  Tooltip,
  Typography,
  Form,
  InputNumber,
  Layout,
} from "@bdo/kitchensink";
import { EditOutlined, LeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Office, AdminName } from "../../models/Office";
import { preProcessFile } from "typescript";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../i18n";
import { Goal } from "../../models/Goal";

const { Title } = Typography;
//const TableTitle = t("text60" );

const DonationMgmt = () => {
  const { userInfo, setLoginUserInfo } = useContext(UserInfoContext);
  const { t, i18n } = useTranslation(["home", "main"]);

  const TableTitle = t("text60");

  //State to hold Donation transaction data
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  //Edit Donation visibilty
  const [ShowDonationEditing, SetShowingDonationEditing] = useState(false);

  //Add Donation visibilty
  const [ShowDonationAddition, SetShowingDonationAddition] = useState(false);

  //To hold Edit donation record
  const [editDonation, setEditDonation] = useState<Transaction>(
    {} as Transaction
  );
  //To hold a donation record
  const [addDonation, setAddDonation] = useState<Transaction>();

  //User office List
  const [usrOfficeList, setUsrOfficeList] = useState<Office[]>([]);
  //Selected Year
  const [selectedYear, setYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  //Add Donation Data
  const [donationAmount, setDonationAmt] = useState<number | any>();
  const [donationDesc, setDonationDesc] = useState("");
  const [donationOfficeId, setDonationOfficeId] = useState<number | any>();
  const [goalList, setGoalList] = useState<Goal[]>([]);

  const host = process.env.REACT_APP_DEV_MODE;
  let url =
    host +
    "/api/driveawayhunger/Transaction/" +
    selectedYear +
    "/" +
    userInfo.EmailId;
    let api = helpHttp();

  //Office Data to populate office Drop Down -
  let userOfficesUrl =
    host + "/api/driveawayhunger/Office/OfficebyUserId/" + userInfo.EmailId;

  //Add Donation Transaction
  let addDonationTransactionsUrl =
    host + "/api/driveawayhunger/Transaction/" + selectedYear;

  const populateUserOfficeList = () => {
    api.get(userOfficesUrl).then((res) => {
      console.log(" DM: Office List Response >> ", res);
      if (!res.err && res.length > 0) {
        setUsrOfficeList(res);
      } else {
        setUsrOfficeList([]);
      }
    });
  };

  const populateGoalList = () => {
    let goalurl = host + "/api/driveawayhunger/Goal/";

    api.get(goalurl).then((res) => {
      if (!res.err && res.length > 0) {
        setGoalList(res);
        populateTransactionData();
        populateUserOfficeList();
      } else {
        console.log("error: ", res);
      }
    });
  };

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
    //   // return <Select className="select" placeholder={t("text42")}></Select>;
    //   return <Select className="select" placeholder={t("text42")}></Select>;
    // }
  };

  const AddDonationData = () => {
    const requestOption = {
      method: "POST",
      headers: { "Content-Type": "application/json", charset: "utf-8" },
      body: {
        officeId: donationOfficeId,
        year: selectedYear,
        amount: donationAmount,
        description: donationDesc,
        dateCreated: "2022-08-10T15:56:50.1508477",
        //new Date().toString(),
        active_YN: "Y",
        userId: userInfo.EmailId,
      },
    };
    console.log(requestOption);
    api.post(addDonationTransactionsUrl, requestOption).then(async (res) => {
      if (!res.err) {
        populateTransactionData();
        setDonationAmt(undefined);
      } else {
         console.log("Error in adding donation", res.err);

        }
        setDonationAmt(undefined);
    });
  };

  //Edit Donation Data API Call
  const EditDonationData = () => {
    const requestOption = {
      method: "PUT",
      headers: { "Content-Type": "application/json", charset: "utf-8" },
      body: {
        id: editDonation.id,
        officeId: editDonation.officeId,
        year: editDonation.year,
          amount: editDonation.amount.replace('$', '').replace(/,/g, ".").trim(),
        description: editDonation.description,
        dateCreated: "2022-08-10T15:56:50.1508477",
        //new Date().toString(),
        active_YN: "Y",
        userId: userInfo.EmailId,
      },
    };
    console.log(requestOption);
    api.put(addDonationTransactionsUrl, requestOption).then(async (res) => {
      if (!res.err) {
        populateTransactionData();
      } else {
        console.log("Error in adding donation", res.err);
      }
    });
  };

  const populateTransactionData = () => {

      const formatter = new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "USD",
      //minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
      //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });
    //  const formatter = new Intl.NumberFormat(i18n.language);




    api.get(url).then((res) => {
      if (!res.err && res.length > 0) {
        let fixTime = res.map((trans: Transaction) => {
          let currency = trans.amount != null ? formatter.format(parseFloat(trans.amount)).replace("US","") : null;

          return { ...trans, dateCreated: trans.dateCreated.slice(0, 10), amount: currency };
        });

        setTransactions(fixTime);
      } else {
        setTransactions([]);
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0)
    populateGoalList();
  }, [selectedYear]);

  // Set up Table
  //Assign DataSource
  // const dataSource = transactions;
  const Option = Select.Option;
  //Edit Donation
  const onEditDonation = (record: Transaction) => {
    SetShowingDonationEditing(true);
    //Set Edit Donation Records State
    setEditDonation({ ...record });
  };

  const handleDonation = () => {
    SetShowingDonationAddition(true);

    //Set Donation Record State
    // setAddDonation({ ...record });
  };

  //Edit Donation Modal
    const ModalModifyDonation = () => {
        const handleInputNumber = (num: string) => {
            let val = num;
            let last = val.substring(0, val.length - 3)
            let lengthWithoutDec = num.length;
            lengthWithoutDec = lengthWithoutDec -4;
            //let last1 = val.slice(val.length - 3)
          //  val = last              //.replace(/,|\.(?=.*\.)/g, '').replace('$', '');

             //value={editDonation?.amount.slice(0, editDonation?.amount.length - 3).replace(/,|\.(?=.*\.)/g, '').replace('$', '')}
            //replaceAll(',', '.')x
            let yy = val.replace('$', '').substring(0, lengthWithoutDec).replace(/\s/g, '');
           alert(yy);
            return yy
        } 
    return (
      <Modal
        title={t("text70")}
        visible={ShowDonationEditing}
        okText={t("text31")}
        cancelText={t("text10")}
        onCancel={() => {
          SetShowingDonationEditing(false);
        }}
            onOk={() => {

             
               
                if (editDonation.amount.trim() === '') {
                    error(
                        t("text71")
                    );
                }
                else if (isNaN(editDonation.amount.replace('$', '').replace(/,/g, "."))) {
                    error(
                        t("text71")
                    );
                }
                else if (editDonation.description.trim().length == 0) {
                    error(
                        t("text71")
                    );
                }
                else if (!(editDonation.amount.replace('$', '').replace(/,/g, ".") >= 0 && editDonation.description.length > 0))
           {
            error(
                t("text71")
            );
          } else {
            EditDonationData();
            SetShowingDonationEditing(false);
          }
        }}
        closable={true}
      >
        <div className="container setDonationComponent">
          <div className="inputContainer">
           <label>{t("text8")}</label>
          </div>
          <div className="inputContainer">
            <Input
                            placeholder={t("text67")}
            //            value={handleInputNumber(editDonation?.amount)}
                        value={i18n.language != 'en' ? editDonation?.amount.replace('$', '').replace(/\s/g, '') : editDonation?.amount.replace('$', '').replaceAll(',', '').replace(/\s/g, '') }
//                        {editDonation?.amount.replace('$', '').slice(0, editDonation?.amount.length - 3)}
                        //value={editDonation?.amount.slice(0, editDonation?.amount.length - 3).replace(/,|\.(?=.*\.)/g, '').replace('$', '')}
                      onChange={(e) => {
                setEditDonation((pre: any) => {
                  return { ...pre, amount: e.target.value };
                });
              }}
            />
          </div>

          <div className="inputContainer">
            <label>{t("text64")}</label>
          </div>
          <div className="inputContainer">
            <Input.TextArea
              placeholder={t("text68")}
              value={editDonation?.description}
              onChange={(e) => {
                setEditDonation((pre: Transaction) => {
                  return { ...pre, description: e.target.value };
                });
              }}
            />
          </div>
        </div>
      </Modal>
    );
  };

  //On Error
  const error = (message: string) => {
    Modal.error({
      title: t("text73"),
      content: message,
    });
  };

  //Added Donation
  const ModalAddedDonation = () => {
    //handle Modification of  Donation data
    return (
      <Modal
        title={t("text54")}
        visible={ShowDonationAddition}
        okText={t("text31")}
        cancelText={t("text10")}
            onCancel={() => {
                setDonationAmt(undefined);
          SetShowingDonationAddition(false);
        }}
        onOk={() => {
          if (
            !(
              donationAmount > 0 &&
              donationDesc.length > 0 &&
              donationOfficeId > 0
            )
          ) {
            error(
                t("text71")
            );
          } else {
            AddDonationData();

            SetShowingDonationAddition(false);
          }
        }}
        closable={true}
      >
        <div className="container setDonationComponent">
          <div className="inputContainer">
            {" "}
            <label>{t("text25")}</label>
          </div>
          <div className="inputContainer">
            <Select
              showSearch
              allowClear
              size="small"
              style={{ width: 200 }}
              placeholder={t("text69")}
              optionFilterProp="children"
              dropdownAlign={{ offset: [0, 0] }}
              onChange={(e) => {
                setDonationOfficeId(e); //update the amount variable state
              }}
            >
              {usrOfficeList
                .filter((ol) => ol.year === selectedYear)
                .map((offlst) => (
                  <Select.Option value={offlst.id}>
                    {offlst.officeName}
                  </Select.Option>
                ))}
            </Select>
          </div>
          <div className="inputContainer">
            <label>{t("text8")}</label>
          </div>
          <div className="inputContainer">
            <Input
              pattern="[0-9]*"
              required
              placeholder={t("text67")}
              value={donationAmount}
              onChange={(e) => {
                if (
                  typeof e.target.value === "string" &&
                  !Number.isNaN(Number(e.target.value)) //convert the value into a number and check if that's NaN or not
                ) {
                  setDonationAmt(e.target.value); //update the amount variable state
                }
              }}
            />
          </div>

          <div className="inputContainer">
            <label>Description</label>
          </div>
          <div className="inputContainer">
            <Input.TextArea
              placeholder={t("text68")}
              // value={editDonation?.description}
              onChange={(e) => {
                setDonationDesc(e.target.value);
              }}
            />
          </div>
        </div>
      </Modal>
    );
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("text26"),
      dataIndex: "officeName",
      key: "officeName",
    },
    {
      title: t("text63"),
      dataIndex: "year",
      key: "year",
    },
    {
      title: t("text8"),
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: t("text64"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("text65"),
      dataIndex: "dateCreated",
      key: "dateCreated",
    },
    {
      title: t("text66"),
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: t("text27"),
      key: "options",
      render: (record: Transaction) => {
        return (
          <>
            <EditOutlined
              onClick={() => {
                onEditDonation(record);
              }}
              className="editOutline"
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      <br />
      <br />
      <div className="container containerPage">
        <div className="officeTableComponent donationPage">
          <Title level={5}>{TableTitle}</Title>
          <br />

          <div className="select-year1">
            <label className="select-year-label">{t("text44")}</label>
            {yearSelection()}
          </div>

          <br />

          <br />

          {userInfo.IsOfficeAdmin || userInfo.IsSuperAdmin ? (
            <Tooltip title={t("text54")}>
              <Button
                className="select-year-label btn-addDonation"
                onClick={() => {
                  handleDonation();
                }}
              ><PlusCircleOutlined />
                {t("text72")}
              </Button>
            </Tooltip>
          ) : (
            ""
          )}

          <Table
            className="table"
            dataSource={transactions}
            columns={columns}
            pagination={{
              defaultPageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "20", "50", "100"],
            }}
          />
          {ShowDonationAddition
            ? ModalAddedDonation()
            : ShowDonationEditing
            ? ModalModifyDonation()
            : ""}
        </div>
        <div className="btnPageDonation">
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
    </>
  );
};

export default DonationMgmt;
