import { BASE_URL } from "./BaseUrl";

export const api = {
  getLogin: `${BASE_URL}/auth/sign-in`,

  getDataProduct: (
    currentPage?: number,
    searchValue?: string,
    signed?: string
  ) =>
    `/logistic?page=${currentPage}&delivery_order_ref_or_company_search=${searchValue?.toUpperCase()}&signed=${signed}`,
  getDataProductDetail: (productId: number) =>
    `${BASE_URL}/logistic/${productId}`,

  getLogisticSerialNumber: `/logistic/get-serial-number`,

  getLogisticComponentByProjectCode: (project_code: string, year: string) =>
    `/logistic/get-component-by-project-code?project_code=${project_code}&year=${year}`,

  postGenInvoice: (
    year: number,
    project_code: string,
    contract_person: string,
    contact_number: string,
    driver: string,
    your_ref: string,
    remark: string,
    issue_date: string
  ) =>
    `${BASE_URL}/logistic/gen-invoice?year=${year}&project_code=${project_code}&contact_person=${contract_person}&contact_number=${contact_number}&driver=${driver}&your_ref=${your_ref}&remark=${remark}&issue_date=${issue_date}`,

  putBaseLogisticInvoice: (logistic_invoice_id: number) =>
    `${BASE_URL}/logistic/base_logistic_invoice/${logistic_invoice_id}`,
};
