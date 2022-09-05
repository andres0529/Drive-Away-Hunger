import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Modal,
  Select,
  Message,
  Table,
  Tooltip,
  Typography,
} from "@bdo/kitchensink";
import { useContext, useEffect, useState } from "react";
import { helpHttp } from "../../helper/helpHttp";
import { AdminName, IDataTableOffices, Office } from "../../models/Office";
import ModalAddNewOffice from "./ModalAddNewOffice";
import ModalManageAdmin from "./ModalManageAdmin";
import "./style.css";
import { useTranslation } from "react-i18next";
import { UserInfoContext } from "../../context/UserInfoContext";
import "../../i18n";

const OfficeTable = () => {
  const { t, i18n } = useTranslation(["home", "main"]);

  // *****************************---------------------context---------------------------
  const { userInfo, setLoginUserInfo } = useContext(UserInfoContext);
  // const userInfo = {
  //   ISRegularUser: false,
  //   IsSuperAdmin : true,
  //   IsOfficeAdmin: false
  // };
  // const role = userInfo.IsSuperAdmin ? "superAdmin" : "admin";
  // const userName = userInfo.EmailId;

  // If the CONTEXT does not come UNDEFINED, so assing to the variables the new context
  if (userInfo.EmailId) {
    localStorage.setItem("emailID", userInfo.EmailId);
    localStorage.setItem("ISRegularUser",  JSON.stringify(userInfo.ISRegularUser));
    localStorage.setItem("IsSuperAdmin", JSON.stringify(userInfo.IsSuperAdmin));
  }

  const userName = localStorage.getItem("emailID");

  const role = (localStorage.getItem("IsSuperAdmin") === "true") ? "superAdmin" : "admin";

// *****************************------------------------context---------------------------



  const { Title } = Typography;
  const [officeList, setOfficeList] = useState<Office[]>([]); //"Variable with the data from the API"
  const [dataTable, setDataTable] = useState<IDataTableOffices[]>([]);
  //states ---for manage modal windows---
  const [modalDelete, setModalDelete] = useState({
    officeId: 0,
    visible: false,
    officeName: "",
  });
  const [modalModifyName, setModalModifyName] = useState({
    officeId: 0,
    officeName: "",
    visible: false,
  });
  const [modalManageAdmin, setModalManageAdmin] = useState({
    officeName: "",
    officeId: 0,
    visible: false,
    officeAdminsName: [{ officeAdminId: 0, officeAdminName: "", userId: "" }],
    //and another property what I need for make the changhes on the API and on the UI....
  });
  const [modalAddNewOffice, setModalAddNewOffice] = useState({
    officeId: 0,
    visible: false,
    //and another property what I need for make the changhes on the API and on the UI....
  });
  const [yearSelected, setYearSelected] = useState("");
  const [iscurrentYear, setIscurrentYear] = useState();

  /*Columns of the table */
  const columns = [
    {
      title: t("text26"),
      dataIndex: "officeName",
      key: "officeName",
    },
    {
      title: t("text6"),
      dataIndex: "adminName",
      key: "adminName",
    },

    {
      title: t("text27"),
      dataIndex: "options",
      key: "options",
    },
  ];

  console.log("hello ");

  //API Information, the URL change denpending on the admin role (SuperAdmin or admin)
  const host = process.env.REACT_APP_DEV_MODE;
  let url = host + "/api/driveawayhunger/Office/OfficebyUserId/" + userName;
  let api = helpHttp();

  //*****Hook to get the data in the first rendering

  useEffect(() => {
    window.scrollTo(0, 0);
    getData().then((res) => {
      setOfficeList(res);
      setIscurrentYear(res.some((e: Office) => currentYear === e.year));
    });
    //Get the current year
    let currentYear = new Date().getFullYear().toString();

    populateOfficeTable(currentYear);
  }, []);

  const getData = async () => {
    let response = await api.get(url);
    if (!response.err) {
      return response;
    } else {
      return [];
    }
  };

  //*********Funtion to populate the office table regarding to the year selected. this function is called from yearSelection function
  const populateOfficeTable = async (year: string) => {
    let data = await getData();
    //grab all the records with the year selected and save them in a new variable called filteredData
    const filteredData = data.filter((office: Office) => office.year === year);

    let dataTableInfo: IDataTableOffices[] = []; //variable with the structure of the table
    //Loop the filteredData array an save into datTableInfo only the properties what the table needs
    filteredData.forEach((record: Office) => {
      dataTableInfo = [
        ...dataTableInfo,
        {
          key: record.id,
          officeName: record.officeName,
          //loop the officeAdminName property, grab all the names and are separated by comma
          adminName: record.officeAdminName
            .map((officeName: AdminName) => officeName.officeAdminName)
            .join("; "),
          options: (
            <div className="iconsContainer">
              <Tooltip title={t("text21")}>
                <UserSwitchOutlined
                  onClick={() => {
                    setModalManageAdmin({
                      visible: true,
                      officeId: record.id,
                      officeName: record.officeName,
                      officeAdminsName: record.officeAdminName, //pass the list with the admins name  AND USERNAME to the modal
                    });
                  }}
                />
              </Tooltip>
              {role === "superAdmin" ? ( //This columns is visible only if the user is superAdmin
                <>
                  <Tooltip title={t("text22")}>
                    <EditOutlined
                      onClick={() => {
                        //when the user click on the Icon change the state of modalModify
                        setModalModifyName({
                          officeId: record.id,
                          visible: true,
                          officeName: record.officeName,
                        });
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t("text12")}>
                    <DeleteOutlined
                      onClick={() => {
                        //when the user click on the Icon change the state of modalDelete
                        setModalDelete({
                          //disable the modal window and save the new UserId in the state for delete
                          visible: true,
                          officeId: record.id,
                          officeName: record.officeName,
                        });
                      }}
                    />
                  </Tooltip>
                </>
              ) : (
                ""
              )}
            </div>
          ),
        },
      ];
    });

    // sort the array alphabetically
    let sortedFilteredData = dataTableInfo.sort(
      (a: IDataTableOffices, b: IDataTableOffices) => {
        return a.officeName < b.officeName
          ? -1
          : a.officeName > b.officeName
          ? 1
          : 0;
      }
    );

    //Update the state of the table with the variable dataTableInfo which contains the structure and the info
    setDataTable(sortedFilteredData);

    setYearSelected(year);
  };
  //*********Function to pupulate the year dropdown
  const yearSelection = () => {
    // if the api returned data show it
    if (officeList.length !== 0) {
      //array for save all the years without repetitions
      let yearList: string[] = [];

      // sort the list by year
      officeList.sort((a: Office, b: Office) => {
        return parseInt(a.year) - parseInt(b.year); //turn the string into a number
      });

      //Loop the ordered array, grab every year without repetitions and save them on yearList Array
      officeList.forEach((office: Office) => {
        let isOnYearList = yearList.some((year) => year === office.year);
        if (!isOnYearList) {
          yearList.push(office.year);
        }
      });

      return (
        <Select
          defaultValue={
            iscurrentYear ? new Date().getFullYear().toString() : undefined
          }
          className="select"
          placeholder={t("text42")}
          onChange={(year: string) => populateOfficeTable(year)}
        >
          {yearList.map((year) => (
            <Select.Option key={year} value={year}>
              {year}
            </Select.Option>
          ))}
        </Select>
      );
    }
  };
  //*********Modal Delete */
  const showModalDelete = () => {
    //function to delete the record when the user click on ACCEPT
    const handleOk = () => {
      let endpoint = `${host}/api/driveawayhunger/Office/OfficeAdmin/${modalDelete.officeId}`;
      let options = {
        headers: { "Content-Type": "application/json", charset: "utf-8" },
      };
      api.del(endpoint, options).then((res) => {
        if (!res.err) {
          setModalDelete({ officeId: 0, visible: false, officeName: "" }); //reset the state to hide modal and clean userId

          //get a new array to refresh the state dataTable without the new record
          let newDataTable = dataTable.filter(
            (office: IDataTableOffices) => office.key !== modalDelete.officeId
          );
          setDataTable(newDataTable);
          Message.success(t("text47"));
        } else {
          console.log(res);
          if (res.status === 400) {
            Message.error(t("text48"));
            setModalDelete({ officeId: 0, visible: false, officeName: "" }); //reset the state to hide modal and clean userId
          }
        }
      });
    };
    return (
      <Modal
        title={t("text12")}
        visible={modalDelete.visible}
        onOk={(e) => handleOk()}
        okText={t("text11")}
        cancelText={t("text10")}
        onCancel={() => setModalDelete({ ...modalDelete, visible: false })}
        closable={true}
      >
        <p>{t("text13")}? </p> <Title level={5}>{modalDelete.officeName}</Title>
      </Modal>
    );
  };
  //*********Modal Modify name */
  const showModalModifyName = () => {
    //function to Modify the record when the user click on ACCEPT

    const handleOk = () => {
      if (modalModifyName.officeName !== "") {
        //changing the record on the API
        let endpoint = `${host}/api/driveawayhunger/Office/`;
        //grab all the structure of that record from office to pass it on the Body
        let officeRecordToModify = officeList.find(
          (office: Office) => office.id === modalModifyName.officeId
        );
        let options = {
          headers: { "Content-Type": "application/json", charset: "utf-8" },
          body: {
            //pass all the information of that record but with new name in te property officeName
            ...officeRecordToModify,
            officeName: modalModifyName.officeName,
          },
        };

        api.put(endpoint, options).then((res) => {
          if (!res.err) {
            if (officeRecordToModify)
              //Call the api again to refresh the data on the main table
              populateOfficeTable(officeRecordToModify.year);
            //reset the modalModifyName state
            setModalModifyName({ officeId: 0, officeName: "", visible: false });
            Message.success(t("text49"));
          } else {
            console.log(res);
          }
        });
      } else {
        //if the user leaves the input empty so it closes the modal window
        setModalModifyName({ ...modalModifyName, visible: false });
      }
    };

    return (
      <Modal
        title={t("text22")}
        visible={modalModifyName.visible}
        onOk={() => handleOk()}
        okText={t("text1")}
        cancelText={t("text10")}
        onCancel={() =>
          setModalModifyName({ ...modalModifyName, visible: false })
        }
        closable={true}
      >
        <div className="divModifyNameModal">
          <label>{t("text40")}</label>
          <Input
            required
            placeholder={t("text26")}
            maxLength={50}
            size="small"
            value={modalModifyName.officeName}
            //modify the state of modifyName every time the user press a key
            onChange={(e) =>
              setModalModifyName({
                ...modalModifyName,
                officeName: e.target.value,
              })
            }
          />
        </div>
      </Modal>
    );
  };
  //*********Modal Manage Admins */
  const showModalManageAdmins = () => {
    return (
      <ModalManageAdmin
        year={yearSelected}
        populateOfficeTable={populateOfficeTable}
        visible={modalManageAdmin.visible}
        modalManageAdmin={modalManageAdmin}
        setModalManageAdmin={setModalManageAdmin}
        officeId={modalManageAdmin.officeId}
        adminsForThisOffice={modalManageAdmin.officeAdminsName}
      />
    );
  };

  //*********Modal Add New Office */
  const showModalAddNewOffice = () => {
    return (
      <ModalAddNewOffice
        stateModalAddNewOffice={{ modalAddNewOffice, setModalAddNewOffice }}
        year={yearSelected}
        populateOfficeTable={populateOfficeTable}
      />
    );
  };

  // If isRegularUser is FALSE so show the info. false is string and I'm taking from the local storage
  if (localStorage.getItem("ISRegularUser") === "false") {
    return (
      <div className="container">
        <div className="officeTableComponent">
          <div className="title">
            <Title level={5}>{t("text61")}</Title>
          </div>
          <div className="select-year">
            <label>{t("text44")}</label>
            {yearSelection()}
          </div>

          <Table
            className="table"
            dataSource={dataTable}
            columns={columns}
            pagination={{
              defaultPageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "20", "50", "100"],
            }}
          />
          {role === "superAdmin" && dataTable[0] !== undefined ? (
            <Tooltip title={t("text3")}>
              <Button
                className="btn-addNew"
                onClick={() => {
                  setModalAddNewOffice({ visible: true, officeId: 0 });
                }}
              >
                <PlusCircleOutlined />
                {t("text4")}
              </Button>
            </Tooltip>
          ) : (
            ""
          )}

          {modalModifyName.visible
            ? showModalModifyName()
            : modalDelete.visible
            ? showModalDelete()
            : modalManageAdmin.visible
            ? showModalManageAdmins()
            : modalAddNewOffice.visible
            ? showModalAddNewOffice()
            : ""}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default OfficeTable;
