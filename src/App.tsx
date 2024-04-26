import { Route, Routes } from "react-router-dom";
import Home from "./main/Home/Home";
import InvoiceCase2 from "./main/Home/InoviceCase2/InvoiceCase2";
import Invoice from "./main/Home/Invoice/Invoice";
import Login from "./main/Login/Login";
import withAuth from "./main/com/RequiredAuth";

function App() {
  const ProtectedComponent = withAuth(Home);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/home"
        element={<ProtectedComponent element={<Home />} path="/home" />}
      />
      <Route path="home/:id" element={<Invoice />} />
      <Route path="home/invoice" element={<InvoiceCase2 />} />
    </Routes>
  );
}

export default App;
