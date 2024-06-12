import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { RecoilRoot } from 'recoil';
import Home from './components/Home';
import Select from './components/select'; // Ensure the file name's capitalization matches.
import Login from './components/login';
import SelectV2 from './components/SelectV2';
import Completed from './components/Completed';

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<SelectV2 />} />
          <Route path="/home" element={<Home />} />
          <Route path="/completed" element={<Completed/>} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
