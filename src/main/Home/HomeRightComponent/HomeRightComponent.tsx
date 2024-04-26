import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsEyeFill, BsPenFill } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext, { AuthContextType } from "../../context/AuthProvider";
import { api } from "../../service/api/endpoint";
import { useDebounce } from "../../service/hooks/useDebounce";
import LogoutBtn from "../Logout/LogoutBtn";
import { FadeLoader } from "react-spinners";

const override: CSSProperties = {
  display: "flex",
  margin: "300px auto",
  borderColor: "red",
};

const header = [
  "Created At",
  "Delivery Order Ref",
  "Signed",
  "Project Code",
  "Company",
  "Contact Person",
  "Contact Number",
  "Driver",
  "Client Ref",
  "Remark",
];

const HomeRightComponent = () => {
  const { auth, userInfo, setIsLoggedIn } = useContext(
    AuthContext
  ) as AuthContextType;
  const url = auth ? `Bearer ${auth}` : "";
  const headers = {
    Authorization: url,
    accept: "application/json",
    "Content-Type": "application/json",
  };

  const getRoleAdmin = localStorage.getItem("authUser");

  const [invoiceProjectCodeOptions, setInvoiceProjectCodeOptions] = useState<
    string[]
  >([]);
  const navigation = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchValue = useDebounce(searchQuery, 1000);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSigned, setIsSigned] = useState<string>("all");
  const [invoiceFilterByProjectCode, setInvoiceFilterByProjectCode] =
    useState<string>("all");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const fetchDataLogistic = async (
    currentPage?: number,
    searchValue?: string,
    signed?: string
  ) => {
    try {
      return await axios
        .get(api.getDataProduct(currentPage, searchValue, signed), { headers })
        .then((res) => res.data);
    } catch (error) {
      // setIsLoggedIn(false);
      // localStorage.removeItem("authToken");
      // window.location.reload();
      alert("Something went wrong, please login again!!");
      // navigation("/", { replace: true, state: { from: location } });
      return { error: "Failed to fetch data" };
    }
  };

  const {
    data: dataTotalProduct,
    isLoading: isLoadingProduct,
    refetch: refetchDataList,
  } = useQuery({
    queryKey: ["dataTotalProduct", currentPage, debouncedSearchValue, isSigned],
    queryFn: () =>
      fetchDataLogistic(currentPage, debouncedSearchValue, isSigned),
    enabled: !!auth,
  });

  const totalPages = Math.ceil(
    dataTotalProduct?.search_options?.total_count / 20
  );

  // Tạo một mảng từ 1 đến totalPage
  // const everyPages = Array.from(
  //   { length: totalPages },
  //   (_, index) => index + 1
  // );

  useEffect(() => {
    if (dataTotalProduct?.founds) {
      const projectCode = dataTotalProduct?.founds
        .map((item: object) => item["project_code"])
        .filter(
          (item: any, i: any, ar: string | any[]) => ar.indexOf(item) === i
        )
        .sort();

      setInvoiceProjectCodeOptions(projectCode);
    }
  }, [dataTotalProduct]);

  const [updating, setUpdating] = useState<boolean>(false);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const [editDate, setEditDate] = useState<any>(new Date());
  const [idInvoice, setIdInvoice] = useState<number>(0);

  const [edit, setEdit] = useState<any>({
    contact_person: "",
    contact_number: "",
    your_ref: "",
  });
  const defaultEdit = {
    contact_person: "",
    contact_number: "",
    your_ref: "",
  };

  const editItem = (item: any) => {
    const dateSplit = item["created_at"].split("/");
    const date = `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`;
    setEditDate(new Date(date));
    setIdInvoice(item["invoice_id"]);
    const payload = {
      contact_person: item["contact_person"],
      contact_number: item["contact_number"],
      your_ref: item["client_ref"],
    };

    setEdit(Object.assign({}, payload));
  };

  const _handleUpdateInvoiceForm = () => {
    document.getElementById("close")?.click();
    setEdit(defaultEdit);
  };

  const updateInvoiceFormRef = useRef(null);

  const _handleUpdateInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);

    const payload = edit;

    axios
      .put(api.putBaseLogisticInvoice(idInvoice), payload, { headers })
      .then((res) => {
        console.log(res);
        _handleUpdateInvoiceForm();
        refetchDataList();
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => setUpdating(false));
  };

  const renderUpdateModal = (item: any) => {
    return (
      <div>
        <label
          onClick={() => editItem(item)}
          htmlFor="modal-edit"
          className="btn modal-button btn-square btn-sm"
        >
          <BsPenFill size={16} />
        </label>
        <input type="checkbox" id="modal-edit" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box relative">
            <label
              id="close"
              htmlFor="modal-edit"
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </label>
            <h3 className="text-lg font-bold mb-10">Update PDO</h3>
            <div>
              <form
                ref={updateInvoiceFormRef}
                onSubmit={(e) => _handleUpdateInvoice(e)}
              >
                <div className="grid gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Generate Date
                    </label>
                    <DatePicker
                      className="input input-bordered w-full"
                      selected={editDate}
                      onChange={(date) =>
                        setEdit((prev: any) => ({
                          ...prev,
                          date: date,
                        }))
                      }
                      disabled={true}
                      placeholderText="dd/mm/yyyy"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Contact Person
                    </label>
                    <input
                      required
                      value={edit.contact_person}
                      onChange={(event) =>
                        setEdit((prev: any) => ({
                          ...prev,
                          contact_person: event.target.value,
                        }))
                      }
                      type="text"
                      placeholder="Contact person"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Contact Number
                    </label>
                    <input
                      required
                      value={edit.contact_number}
                      onChange={(event) =>
                        setEdit((prev: any) => ({
                          ...prev,
                          contact_number: event.target.value,
                        }))
                      }
                      type="text"
                      placeholder="Contact number"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Client Ref
                    </label>
                    <input
                      required
                      value={edit.your_ref}
                      onChange={(event) =>
                        setEdit((prev: any) => ({
                          ...prev,
                          your_ref: event.target.value,
                        }))
                      }
                      type="text"
                      placeholder="Client Ref"
                      className="input input-bordered w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary ${updating && "loading"}`}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-[auto] w-full">
      <div className="flex justify-end mb-5">
        {/* <select
          name="selectedYeaer"
          value={invoiceFilterByProjectCode}
          required
          onChange={(event) =>
            setInvoiceFilterByProjectCode(event.target.value)
          }
          className="select select-bordered w-full max-w-xs"
        >
          <option value="all">All Deliveries</option>
          {invoiceProjectCodeOptions?.map((item, index) => (
            <option value={`${item}`} key={index}>{`${item}`}</option>
          ))}
        </select> */}
        <LogoutBtn />
      </div>
      <div className="overflow-y-auto " style={{ maxHeight: "84vh" }}>
        <table className="table w-full">
          <thead>
            <tr>
              <th>No.</th>
              <th>Action</th>
              {header.map((item, index) => (
                <th key={index}>{item}</th>
              ))}
              <th></th>
            </tr>
            <tr>
              <td colSpan={11}>
                <input
                  type="text"
                  placeholder="Search..."
                  onChange={(event) => handleSearch(event.target.value)}
                  className="input input-bordered w-full"
                ></input>
              </td>
            </tr>
          </thead>
          <tbody className="w-full">
            {dataTotalProduct?.founds?.map((item: any, index: any) => {
              return (
                <tr key={index} className="hover">
                  <th>{item["invoice_id"]}</th>
                  <td key={"action"}>
                    <div className="flex gap-3">
                      <Link
                        to={`/home/${item["invoice_id"]}`}
                        className="btn btn-square btn-outline btn-sm"
                      >
                        <BsEyeFill size={16} />
                      </Link>

                      {getRoleAdmin && <>{renderUpdateModal(item)}</>}
                    </div>
                  </td>

                  <td>{item["created_at"]}</td>
                  <td>{item["delivery_order_ref"]}</td>
                  {item["send"] === null ? (
                    <td className="text-red-500">Not signed</td>
                  ) : (
                    <td className="text-green-500">Signed</td>
                  )}
                  <td>{item["project_code"]}</td>
                  <td>{item["company"]}</td>
                  <td>{item["contact_person"]}</td>
                  <td>{item["contact_number"]}</td>
                  <td>{item["driver"]}</td>
                  <td>{item["client_ref"]}</td>
                  <td>{item["remark"]}</td>
                </tr>
              );
            })}
            <tr>
              {!isLoadingProduct && dataTotalProduct?.founds?.length === 0 && (
                <td colSpan={header.length + 2} className={"text-center"}>
                  No results
                </td>
              )}
              {isLoadingProduct && (
                <td colSpan={header.length + 2} className={"text-center"}>
                  <FadeLoader
                    loading={isLoadingProduct}
                    cssOverride={override}
                    color="red"
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex bg-white rounded-lg font-[Poppins] align-center items-center">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange((currentPage as number) - 1)}
          className="h-12 border-2 border-r-0 border-indigo-600
               px-4 rounded-l-lg hover:bg-indigo-600 hover:text-white"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"
              fill-rule="evenodd"
            ></path>
          </svg>
        </button>
        <p className="font-bold mx-2">{`Page ${currentPage} of ${totalPages}`}</p>
        <button
          onClick={() => handlePageChange((currentPage as number) + 1)}
          disabled={currentPage === totalPages}
          className="h-12 border-2  border-indigo-600
               px-4 rounded-r-lg hover:bg-indigo-600 hover:text-white"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
              fill-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomeRightComponent;
