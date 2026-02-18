import { Routes, Route } from "react-router-dom";

import Login from "./components/login";
import Register from "./components/register";
function App() {
  return (
    <Routes>

      {/* Authentication pages */}
    <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />
     

    </Routes>
  );
}

export default App;
