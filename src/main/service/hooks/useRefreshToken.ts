import React, { useContext } from "react";
import AuthContext, { AuthContextType } from "../../context/AuthProvider";
import axios from "axios";
import { BASE_URL } from "../api/BaseUrl";

export const getRefreshToken = () => localStorage.getItem("refreshToken");

const UseRefreshToken = () => {
  const { setAuth } = useContext(AuthContext) as AuthContextType;

  const refresh = async () => {
    const reponse = await axios.put(`${BASE_URL}/auth/refresh`, {
      refresh_token: getRefreshToken(),
    });
    setAuth((prev: any) => {
      return { ...prev, access_token: reponse.data[0] };
    });
    return reponse.data[0];
  };

  return refresh;
};

export default UseRefreshToken;
