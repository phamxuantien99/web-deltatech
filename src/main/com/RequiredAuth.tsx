import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext, { AuthContextType } from "../context/AuthProvider";

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      return <Navigate to="/" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
