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

import { AuthProvider, ProtectedRoute, KeycloakLogin, KeycloakLogout } from './auth';
import { Header, Footer } from "./components"
import { Home, Profile, RequestValidation, Validations, Users, ProfileUpdate, ValidationDetails } from "./pages"

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
                  <Route index element={<Profile />} />
                </Route>
                <Route path="/profile/update" element={<ProtectedRoute />} >
                  <Route index element={<ProfileUpdate />} />
                </Route>
                <Route path="/users" element={<ProtectedRoute />} >
                  <Route index element={<Users />} />
                </Route>
                <Route path="/validations/request" element={<ProtectedRoute />} >
                  <Route index element={<RequestValidation />} />
                </Route>
                <Route path="/validations" element={<ProtectedRoute />} >
                  <Route index element={<Validations />} />
                </Route>
                <Route path="/validations/:id" element={<ProtectedRoute />} >
                  <Route index element={<ValidationDetails />} />
                </Route>
                <Route path="/validations/:id/reject" element={<ProtectedRoute />} >
                  <Route index element={<ValidationDetails toReject={true}/>} />
                </Route>
                <Route path="/validations/:id/approve" element={<ProtectedRoute />} >
                  <Route index element={<ValidationDetails toApprove={true}/>} />
                </Route>
                <Route path="/login" element={<KeycloakLogin />} />
                <Route path="/logout" element={<KeycloakLogout />} />
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
