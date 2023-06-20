import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Header from "./components/Header"
import Home from "./pages/Home"
import About from "./pages/About";
import './App.css';

function App() {

  return (
    <div className="App">
      <BrowserRouter basename="/">
        <Header />
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/about" element={<About />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
