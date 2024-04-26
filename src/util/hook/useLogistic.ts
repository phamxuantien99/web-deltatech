import { useContext } from "react";
import AuthContext, { AuthContextType } from "../../main/context/AuthProvider";

export const useLogistic = (
  currentPage?: number,
  debouncedSearchValue?: string,
  isSigned?: string
) => {
  const { auth, isLoggedIn } = useContext(AuthContext) as AuthContextType;

  console.log({ auth });

  console.log({ isLoggedIn });

  return {};
};
