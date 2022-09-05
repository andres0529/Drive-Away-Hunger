import {
  Input,
  InputNumber,
  Message,
  Modal,
  Select,
  Typography,
} from "@bdo/kitchensink";
import React, { useEffect, useState, useContext } from "react";
import { helpHttp } from "../../helper/helpHttp";
import "./style.css";
import { Goal } from "../../models/Goal";
import { useTranslation } from "react-i18next";
import { UserInfoContext } from "../../context/UserInfoContext";
import "../../i18n";

const { Title } = Typography;

const SetGoal = () => {
  const { t, i18n } = useTranslation(["home", "main"]);

  // **----------------------------------------------context---------------------------
    const { userInfo, setLoginUserInfo } = useContext(UserInfoContext);
  // const userInfo = {
  //   ISRegularUser: false,
  //   IsSuperAdmin : true,
  //   IsOfficeAdmin: false
  // };
 
  const [amount, setAmount] = useState<any>(); // "Amount input" state
  const [inputYear, setInputYear] = useState<string | number>("");
  const [goalList, setGoalList] = useState<Goal[] | []>([]); //"Variable with the data from the API"
  const [isNotEnable, setIsNotEnable] = useState({
    amount: true,
    saveButton: true,
    inputAmount: true,
  }); //state for enable amount input and save button
  const [data, setData] = useState<Goal | any>(); // "Body PUT" state

  const host = process.env.REACT_APP_DEV_MODE;
  let url = host + "/api/driveawayhunger/Goal";
  let url_location = host + "/api/driveawayhunger/locations";
  let api = helpHttp();

  //*****Hook to get the data in the first rendering
  useEffect(() => {
    window.scrollTo(0, 0)
    api.get(url).then((res) => {
      if (!res.err) {
        setGoalList(res);
      } else {
        setGoalList([]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


    //On Error
    const errorModal = (message: string) => {
      Modal.error({
        title: t("text73"),
        content: message,
      });
    };

  //*****function to pupulate the year dropdown
  const yearSelection = () => {
    // sort the list by year
    goalList.sort((a: Goal, b: Goal) => {
      return parseInt(a.year) - parseInt(b.year); //turn the string into a number
    });
    return (
      <Select
        className="select"
        placeholder={t("text42")}
        onChange={(goalValue: number | string, { id, year, key }: any) => {
          if (goalValue !== "new") {
            setAmount(goalValue); //update the state of amount with the value
            setData({ id, year, goalValue, dateCreated: key });
            setIsNotEnable({
              saveButton: true,
              amount: false,
              inputAmount: true,
            });
          } else {
            setAmount("");
            setInputYear("");
            setIsNotEnable({
              inputAmount: false,
              amount: true,
              saveButton: true,
            });
          }
        }}
      >
        <Select.Option value={"new"} key={0}>
          {t("text5")}
        </Select.Option>
        {goalList.map((goal) => (
          <Select.Option
            key={goal.dateCreated}
            value={goal.goalValue}
            id={goal.id}
            year={goal.year}
          >
            {goal.year}
          </Select.Option>
        ))}
      </Select>
    );
  };

  //*****Function to Enter new year */
  const inputNewYear = () => {
    //function to validate the field
    const validateInput = (e: any) => {
      //validate if the pressed key is a letter
      if (!isNaN(e.target.value)) {
        setInputYear(e.target.value);
        //validate if the inout has 4 digits and if it is already created
        if (e.target.value.length === 4) {
          if (!goalList.some((goal: Goal) => e.target.value === goal.year)) {
            setIsNotEnable({ ...isNotEnable, amount: false });
            setData({ year: e.target.value, goalValue: amount });
          } else {
            const error = () => {
              // Message.error(t("text38"));
              errorModal(t("text38"))
            };
            error();
          }
        } else {
          setIsNotEnable({ ...isNotEnable, amount: true });
        }
      }
    };

    return (
      <div className="label">
        <label>{t("text16")}</label>
        <Input
          placeholder={t("text23")}
          value={inputYear}
          onChange={(e) => validateInput(e)}
          maxLength={4}
        />
      </div>
    );
  };

  //******function to input amount
  const firmGoalAmount = () => {
      //const formatter = new Intl.NumberFormat(i18n.language, {
      //    style: "currency",
      //    currency: "USD",
      //    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
      //    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
      //});

    return (
      <InputNumber
        className="inputAmount"
        disabled={isNotEnable.amount}
        placeholder={t("text8")}
        value={amount}
        onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                }
        }}
        //formatter={(value) =>
        //  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        //}
        //parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
        onInput={(e) => {
          if (/[a-z]+/.test(e.toLowerCase()) || e === "$ ") {
            //if the string has letters or spaces disable the button save
            setIsNotEnable({ ...isNotEnable, saveButton: true });
          }
        }}
        onChange={(e) => {
            setAmount(e); //update the amount variable state
            //let number = formatter.format(parseInt(parseInt(e).toFixed(0)));
            //e = parseInt(e).toFixed(0);
          //let currency = formatter.format(parseInt(e)); //convert the value to a format currency again
          //let number = Number(currency.replace(/[^0-9.-]+/g, "")); //converte the value on Integer
          setData({ ...data, goalValue: e }); //update the objecct with the new value typed + info before
          setIsNotEnable({ ...isNotEnable, saveButton: false }); //state to enable saveButton wher the user type something
        }}
      />
    );
  };

  

  //*****Funtion to update the data in the API
  const handlerUpdateData = () => {
    let endpoint = `${url}/${data.year}`;
    let options = {
      body: data,
      headers: { "Content-Type": "application/json", charset: "utf-8" },
    };
    if (data !== undefined) {
      console.log(options.body);
      api.put(endpoint, options).then((res) => {
        if (!res.err) {
          let newData = goalList.map((el) => (el.id === data.id ? data : el));
          setGoalList(newData);
          setAmount("");
          setIsNotEnable({ ...isNotEnable, amount: true, saveButton: true });
          Message.success(t("text51"));
        } else {
          console.log(res);
        }
      });
    }
  };

  //*****Funtion to Post the data in the API
  const handlerPostData = () => {
    let endpoint = `${url}/${data.year}`;
    let options = {
      body: {
        year: data.year,
        goalValue: amount,
        id: 0,
        dateCreated: new Date(),
      },
      headers: { "Content-Type": "application/json", charset: "utf-8" },
    };

    api.post(endpoint, options).then((res) => {
      if (!res.err) {
        let newData = {
          /* Always I gonna use the last ID + 1 */
          id: Math.max(...goalList.map((goal: Goal) => goal.id)) + 1,
          year: data.year,
          goalValue: amount,
          dateCreated: `0000-00-00T00:00:00.${goalList.length + 1}`,
        };
        setGoalList([...goalList, newData]);
        //reset the inputs after update the state
        setAmount("");
        setInputYear("");
        setIsNotEnable({ ...isNotEnable, amount: true, saveButton: true });
        let locationOptions = {
          body: {
            id: 0,
            officeName: "admin",
            year: data.year,
            dateCreated: "2022-08-02T15:21:44.2180424",
            locationIdAPI: "",
            officeAdminName: null,
          },
          headers: { "Content-Type": "application/json", charset: "utf-8" },
        };
        api.post(url_location, locationOptions).then((res) => {
          if (!res.err) {
            Message.success(t("text52"));
          } else {
            console.log("Error Post /Location: ", res);
          }
        });
      } else {
        console.log("Error Post /Goal: ", res);
      }
    });
  };
  // This info is only displayed if the user IsSuperAdmin is true
  if (userInfo.IsSuperAdmin) {
    return (
      <div className="container setGoalComponent">
        <div className="title">
          <Title level={5}>{t("text35")}</Title>
        </div>
        <div className="inputContainer">
          <div className="label">
            <label>{t("text44")}</label>
            {yearSelection()}
          </div>

          {isNotEnable.inputAmount === false ? inputNewYear() : ""}

          <div className="label">
            <label>{t("text36")}</label>
            {firmGoalAmount()}
          </div>
          <div className="d-flex">
            <input
              className="saveButton"
              type="button"
              value={t("text31")}
              disabled={isNotEnable.saveButton}
              onClick={() =>
                isNotEnable.inputAmount
                  ? handlerUpdateData()
                  : handlerPostData()
              }
            />
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default SetGoal;
