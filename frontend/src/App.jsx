import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { RecoilRoot } from 'recoil';
import Home from './components/Home';
import Select from './components/select'; // Ensure the file name's capitalization matches.
import Login from './components/login';
import Skipped from './components/skipped';

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Select />} />
          <Route path="/home" element={<Home />} />
          <Route path="/skipped" element={<Skipped />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
