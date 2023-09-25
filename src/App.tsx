import { Container } from "react-bootstrap";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, ProtectedRoute, KeycloakLogout } from "@/auth";
import { Header, Footer } from "@/components";
import {
  Home,
  Profile,
  RequestValidation,
  Validations,
  Users,
  ProfileUpdate,
  ValidationDetails,
} from "@/pages";

import "@/App.css";
import AssessmentEdit from "@/pages/AssessmentEdit";
import Assessments from "@/pages/Assessments";
import AssessmentsList from "@/pages/AssessmentsList";

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
                  <Route
                    path="/assessments/create/:valID"
                    element={<ProtectedRoute />}
                  >
                    <Route index element={<AssessmentEdit />} />
                  </Route>
                  <Route
                    path="/assessments/create/"
                    element={<ProtectedRoute />}
                  >
                    <Route index element={<AssessmentEdit />} />
                  </Route>
                  <Route
                    path="/assessments/:asmtID"
                    element={<ProtectedRoute />}
                  >
                    {/* Use AssessmentEdit component with create mode = false to configure the view for update */}
                    <Route
                      index
                      element={<AssessmentEdit createMode={false} />}
                    />
                  </Route>
                  <Route path="/assess" element={<Assessments />} />
                  <Route path="/assessments" element={<ProtectedRoute />}>
                    <Route index element={<AssessmentsList />} />
                  </Route>
                  <Route path="/profile" element={<ProtectedRoute />}>
                    <Route index element={<Profile />} />
                  </Route>
                  <Route path="/profile/update" element={<ProtectedRoute />}>
                    <Route index element={<ProfileUpdate />} />
                  </Route>
                  <Route path="/users" element={<ProtectedRoute />}>
                    <Route index element={<Users />} />
                  </Route>
                  <Route
                    path="/validations/request"
                    element={<ProtectedRoute />}
                  >
                    <Route index element={<RequestValidation />} />
                  </Route>
                  <Route path="/validations" element={<ProtectedRoute />}>
                    <Route index element={<Validations />} />
                  </Route>
                  <Route path="/validations/:id" element={<ProtectedRoute />}>
                    <Route index element={<ValidationDetails />} />
                  </Route>
                  <Route
                    path="/validations/:id/reject"
                    element={<ProtectedRoute />}
                  >
                    <Route
                      index
                      element={<ValidationDetails toReject={true} />}
                    />
                  </Route>
                  <Route
                    path="/validations/:id/approve"
                    element={<ProtectedRoute />}
                  >
                    <Route
                      index
                      element={<ValidationDetails toApprove={true} />}
                    />
                  </Route>
                  <Route path="/login" element={<ProtectedRoute />}>
                    <Route index element={<Profile />} />
                  </Route>
                  <Route path="/logout" element={<KeycloakLogout />} />
                </Routes>
              </Container>
            </main>
            <Footer />
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
