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
import { Header, Footer } from "./components"
import { Home, Profile, RequestValidation, Validations, Users } from "./pages"

import './App.css';

const queryClient = new QueryClient();

function App() {

  return (
    <div className="App">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename="/">
            <Header />
            <main className="cat-main-view">
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
                  <Route path="/validations/request" element={<RequestValidation />} />
                </Route>
                <Route path="/validations" element={<ProtectedRoute />} >
                  <Route path="/validations" element={<Validations />} />
                </Route>
                <Route path="/validations/:id/reject" element={<ProtectedRoute />} >
                  <Route path="/validations/:id/reject" element={<Validations toReject={true}/>} />
                </Route>
                <Route path="/validations/:id/approve" element={<ProtectedRoute />} >
                  <Route path="/validations/:id/approve" element={<Validations toApprove={true}/>} />
                </Route>
                <Route path="/login" element={<KeycloakLogin />} />
              </Routes>
            </Container>
            </main>
            <Footer/>
          </BrowserRouter>
         
        </QueryClientProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
