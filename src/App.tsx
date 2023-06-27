import { Container } from 'react-bootstrap';
import { AuthProvider } from './auth/AuthContext';

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import Header from "./components/Header"
import KeycloakLogin from "./components/KeycloakLogin"
import Home from "./pages/Home"
import Profile from "./pages/Profile";
import './App.css';

const queryClient = new QueryClient();

function App() {

  return (
    <div className="App">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename="/">
            <Header />
            <Container>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<KeycloakLogin />} />
              </Routes>
            </Container>
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
