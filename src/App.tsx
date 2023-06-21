import { Container } from 'react-bootstrap';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Header from "./components/Header"
import KeycloakLogin from "./components/KeycloakLogin"
import Home from "./pages/Home"
import About from "./pages/About";
import './App.css';

function App() {

  return (
    <div className="App">
      <BrowserRouter basename="/">
        <Header />
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<KeycloakLogin />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </div>
  );
}

export default App;
