import { BrowserRouter, Routes, Route } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, ProtectedRoute, KeycloakLogout } from "@/auth";
import { Header, Footer } from "@/components";
import {
  Home,
  Profile,
  RequestValidation,
  ValidationList,
  // Users,
  ProfileUpdate,
  ValidationDetails,
} from "@/pages";

import "@/App.css";
import Assessments from "@/pages/assessments/Assessments";
import AssessmentsList from "@/pages/assessments/AssessmentsList";
import AssessmentEdit from "./pages/assessments/AssessmentEdit";

import { Toaster } from "react-hot-toast";
import Subjects from "./pages/Subjects";
import About from "./pages/About";
import { AssessmentEditMode } from "./types";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminValidations from "./pages/admin/AdminValidations";
import PidSelection from "./pages/PidSelection";
import AssessmentsTable from "./pages/admin/AssessmentsTable";
import ViewUsers from "./pages/admin/ViewUsers";
import Motivations from "./pages/motivations/Motivations";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: " ",
          duration: 2000,
          position: "top-center",
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "green",
            },
          },
          error: {
            style: {
              background: "red",
            },
          },
        }}
      />
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename="/">
            <Header />
            <main className="cat-main-view">
              <div className="container rounded bg-white mt-1 mb-5">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pid-selection" element={<PidSelection />} />
                  <Route
                    path="/assessments/create/:valID"
                    element={<ProtectedRoute />}
                  >
                    <Route
                      index
                      element={
                        <AssessmentEdit mode={AssessmentEditMode.Create} />
                      }
                    />
                  </Route>
                  <Route
                    path="/assessments/import"
                    element={<ProtectedRoute />}
                  >
                    {/* Use AssessmentEdit component with mode = import */}
                    <Route
                      index
                      element={
                        <AssessmentEdit mode={AssessmentEditMode.Import} />
                      }
                    />
                  </Route>
                  <Route
                    path="/assessments/create/"
                    element={<ProtectedRoute />}
                  >
                    <Route
                      index
                      element={
                        <AssessmentEdit mode={AssessmentEditMode.Create} />
                      }
                    />
                  </Route>
                  <Route
                    path="/assessments/:asmtId"
                    element={<ProtectedRoute />}
                  >
                    {/* Use AssessmentEdit component with mode = edit */}
                    <Route
                      index
                      element={
                        <AssessmentEdit mode={AssessmentEditMode.Edit} />
                      }
                    />
                  </Route>
                  <Route path="/assess" element={<Assessments />} />
                  <Route path="/assessments" element={<ProtectedRoute />}>
                    <Route index element={<AssessmentsList />} />
                  </Route>
                  <Route
                    path="/public-assessments"
                    element={<AssessmentsList listPublic={true} />}
                  />
                  <Route path="/assessments/view" element={<ProtectedRoute />}>
                    <Route index element={<AssessmentsTable />} />
                  </Route>
                  <Route path="/profile" element={<ProtectedRoute />}>
                    <Route index element={<Profile />} />
                  </Route>
                  <Route path="/profile/update" element={<ProtectedRoute />}>
                    <Route index element={<ProfileUpdate />} />
                  </Route>
                  <Route path="/admin/users" element={<ProtectedRoute />}>
                    <Route index element={<AdminUsers />} />
                  </Route>
                  <Route
                    path="/admin/users/view/:id"
                    element={<ProtectedRoute />}
                  >
                    <Route index element={<ViewUsers />} />
                  </Route>
                  <Route
                    path="/validations/request"
                    element={<ProtectedRoute />}
                  >
                    <Route index element={<RequestValidation />} />
                  </Route>
                  <Route path="/subjects" element={<ProtectedRoute />}>
                    <Route index element={<Subjects />} />
                  </Route>
                  <Route path="/validations" element={<ProtectedRoute />}>
                    <Route index element={<ValidationList />} />
                  </Route>
                  <Route path="/validations/:id" element={<ProtectedRoute />}>
                    <Route index element={<ValidationDetails />} />
                  </Route>
                  <Route path="/admin/validations" element={<ProtectedRoute />}>
                    <Route index element={<AdminValidations />} />
                  </Route>
                  <Route
                    path="/admin/validations/:id"
                    element={<ProtectedRoute />}
                  >
                    <Route index element={<ValidationDetails admin={true} />} />
                  </Route>
                  <Route
                    path="/admin/validations/:id/reject"
                    element={<ProtectedRoute />}
                  >
                    <Route
                      index
                      element={
                        <ValidationDetails admin={true} toReject={true} />
                      }
                    />
                  </Route>
                  <Route
                    path="/admin/validations/:id/approve"
                    element={<ProtectedRoute />}
                  >
                    <Route
                      index
                      element={
                        <ValidationDetails admin={true} toApprove={true} />
                      }
                    />
                  </Route>
                  <Route path="/motivations" element={<ProtectedRoute />}>
                    <Route index element={<Motivations />} />
                  </Route>
                  <Route path="/login" element={<ProtectedRoute />}>
                    <Route index element={<Profile />} />
                  </Route>
                  <Route path="/logout" element={<KeycloakLogout />} />
                </Routes>
              </div>
            </main>
            <Footer />
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
