/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";

export default function IndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [companyFilter, setCompanyFilter] = useState(
    searchParams.get("company_id") || ""
  );
  const [branchFilter, setBranchFilter] = useState(
    searchParams.get("branch_id") || ""
  );
  const [departmentFilter, setDepartmentFilter] = useState(
    searchParams.get("department_id") || ""
  );
  const [positionFilter, setPositionFilter] = useState(
    searchParams.get("job_position_id") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );

  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Fetch Master Data untuk Filter Dropdown (Dilengkapi Debugging Console.log)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [compRes, branchRes, deptRes, posRes] = await Promise.all([
          api.get("/companies"),
          api.get("/branches"),
          api.get("/departments"),
          api.get("/job-positions"),
        ]);
        setCompanies(compRes.data.data || compRes.data || []);
        setBranches(branchRes.data.data || branchRes.data || []);
        setDepartments(deptRes.data.data || deptRes.data || []);
        
        const fetchedPositions = posRes.data.data || posRes.data || [];
        setJobPositions(fetchedPositions);
      } catch (error) {
        console.error("Gagal memuat data master filter:", error);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get("page")) || 1);
    setSearchTerm(searchParams.get("search") || "");
    setCompanyFilter(searchParams.get("company_id") || "");
    setBranchFilter(searchParams.get("branch_id") || "");
    setDepartmentFilter(searchParams.get("department_id") || "");
    setPositionFilter(searchParams.get("job_position_id") || "");
    setStatusFilter(searchParams.get("status") || "");
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (searchTerm) params.search = searchTerm;
    if (companyFilter) params.company_id = companyFilter;
    if (branchFilter) params.branch_id = branchFilter;
    if (departmentFilter) params.department_id = departmentFilter;
    if (positionFilter) params.job_position_id = positionFilter;
    if (statusFilter) params.status = statusFilter;
    setSearchParams(params, { replace: true });
  }, [
    currentPage,
    searchTerm,
    companyFilter,
    branchFilter,
    departmentFilter,
    positionFilter,
    statusFilter,
    setSearchParams,
  ]);

  const fetchData = useCallback(
    async (
      page = 1,
      search = "",
      compId = "",
      branchId = "",
      deptId = "",
      posId = "",
      status = ""
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page,
          limit: itemsPerPage,
        });
        if (search) params.append("search", search);
        if (compId) params.append("company_id", compId);
        if (branchId) params.append("branch_id", branchId);
        if (deptId) params.append("department_id", deptId);
        if (posId) params.append("job_position_id", posId);
        if (status) params.append("status", status);

        const res = await api.get(`/employees?${params.toString()}`);
        const responseData = res.data.data || res.data;

        setEmployees(Array.isArray(responseData) ? responseData : []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.totalData || responseData.length || 0);
      } catch (error) {
        console.error("Gagal memuat data karyawan:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(
        currentPage,
        searchTerm,
        companyFilter,
        branchFilter,
        departmentFilter,
        positionFilter,
        statusFilter
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [
    fetchData,
    currentPage,
    searchTerm,
    companyFilter,
    branchFilter,
    departmentFilter,
    positionFilter,
    statusFilter,
  ]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/super-admin/dashboard"
            className="hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            Karyawan
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Manajemen Karyawan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Kelola data profil, jabatan, dan status kepegawaian perusahaan.
            </p>
          </div>
        </div>

        {/* Filter & Pencarian Lengkap */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Cari Karyawan
            </label>
            <Input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Filter Perusahaan
            </label>
            <div className="relative w-full">
              <select
                value={companyFilter}
                onChange={(e) => {
                  setCompanyFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">Semua Perusahaan</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="16"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Filter Cabang
            </label>
            <div className="relative w-full">
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">Semua Cabang</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="16"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Filter Departemen
            </label>
            <div className="relative w-full">
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">Semua Departemen</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="16"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Filter Jabatan
            </label>
            <div className="relative w-full">
              <select
                value={positionFilter}
                onChange={(e) => {
                  setPositionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">Semua Jabatan</option>
                {jobPositions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title}
                  </option>
                ))}
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="16"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Filter Status
            </label>
            <div className="relative w-full">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">Semua Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Resign">Resign</option>
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="16"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 min-w-0 w-full overflow-hidden">
        <div className="rounded-xl shadow-sm bg-white dark:bg-card w-full overflow-hidden flex flex-col min-w-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Icon
                icon="line-md:loading-twotone-loop"
                width="40"
                className="text-primary"
              />
            </div>
          ) : employees.length === 0 ? (
            <div className="w-full overflow-x-auto p-7">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon
                    icon="solar:users-group-two-rounded-bold-duotone"
                    className="text-primary"
                    width="24"
                  />
                  Daftar Karyawan
                </h3>
                <Link to="/super-admin/employee/add">
                  <Button className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] justify-center">
                    <Icon icon="solar:add-circle-bold" width="20" />
                    Tambah Karyawan
                  </Button>
                </Link>
              </div>
              <div className="text-center py-16">
                <Icon
                  icon="solar:users-group-two-rounded-line-duotone"
                  width="48"
                  className="text-gray-400 mx-auto mb-4"
                />
                <h5 className="text-lg font-medium text-gray-800 dark:text-white">
                  Belum Ada Karyawan
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tambahkan data karyawan baru untuk memulai.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full py-7 overflow-hidden flex flex-col min-w-0">
              <div className="px-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon
                    icon="solar:users-group-two-rounded-bold-duotone"
                    className="text-primary"
                    width="24"
                  />
                  Daftar Karyawan
                </h3>
                <Link to="/super-admin/employee/add">
                  <Button className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] justify-center">
                    <Icon icon="solar:add-circle-bold" width="20" />
                    Tambah Karyawan
                  </Button>
                </Link>
              </div>

              <div className="px-7 w-full mt-4 overflow-x-auto">
                <table className="w-full min-w-[1100px] caption-bottom text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                    <tr>
                      <th className="h-12 px-6 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[60px]">
                        No
                      </th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Nama Lengkap
                      </th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        NIK Karyawan
                      </th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Email / Kontak
                      </th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Perusahaan & Cabang
                      </th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Departemen & Jabatan
                      </th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Status
                      </th>
                      <th className="h-12 px-6 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[100px]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {employees.map((emp, index) => (
                      <tr
                        key={emp.id || index}
                        className="border-b border-gray-100 dark:border-defaultBorder/50 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors"
                      >
                        <td className="p-4 px-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-4 px-4 font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {emp.first_name} {emp.last_name}
                        </td>
                        <td className="p-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap font-mono text-xs">
                          {emp.employee_id_number || "-"}
                        </td>
                        <td className="p-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            {emp.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {emp.phone || "-"}
                          </div>
                        </td>
                        <td className="p-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            {emp.Company?.name || emp.company?.name || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {emp.Branch?.name || emp.branch?.name || "-"}
                          </div>
                        </td>
                        <td className="p-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            {emp.Department?.name ||
                              emp.department?.name ||
                              "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {emp.JobPosition?.title ||
                              emp.job_position?.title ||
                              "-"}
                          </div>
                        </td>
                        <td className="p-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                              emp.status === "Active" || emp.status === "active"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-rose-500/10 text-rose-500"
                            }`}
                          >
                            {emp.status || "Active"}
                          </span>
                        </td>
                        <td className="p-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/super-admin/employee/detail/${emp.id}`}>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-primary hover:bg-primary/10 rounded-md"
                                title="Detail & Edit"
                              >
                                <Icon
                                  icon="solar:eye-bold-duotone"
                                  width="16"
                                />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && employees.length > 0 && (
            <div className="flex justify-between items-center p-7 border-t border-gray-100 dark:border-defaultBorder/50">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} dari{" "}
                {totalItems} data
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                variant="outline"
                size="sm"
              >
                Berikutnya
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}