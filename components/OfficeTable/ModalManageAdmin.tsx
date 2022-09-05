/* eslint-disable react-hooks/exhaustive-deps */
import { CloseCircleFilled } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Message,
  Modal,
  Table,
  Tooltip,
} from "@bdo/kitchensink";
import React, { useEffect, useState } from "react";
import { helpHttp } from "../../helper/helpHttp";
import { AdminName } from "../../models/Office";
import Loader from "../Loader";
import "./style.css";
import { useTranslation } from "react-i18next";
import "../../i18n";

interface IModalManageAdmin {
  year: string;
  populateOfficeTable: Function;
  visible: boolean;
  modalManageAdmin: any;
  officeId: number;
  adminsForThisOffice: AdminName[];
  setModalManageAdmin: React.Dispatch<React.SetStateAction<any>>;
}
interface WorkerAPI {
  employeeID: string;
  firstName: string;
  lastName: string;
  email: null | string;
  userId: string;
}


const ModalManageAdmin = ({
  year,
  populateOfficeTable,
  visible,
  modalManageAdmin,
  officeId,
  setModalManageAdmin,
  adminsForThisOffice,
}: IModalManageAdmin) => {
  const { t, i18n } = useTranslation(["home", "main"]);
  const [value, setValue] = useState("");
  const [options, setOptions] = useState<any>(null);
  //save the records received after the api called
  const [foundRecords, setfoundRecords] = useState<[]>([]);
  //state for manage loading, errirMessages, addButton
  const [isNotEnable, setIsNotEnable] = useState({
    addButton: true,
    loading: true,
    errorMessage: true,
  });

    //**Colums for the List */
    const columnsRemove = [
        {
            title: t("text6"),
            dataIndex: "admin",
            key: "admin",
        },
        {
            title: t("text6"),
            dataIndex: "delete",
            key: "delete",
        },
    ];

  // state for manage the petition when the user type a key
  const [interval, setInterval] = useState<NodeJS.Timeout>();

  //state table admin name information with all the data received as initial state
  const [adminTableSources, setAdminTableSources] =
    useState<AdminName[]>(adminsForThisOffice);

  //State to prepare the record selected to be added on the modalTable
  const [readyToAdd, setReadyToAdd] = useState<AdminName>();

  //API Information
  const api = helpHttp();
  const host = process.env.REACT_APP_DEV_MODE;
  const workerURL = host + "/api/driveawayhunger/worker/";
  const url = host + "/api/driveawayhunger/officeAdmin";

  //************Hook to order and render the select Options in the dropdown once the user press a key */
  useEffect(() => {
    //sort the list
    let sortedRecords = foundRecords.sort((a: WorkerAPI, b: WorkerAPI) => {
      if (a.lastName < b.lastName) {
        return -1;
      } else if (a.lastName > b.lastName) {
        return 1;
      } else {
        return 0;
      }
    });
    // save the data in the state options in order to be showes as options
    setOptions(
      sortedRecords.map((worker: WorkerAPI) => ({
        value: `${worker.lastName}, ${worker.firstName}`,
        key: worker.userId,
      }))
    );
  }, [foundRecords]);

    //Modal for show WINDOW ERROR
    const errorModal = (message: string) => {
      Modal.error({
          title: t("text73"),
        content: message,
      });
    };

  //*******methods to call the for every new pressed key (after 3rd) it starts after 1.3 seconds the user stops typing */
  const onSearch = (searchText: string) => {
    setInterval(
      setTimeout(function () {
        if (searchText === "") {
          setOptions([]);
          setIsNotEnable({ ...isNotEnable, addButton: true });
        } else {
          setfoundRecords([]); //reset the state
          // validate if 3 or more letters come
          if (searchText.length >= 3) {
            console.log("searching...");
            let urlSearch = workerURL + searchText;
            setIsNotEnable({ ...isNotEnable, loading: false });
            //**call the API */

            api.get(urlSearch).then((res) => {
              if (!res.err) {
                if (Object.keys(res).length > 0) {
                  //if res has at least one key, so records are coming and refresh the state and call UseEffect
                  setfoundRecords(res);
                  // enable the loader
                  setIsNotEnable({ ...isNotEnable, errorMessage: true });
                }
              } else {
                console.log(res);
                setIsNotEnable({ ...isNotEnable, errorMessage: false });
              }
              // disable the loader
              setIsNotEnable({ ...isNotEnable, loading: true });
            });
          }
        }
      }, 1300)
    );
  };
  const onChange = (data: string) => {
    clearTimeout(interval); //clear the TimeOut everytime the user press a key
    // disable add button when is empty or no
    if (data === "") {
      setIsNotEnable({ ...isNotEnable, addButton: true });
    }
    setValue(data);
  };
  const onSelect = (adminName: string, params: any) => {
    //method to verify if the user selected is already an admin of this office, searching on the state for this Modal table
    let isAdmin = adminTableSources.some(
      (admin: AdminName) =>
        admin.userId.toLocaleLowerCase() === params.key.toLocaleLowerCase()
    );

    if (!isAdmin) {
      //----save in this variable  the information of the new admin with the structure AdminName
      let prepareRecord: AdminName = {
        userId: params.key,
        officeAdminName: params.value,
        officeAdminId: 0,
      };

      //save in the state readyToSave to be taken after user click on ADD calling function update
      setReadyToAdd(prepareRecord);
      setIsNotEnable({ ...isNotEnable, addButton: false });
    } else {
      // Message.error(t("text37"));
      errorModal(t("text37"));
      setIsNotEnable({ ...isNotEnable, addButton: true });
    }
  };

  //****Method to update the Modal table after click on "add"  ***/
  const handlerAddButton = () => {
    //if readytosave is no undefined update the table on modal and disable button Add and clean the input
    if (readyToAdd) {
      setAdminTableSources([...adminTableSources, readyToAdd]);
      setIsNotEnable({ ...isNotEnable, addButton: true });
    }
  };

  //****Method to delete the record after click on "X"  ***/
  const handlerDeleteButton = (userId: string) => {
    // //filter and only inlcude the records different to the userId on the adminTableSources
    let deleteOnModalTable = adminTableSources.filter(
      (admin: AdminName) => admin.userId !== userId
    );

    console.log(deleteOnModalTable, userId);

    setAdminTableSources(deleteOnModalTable);
  };

  //****Method to update the main table and on the API  ***/
  const handlerAcceptButton = () => {
    if (adminTableSources !== adminsForThisOffice) {
      let petitions: Promise<any>[] = [];
      //----POST----
      adminTableSources.forEach((admin: AdminName) => {
        let isAdmin = adminsForThisOffice.some(
          (mainTableAdmin: AdminName) =>
            admin.userId.toLowerCase() === mainTableAdmin.userId.toLowerCase()
        );
        //if the record is no already admin on the main table, so POST
        if (!isAdmin) {
          let options = {
            headers: { "Content-Type": "application/json", charset: "utf-8" },
            body: {
              id: 0,
              adminId: 0,
              officeId: officeId,
              dateCreated: "2022-08-10T15:56:50.1508477",
              adminName: admin.officeAdminName,
              userId: admin.userId.toLowerCase(),
              adminType: "OfficeAdmin",
            },
          };
          petitions.push(api.post(url, options));
        }
      });

      //---DELETE----
      adminsForThisOffice.forEach((admin: AdminName) => {
        let isAdmin = adminTableSources.some(
          (modalTableAdmin: AdminName) =>
            admin.userId.toLowerCase() === modalTableAdmin.userId.toLowerCase()
        );
        if (!isAdmin) {
          let urlDelete = url + `/${admin.userId}/${officeId}`;
          let options = {
            headers: { "Content-Type": "application/json", charset: "utf-8" },
          };
          petitions.push(api.del(urlDelete, options));
        }
      });

      //Execute All Promise
      Promise.all(petitions)
        .then((res) => {
          populateOfficeTable(year);
          Message.success(t("text58"));
        })
        .catch((res) => console.log(res));

      setModalManageAdmin({ ...modalManageAdmin, visible: false });
    } else {
      errorModal("There are not any change");
    }

    // console.log("List with the admins for this office from main page", adminsForThisOffice);
    // console.log("New List with the new admins added o deleted", adminTableSources);
  };

  return (
    <Modal
      title={t("text21")}
      visible={visible}
      onOk={() => handlerAcceptButton()}
      okText={t("text31")}
      cancelText={t("text10")}
      onCancel={() =>
        setModalManageAdmin({ ...modalManageAdmin, visible: false })
      }
      closable={true}
    >
      <div className="divManageAdminsModal">
        <div className="titleManageAdminModal">
          <h4>{t("text26")}: </h4>
          <h4>{modalManageAdmin.officeName}</h4>
        </div>
        <div className="searchManageAdminModal">
          {/* ------DINAMIC SEARCH----- */}
          <label className="label">{t("text34")}</label>
          <div className="containerDinamicSearcherInputs">
            <div>
              <AutoComplete
                size="middle"
                className="autoComplete"
                value={value}
                options={options}
                onSelect={(adminName: string, params: {}) =>
                  onSelect(adminName, params)
                }
                onSearch={onSearch}
                onChange={onChange}
                placeholder={t("text41")}
              />
            </div>

            {/* this loader shows when is loading the data */}
            {!isNotEnable.loading && (
              <div className="LoaderSaerchBar">
                <Loader />
              </div>
            )}
            <div>
              <Button
                type="primary"
                size="middle"
                disabled={isNotEnable.addButton}
                onClick={() => handlerAddButton()}
              >
                 {t("text2")}
              </Button>
            </div>
          </div>
          {/* ------DINAMIC SEARCH----- */}
          <div className="containerTableAdminList">
            <Table
              dataSource={adminTableSources.map((admin: AdminName) => ({
                key: admin.userId,
                admin: admin.officeAdminName,
                delete: (
                  <div className="containerRemoveAdminFromListIcon">
                    <Tooltip title={t("text30")}>
                      <CloseCircleFilled
                        className="removeAdminFromList"
                        onClick={() => handlerDeleteButton(admin.userId)}
                      />
                    </Tooltip>
                  </div>
                ),
              }))}
              columns={columnsRemove}
              pagination={false}
              className="manageTable"
              scroll={{ y: 240 }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalManageAdmin;