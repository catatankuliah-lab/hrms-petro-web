import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LoginPage from "../pages/auth/LoginPage";

// --- IMPORT HALAMAN DASHBOARD ASLI DARI FOLDER PAGES ---
import SuperAdminDashboard from "../pages/superadmin/dashboard/Dashboard";
import CompanyIndexPage from "../pages/superadmin/company/indexPage";
import CompanyAddPage from "../pages/superadmin/company/addPage";
import CompanyDetailPage from "../pages/superadmin/company/detailPage";
import BranchIndexPage from "../pages/superadmin/branches/indexPage";
import BranchAddPage from "../pages/superadmin/branches/addPage";
import BranchDetailPage from "../pages/superadmin/branches/detailPage";
import DepartmentIndexPage from "../pages/superadmin/departments/indexPage";
import DepartmentAddPage from "../pages/superadmin/departments/addPage";
import DepartmentDetailPage from "../pages/superadmin/departments/detailPage";
import JobPositionIndexPage from "../pages/superadmin/jobpostions/indexPage";
import JobPositionAddPage from "../pages/superadmin/jobpostions/addPage";
import JobPositionDetailPage from "../pages/superadmin/jobpostions/detailPage";
import ProjectIndexPage from "../pages/superadmin/projects/indexPage";
import ProjectAddPage from "../pages/superadmin/projects/addPage";
import ProjectDetailPage from "../pages/superadmin/projects/detailPage";
import EmployeeIndexPage from "../pages/superadmin/employees/indexPage";
import EmployeeAddPage from "../pages/superadmin/employees/addPage";
import EmployeeDetailPage from "../pages/superadmin/employees/detailPage";
import ShiftIndexPage from "../pages/superadmin/shifts/indexPage";
import ShiftAddPage from "../pages/superadmin/shifts/addPage";
import ShiftDetailPage from "../pages/superadmin/shifts/detailPage";
import EmployeeShiftIndexPage from "../pages/superadmin/employeeshifts/indexPage";
import EmployeeShiftAddPage from "../pages/superadmin/employeeshifts/addPage";
import EmployeeShiftDetailPage from "../pages/superadmin/employeeshifts/detailPage";
import AttendancesIndexPage from "../pages/superadmin/attendances/indexPage";
import OvertimesIndexPage from "../pages/superadmin/overtimes/indexPage";
import OvertimesAddPage from "../pages/superadmin/overtimes/addPage";
import OvertimesDetailPage from "../pages/superadmin/overtimes/detailPage";
import SalaryComponentsIndexPage from "../pages/superadmin/salarycomponents/indexPage";
import SalaryComponentsAddPage from "../pages/superadmin/salarycomponents/addPage";
import SalaryComponentsDetailPage from "../pages/superadmin/salarycomponents/detailPage";
import EmployeeSalaryIndexPage from "../pages/superadmin/employeesalaries/indexPage";
import EmployeeSalaryDetailPage from "../pages/superadmin/employeesalaries/detailPage";
import PayrollPeriodsIndexPage from "../pages/superadmin/payrollperiods/indexPage";
import PayrollPeriodsAddPage from "../pages/superadmin/payrollperiods/addPage";
import PayrollPeriodsDetailPage from "../pages/superadmin/payrollperiods/detailPage";
import PayrollPayslipDetailPage from "../pages/superadmin/payrollperiods/subDetailPage";

import HRDashboard from "../pages/hrd/dashboard/Dashboard";
import HRCompanyIndexPage from "../pages/hrd/company/indexPage";
import HRCompanyAddPage from "../pages/hrd/company/addPage";
import HRCompanyDetailPage from "../pages/hrd/company/detailPage";
import HRBranchIndexPage from "../pages/hrd/branches/indexPage";
import HRBranchAddPage from "../pages/hrd/branches/addPage";
import HRBranchDetailPage from "../pages/hrd/branches/detailPage";
import HRDepartmentIndexPage from "../pages/hrd/departments/indexPage";
import HRDepartmentAddPage from "../pages/hrd/departments/addPage";
import HRDepartmentDetailPage from "../pages/hrd/departments/detailPage";
import HRJobPositionIndexPage from "../pages/hrd/jobpostions/indexPage";
import HRJobPositionAddPage from "../pages/hrd/jobpostions/addPage";
import HRJobPositionDetailPage from "../pages/hrd/jobpostions/detailPage";
import HRProjectIndexPage from "../pages/hrd/projects/indexPage";
import HRProjectAddPage from "../pages/hrd/projects/addPage";
import HRProjectDetailPage from "../pages/hrd/projects/detailPage";
import HREmployeeIndexPage from "../pages/hrd/employees/indexPage";
import HREmployeeAddPage from "../pages/hrd/employees/addPage";
import HREmployeeDetailPage from "../pages/hrd/employees/detailPage";
import HRShiftIndexPage from "../pages/hrd/shifts/indexPage";
import HRShiftAddPage from "../pages/hrd/shifts/addPage";
import HRShiftDetailPage from "../pages/hrd/shifts/detailPage";
import HREmployeeShiftIndexPage from "../pages/hrd/employeeshifts/indexPage";
import HREmployeeShiftAddPage from "../pages/hrd/employeeshifts/addPage";
import HREmployeeShiftDetailPage from "../pages/hrd/employeeshifts/detailPage";
import HRAttendancesIndexPage from "../pages/hrd/attendances/indexPage";
import HROvertimesIndexPage from "../pages/hrd/overtimes/indexPage";
import HROvertimesAddPage from "../pages/hrd/overtimes/addPage";
import HROvertimesDetailPage from "../pages/hrd/overtimes/detailPage";
import HRSalaryComponentsIndexPage from "../pages/hrd/salarycomponents/indexPage";
import HRSalaryComponentsAddPage from "../pages/hrd/salarycomponents/addPage";
import HRSalaryComponentsDetailPage from "../pages/hrd/salarycomponents/detailPage";
import HREmployeeSalaryIndexPage from "../pages/hrd/employeesalaries/indexPage";
import HREmployeeSalaryDetailPage from "../pages/hrd/employeesalaries/detailPage";
import HRPayrollPeriodsIndexPage from "../pages/hrd/payrollperiods/indexPage";
import HRPayrollPeriodsAddPage from "../pages/hrd/payrollperiods/addPage";
import HRPayrollPeriodsDetailPage from "../pages/hrd/payrollperiods/detailPage";
import HRPayrollPayslipDetailPage from "../pages/hrd/payrollperiods/subDetailPage";

import ManagerDashboard from "../pages/manager/dashboard/Dashboard";
import ManagerEmployeeShiftIndexPage from "../pages/manager/employeeshifts/indexPage";
import ManagerEmployeeShiftAddPage from "../pages/manager/employeeshifts/addPage";
import ManagerEmployeeShiftDetailPage from "../pages/manager/employeeshifts/detailPage";
import ManagerAttendancesIndexPage from "../pages/manager/attendances/indexPage";

import EmployeeDashboard from "../pages/manager/dashboard/Dashboard";

// Sementara untuk dashboard role lain masih bisa pakai dummy dulu atau di-import nanti
const UnauthorizedPage = () => (
  <div className="h-screen flex justify-center items-center">
    <h2 className="text-xl font-bold text-red-600">403 - Akses Ditolak</h2>
  </div>
);

// Helper path dashboard berdasarkan role HRMS baru
const getDashboardPath = (role) => {
  switch (role) {
    case "Super Admin":
      return "/super-admin/dashboard";
    case "HR":
      return "/hr/dashboard";
    case "Finance":
      return "/finance/dashboard";
    case "Project Manager":
      return "/manager/dashboard";
    case "Employee":
      return "/employee/dashboard";
    default:
      return "/login";
  }
};

// 🎯 PublicRoute: redirect ke dashboard jika sudah login
const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("jwt_token");

  return user && token ? (
    <Navigate to={getDashboardPath(user.role)} replace />
  ) : (
    children
  );
};

// 🎯 PrivateRoute: proteksi halaman berdasarkan role HRMS
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const token = localStorage.getItem("jwt_token");

  if (loading) return <div className="p-6">Loading...</div>;

  // Jika token kosong, lempar ke login
  if (!token) return <Navigate to="/login" replace />;

  if (!user) return <div className="p-6">Loading...</div>;

  // Cek kecocokan role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* --- SUPER ADMIN ROUTES (Menggunakan file asli) --- */}
        <Route
          path="/super-admin/dashboard"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/company"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <CompanyIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/company/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <CompanyAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/company/edit/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <CompanyAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/company/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <CompanyDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/branch"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <BranchIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/branch/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <BranchAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/branch/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <BranchDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/department"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <DepartmentIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/department/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <DepartmentAddPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/super-admin/department/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <DepartmentDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/job-position"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <JobPositionIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/job-position/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <JobPositionAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/job-position/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <JobPositionDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/project"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <ProjectIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/project/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <ProjectAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/project/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <ProjectDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/employee"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <EmployeeIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/employee/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <EmployeeAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/employee/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <EmployeeDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/shift"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <ShiftIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/shift/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <ShiftAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/shift/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <ShiftDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/emp-shift"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <EmployeeShiftIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/emp-shift/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <EmployeeShiftAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/emp-shift/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <EmployeeShiftDetailPage />
            </PrivateRoute>
          }
        /> 
        <Route
          path="/super-admin/attendances"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <AttendancesIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/attendances/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <AttendancesIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/overtimes"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <OvertimesIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/overtimes/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <OvertimesAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/overtimes/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <OvertimesDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/salary-components"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <SalaryComponentsIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/salary-components/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <SalaryComponentsAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/salary-components/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <SalaryComponentsDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/esalaries"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <EmployeeSalaryIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/esalaries/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <EmployeeSalaryDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/payroll-periods"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <PayrollPeriodsIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/payroll-periods/add"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <PayrollPeriodsAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin/payroll-periods/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <PayrollPeriodsDetailPage />
            </PrivateRoute>
          }
        />
        {/* --- ROUTE SUB-DETAIL SLIP GAJI PER KARYAWAN --- */}
        <Route
          path="/super-admin/payroll-payslips/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Super Admin"]}>
              <PayrollPayslipDetailPage />
            </PrivateRoute>
          }
        />
        {/* --- HRD ROUTES (Menggunakan file asli) --- */}
        <Route
          path="/hr/dashboard"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/company"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRCompanyIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/company/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRCompanyAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/company/edit/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRCompanyAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/company/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRCompanyDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/branch"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRBranchIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/branch/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRBranchAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/branch/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRBranchDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/department"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRDepartmentIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/department/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRDepartmentAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/department/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRDepartmentDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/job-position"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRJobPositionIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/job-position/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRJobPositionAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/job-position/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRJobPositionDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/project"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRProjectIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/project/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRProjectAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/project/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRProjectDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/employee"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HREmployeeIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/employee/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HREmployeeAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/employee/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HREmployeeDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/shift"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRShiftIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/shift/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRShiftAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/shift/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRShiftDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/emp-shift"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HREmployeeShiftIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/emp-shift/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HREmployeeShiftAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/emp-shift/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HREmployeeShiftDetailPage />
            </PrivateRoute>
          }
        /> 
        <Route
          path="/hr/attendances"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRAttendancesIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/attendances/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRAttendancesIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/overtimes"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HROvertimesIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/overtimes/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HROvertimesAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/overtimes/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HROvertimesDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/salary-components"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRSalaryComponentsIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/salary-components/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRSalaryComponentsAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/salary-components/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRSalaryComponentsDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/esalaries"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HREmployeeSalaryIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/esalaries/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HREmployeeSalaryDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/payroll-periods"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRPayrollPeriodsIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/payroll-periods/add"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRPayrollPeriodsAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr/payroll-periods/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRPayrollPeriodsDetailPage />
            </PrivateRoute>
          }
        />
        {/* --- ROUTE SUB-DETAIL SLIP GAJI PER KARYAWAN --- */}
        <Route
          path="/super-admin/payroll-payslips/detail/:id"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRPayrollPayslipDetailPage />
            </PrivateRoute>
          }
        />
        {/* MANAGER ROUTES */}
        <Route
          path="/manager/dashboard"
          element={
            <PrivateRoute allowedRoles={["Project Manager"]}>
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/emp-shift"
          element={
            <PrivateRoute allowedRoles={["Project Manager"]}>
              <ManagerEmployeeShiftIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/emp-shift/add"
          element={
            <PrivateRoute allowedRoles={["Project Manager"]}>
              <ManagerEmployeeShiftAddPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/emp-shift/detail/:id"
          element={
            <PrivateRoute allowedRoles={["Project Manager"]}>
              <ManagerEmployeeShiftDetailPage />
            </PrivateRoute>
          }
        />
         <Route
          path="/manager/attendances"
          element={
            <PrivateRoute allowedRoles={["Project Manager"]}>
              <ManagerAttendancesIndexPage />
            </PrivateRoute>
          }
        />
        {/* --- EMPLOYEE ROUTES --- */}
        <Route
          path="/employee/dashboard"
          element={
            <PrivateRoute allowedRoles={["Employee"]}>
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />

        {/* Fallback jika route tidak ditemukan */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;