import { Container } from 'react-bootstrap';

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { AuthProvider, ProtectedRoute, KeycloakLogin } from './auth';
import { Header } from "./components"
import { Home, Profile, Users, Validations } from "./pages"

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
                <Route path="/profile" element={<ProtectedRoute />} >
                  <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/users" element={<ProtectedRoute />} >
                  <Route path="/users" element={<Users />} />
                </Route>
                <Route path="/validations/request" element={<ProtectedRoute />} >
                  <Route path="/validations/request" element={<Validations />} />
                </Route>
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
