import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import Aboutpage from "./pages/Aboutpage.jsx";

function App() {
  return <>
    <Routes>
      <Route path='/' element={<Homepage />} />
      <Route path='/about' element={<Aboutpage />} />
    </Routes>
  </>
}

export default App
