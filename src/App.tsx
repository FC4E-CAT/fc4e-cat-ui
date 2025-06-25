import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, ProtectedRoute, KeycloakLogout } from "@/auth";
import { Header, Footer } from "@/components";
import ROUTES from "@/routes";
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
import { AssessmentEditMode } from "./types";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminValidations from "./pages/admin/AdminValidations";
import PidSelection from "./pages/PidSelection";
import ViewUsers from "./pages/admin/ViewUsers";
import Motivations from "./pages/motivations/Motivations";
import MotivationDetails from "./pages/motivations/MotivationDetails";
import Principles from "./pages/principles/Principles";
import MotivationActorCriteria from "./pages/motivations/MotivationActorCriteria";
import AssessmentView from "./pages/assessments/AssessmentView";
import { MotivationAssessmentEditor } from "./pages/assessments/MotivationAssessmentEditor";
import MotivationCriteriaPrinciples from "./pages/motivations/MotivationCriteriaPrinciples";
import Criteria from "./pages/criteria/Criteria";
import MotivationMetricTests from "./pages/motivations/MotivationMetricTests";
import Tests from "./pages/tests/Tests";
import CreateTest from "./pages/tests/components/CreateTest";
import Metrics from "./pages/metrics/Metrics";
import AdminAssessments from "./pages/admin/AdminAssessments";
import AboutCat from "./pages/about/AboutCat";
import Disclaimer from "./pages/about/Disclaimer";
import Interoperability from "./pages/about/Interoperability";
import AcceptableUse from "./pages/about/AcceptableUse";
import Privacy from "./pages/about/Privacy";
import Cookies from "./pages/about/Cookies";
import Terms from "./pages/about/Terms";
import Settings from "./pages/admin/Settings";
import TestMethodsSettings from "./pages/admin/settings/TestMethodsSettings";
import MetricTypesSettings from "./pages/admin/settings/MetricTypesSettings";
import AlgorithmsSettings from "./pages/admin/settings/AlgorithmsSettings";
import BenchmarkTypesSettings from "./pages/admin/settings/BenchmarkTypesSettings";

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
              <Routes>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.ABOUT.CAT} element={<AboutCat />} />
                <Route
                  path={ROUTES.ABOUT.INTEROPERABILITY}
                  element={<Interoperability />}
                />
                <Route
                  path={ROUTES.ABOUT.ACCEPTABLE_USE}
                  element={<AcceptableUse />}
                />
                <Route path={ROUTES.ABOUT.PRIVACY} element={<Privacy />} />
                <Route
                  path={ROUTES.ABOUT.DISCLAIMER}
                  element={<Disclaimer />}
                />
                <Route path={ROUTES.PID_SELECTION} element={<PidSelection />} />
                <Route path={ROUTES.ABOUT.COOKIES} element={<Cookies />} />
                <Route path={ROUTES.ABOUT.TERMS} element={<Terms />} />
                <Route
                  path={ROUTES.ASSESSMENTS.CREATE_WITH_VALIDATION}
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
                  path={ROUTES.ASSESSMENTS.IMPORT}
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
                  path={ROUTES.ASSESSMENTS.CREATE}
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
                  path={ROUTES.ASSESSMENTS.VIEW}
                  element={<ProtectedRoute />}
                >
                  {/* Use AssessmentView component with isPublic = false */}
                  <Route index element={<AssessmentView isPublic={false} />} />
                </Route>
                <Route
                  path={ROUTES.ASSESSMENTS.EDIT}
                  element={<ProtectedRoute />}
                >
                  {/* Use AssessmentEdit component with mode = edit */}
                  <Route
                    index
                    element={<AssessmentEdit mode={AssessmentEditMode.Edit} />}
                  />
                </Route>
                <Route
                  path={ROUTES.ASSESSMENTS.ASSESS}
                  element={<Assessments />}
                />
                <Route
                  path={ROUTES.ASSESSMENTS.ROOT}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<AssessmentsList />} />
                </Route>
                <Route
                  path={ROUTES.PUBLIC_ASSESSMENTS.ROOT}
                  element={<AssessmentsList listPublic={true} />}
                />
                <Route
                  path={ROUTES.PUBLIC_ASSESSMENTS.VIEW}
                  element={<AssessmentView isPublic={true} />}
                />

                <Route path={ROUTES.PROFILE.ROOT} element={<ProtectedRoute />}>
                  <Route index element={<Profile />} />
                </Route>
                <Route
                  path={ROUTES.PROFILE.UPDATE}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<ProfileUpdate />} />
                </Route>
                <Route path={ROUTES.ADMIN.USERS} element={<ProtectedRoute />}>
                  <Route index element={<AdminUsers />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.USER_VIEW}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<ViewUsers />} />
                </Route>
                <Route
                  path={ROUTES.VALIDATIONS.REQUEST}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<RequestValidation />} />
                </Route>
                <Route path={ROUTES.SUBJECTS} element={<ProtectedRoute />}>
                  <Route index element={<Subjects />} />
                </Route>
                <Route
                  path={ROUTES.VALIDATIONS.ROOT}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<ValidationList />} />
                </Route>
                <Route
                  path={ROUTES.VALIDATIONS.VIEW}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<ValidationDetails />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.VALIDATIONS}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<AdminValidations />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.VALIDATION_VIEW}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<ValidationDetails admin={true} />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.VALIDATION_REJECT}
                  element={<ProtectedRoute />}
                >
                  <Route
                    index
                    element={<ValidationDetails admin={true} toReject={true} />}
                  />
                </Route>
                <Route
                  path={ROUTES.ADMIN.VALIDATION_APPROVE}
                  element={<ProtectedRoute />}
                >
                  <Route
                    index
                    element={
                      <ValidationDetails admin={true} toApprove={true} />
                    }
                  />
                </Route>
                <Route
                  path={ROUTES.ADMIN.MOTIVATIONS.ROOT}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<Motivations />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.MOTIVATIONS.VIEW}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<MotivationDetails />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.MOTIVATIONS.MANAGE_CRITERIA}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<MotivationCriteriaPrinciples />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.MOTIVATIONS.ACTOR_CRITERIA}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<MotivationActorCriteria />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.MOTIVATIONS.METRICS_TESTS}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<MotivationMetricTests />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.MOTIVATIONS.TEMPLATES}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<MotivationAssessmentEditor />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.PRINCIPLES.ROOT}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<Principles />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.CRITERIA.ROOT}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<Criteria />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.TESTS.ROOT}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<Tests />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.TESTS.CREATE}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<CreateTest />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.TESTS.EDIT}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<CreateTest />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.TESTS.CREATE_VERSION}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<CreateTest />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.ASSESSMENTS}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<AdminAssessments />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.METRICS.ROOT}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<Metrics />} />
                </Route>
                <Route path={ROUTES.LOGIN} element={<ProtectedRoute />}>
                  <Route index element={<Profile />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.SETTINGS.ROOT}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<Settings />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.SETTINGS.TEST_METHODS}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<TestMethodsSettings />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.SETTINGS.METRIC_TYPES}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<MetricTypesSettings />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.SETTINGS.ALGORITHMS}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<AlgorithmsSettings />} />
                </Route>
                <Route
                  path={ROUTES.ADMIN.SETTINGS.BENCHMARK_TYPES}
                  element={<ProtectedRoute />}
                >
                  <Route index element={<BenchmarkTypesSettings />} />
                </Route>
                <Route path={ROUTES.LOGOUT} element={<KeycloakLogout />} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
