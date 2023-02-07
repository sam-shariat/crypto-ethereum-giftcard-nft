import * as React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
//import history from './components/history';
import About from "./pages/About";
import Home from "./pages/Home";
import Mint from "./pages/Mint";
import Redeem from "./pages/Redeem";

export default function App() {
  return (
    <div style={{ height: "100%" }}>
      <Router /*  history={history}> */>
        <Routes>
          <Route exact path="/cryptogiftcard/" element={<Home />} />
          <Route exact path="/cryptogiftcard/mint" element={<Mint />} />
          <Route exact path="/cryptogiftcard/redeem" element={<Redeem />} />
          <Route exact path="/cryptogiftcard/about" element={<About />} />
        </Routes>
      </Router>
    </div>
  );
}
