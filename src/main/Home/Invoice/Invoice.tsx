import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { CSSProperties, useRef, useState } from "react";
import { FcPrint } from "react-icons/fc";
import { useParams } from "react-router-dom";
import { FadeLoader } from "react-spinners";
import { useReactToPrint } from "react-to-print";
import { api } from "../../service/api/endpoint";
import "./InvoiceStyle.css";

const override: CSSProperties = {
  display: "flex",
  margin: "500px auto",
  borderColor: "red",
};

const header = [
  "No.",
  "Type of Shutter",
  "Shutter No.",
  "Description",
  "Opening width",
  "Opening height",
  "Serial No.",
  // "Date",
  // "Delivery No.",
  // "Name",
  // "Email",
  // "Phone",
];

const headerList = [
  "No.",
  "type_of_shutter",
  "shutter_number",
  "description",
  "opening_width",
  "opening_height",
  "serial_no",
  // "Date",
  // "Delivery No.",
  // "Name",
  // "Email",
  // "Phone",
];

function Invoice() {
  const invoiceContentRef = useRef<any>();

  const { id } = useParams();
  // const { auth } = useContext(AuthContext) as AuthContextType;
  const auth = localStorage.getItem("authToken");
  const [showText, setShowText] = useState(false);

  const url = auth ? `Bearer ${auth}` : "";
  const headers = {
    Authorization: url,
    accept: "application/json",
    "Content-Type": "application/json",
  };

  const fetchDataDetail = async (id: number) => {
    try {
      return await axios
        .get(api.getDataProductDetail(id), {
          headers,
        })
        .then((res) => res.data);
    } catch (error) {
      return { error: "Failed to fetch data" };
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["dataDetailProduct", id],
    queryFn: () => fetchDataDetail(id as any),
    enabled: !!url,
  });
  const _handlePrint = useReactToPrint({
    content: () => invoiceContentRef.current,
    documentTitle: "Statement",
  });

  if (isLoading)
    return (
      <FadeLoader
        loading={isLoading}
        cssOverride={override}
        color="red"
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    );

  return (
    <div className="w-[1300px] mx-auto p-10">
      <div className="flex justify-between items-center">
        <div className="text-center mb-5">
          <button
            onClick={_handlePrint}
            className="btn btn-ghost gap-3 capitalize"
          >
            <FcPrint size={24} />
            Print
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="checkbox"
            name="serial"
            onChange={() => setShowText(!showText)}
          />
          <span className="label-text">Show Overall Components</span>
        </div>
      </div>
      <div>
        <div id="capture" className="invoice-container" ref={invoiceContentRef}>
          <div className="flex justify-between p-1">
            <img
              className="w-[500px]"
              src={require("../../../assets/images/logo2.png")}
              alt="logo"
            />

            <div className="text-right text-sm">
              <p className="font-bold text-blue-600">
                No.34 Loyang Crescent <br /> Singapore 508993
              </p>
              <p>
                <strong>T:</strong> <a href="tel:+6562857813">+65 6285 7813</a>
              </p>
              <p>
                <strong>E:</strong>{" "}
                <a href="mailto:enquiry@deltatech.com.sg">
                  enquiry@deltatech.com.sg
                </a>
              </p>
              <p>
                <strong>W:</strong>{" "}
                <a target="_black" href="www.deltatech.com.sg">
                  www.deltatech.com.sg
                </a>
              </p>
            </div>
          </div>
          <table className="table table-compact w-full">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th className="capitalize text-lg text-center" colSpan={4}>
                    Project Delivery Order (PDO)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Customer</th>
                  <td>{data["company"]}</td>
                  <th>Date</th>
                  <td>{data["created_at"]}</td>
                </tr>
                <tr>
                  <th>Location</th>
                  <td>{data["location"]}</td>
                  <th>Delivery Order Ref</th>
                  <td>{data["delivery_order_ref"]}</td>
                </tr>
                <tr>
                  <th>Contact Person</th>
                  <td>{data["contact_person"]}</td>
                  <th>Project Ref No</th>
                  <td>{data["project_code"]}</td>
                </tr>
                <tr>
                  <th>Contact No</th>
                  <td>{data["contact_number"]}</td>
                  <th>Client Ref</th>
                  <td>{data["client_ref"]}</td>
                </tr>
              </tbody>
            </table>

            <table className="table table-compact w-full">
              <thead className="mt-7">
                <tr className="mt-7">
                  {header.map((item, index) => (
                    <th className="capitalize" key={index}>
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              {/* !showText && */}
              {/* checkbox => condition : no condition */}
              <tbody>
                {!showText &&
                  data["data"] &&
                  data["data"].map((item: any, index: any) => {
                    return (
                      <tr key={index}>
                        {item["delivery_no"] === data["delivery_order_ref"] &&
                          headerList.map((header, headerIndex) => {
                            switch (header) {
                              case "No.":
                                return <th>{index + 1}</th>;
                              case "description":
                                return (
                                  <td
                                    key={headerIndex}
                                    className="w-full whitespace-pre-wrap inline-block"
                                  >
                                    {item["description"]}
                                    <br />
                                    <div className="text-[12px]">
                                      Sub components:
                                      <br />
                                      {item["sub_components"] &&
                                        item["sub_components"].length > 0 &&
                                        item["sub_components"].map(
                                          (comp: any, compIndex: any) => {
                                            return (
                                              <React.Fragment key={compIndex}>
                                                - {comp}
                                                <br />
                                              </React.Fragment>
                                            );
                                          }
                                        )}
                                    </div>
                                  </td>
                                );
                              case "shutter_number":
                                return (
                                  <td key={headerIndex}>
                                    {item["shutter_number"]}
                                  </td>
                                );
                              default:
                                return (
                                  <td key={headerIndex}>{item[header]}</td>
                                );
                            }
                          })}
                      </tr>
                    );
                  })}
                <tr className="text-center w-full">
                  <th colSpan={100}>Remark: {data["remark"]}</th>
                </tr>
              </tbody>
            </table>
            <table className="table table-compact w-full">
              <tr className="acknowledgement">
                <th className="capitalize text-lg text-center" colSpan={4}>
                  Acknowlegdement
                </th>
              </tr>
              <tbody>
                <tr>
                  <th colSpan={2} className="text-center w-1/2">
                    Client Name
                  </th>
                  <th colSpan={2} className="text-center w-1/2">
                    Delta Tech Personnal
                  </th>
                </tr>
                <tr>
                  <td colSpan={2} className="text-center w-12">
                    Goods received in good order and condition
                  </td>
                  <td colSpan={2}></td>
                </tr>
                <tr>
                  <td colSpan={2} className="p-10">
                    Signature & Company Stamp:
                  </td>
                  <td colSpan={2} className="text-center">
                    <div>
                      <div className="flex justify-center">
                        {data["signature_image_base64"] && (
                          <img
                            src={`data:image/jpeg;base64,${data["signature_image_base64"]}`}
                          />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>Name: {data["name"]}</td>
                </tr>
                <tr>
                  <td colSpan={2}>Contact: {data["phone"]}</td>
                  <td colSpan={2}>Email: {data["email"]}</td>
                </tr>
                <tr>
                  <td className="p-10"></td>
                </tr>
              </tbody>
            </table>
            <tfoot>
              <tr>
                <td>
                  <div id="page-number">
                    {" "}
                    Delivery Order Ref: {data["delivery_order_ref"]}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
