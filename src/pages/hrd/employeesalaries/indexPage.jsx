/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";

export default function IndexEmployeeSalaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get("department") || "");
  const [positionFilter, setPositionFilter] = useState(searchParams.get("position") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");

  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get("page")) || 1);
    setSearchTerm(searchParams.get("search") || "");
    setDepartmentFilter(searchParams.get("department") || "");
    setPositionFilter(searchParams.get("position") || "");
    setStatusFilter(searchParams.get("status") || "");
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (searchTerm) params.search = searchTerm;
    if (departmentFilter) params.department = departmentFilter;
    if (positionFilter) params.position = positionFilter;
    if (statusFilter) params.status = statusFilter;
    setSearchParams(params, { replace: true });
  }, [currentPage, searchTerm, departmentFilter, positionFilter, statusFilter, setSearchParams]);

  // Ambil data referensi filter (Departemen & Jabatan)
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          api.get("/departments").catch(() => ({ data: { data: [] } })),
          api.get("/job-positions").catch(() => ({ data: { data: [] } }))
        ]);
        setDepartments(deptRes.data.data || deptRes.data || []);
        setPositions(posRes.data.data || posRes.data || []);
      } catch (error) {
        console.error("Gagal memuat data referensi filter:", error);
      }
    };
    fetchReferences();
  }, []);

  const fetchData = useCallback(async (page = 1, search = "", dept = "", pos = "", status = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: itemsPerPage });
      if (search) params.append("search", search);
      if (dept) params.append("department", dept);
      if (pos) params.append("position", pos);
      if (status) params.append("status", status);

      const res = await api.get(`/employees?${params.toString()}`);
      const responseData = res.data.data || res.data;

      setEmployees(Array.isArray(responseData) ? responseData : (responseData.data || []));
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.totalData || responseData.length || 0);
    } catch (error) {
      console.error("Gagal memuat data karyawan:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(currentPage, searchTerm, departmentFilter, positionFilter, statusFilter);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData, currentPage, searchTerm, departmentFilter, positionFilter, statusFilter]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/hr/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Gaji Karyawan</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pengaturan Gaji Karyawan</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Pilih karyawan untuk mengatur komponen pendapatan dan potongan gaji.</p>
          </div>
        </div>

        {/* Filter & Search Bar Grid (4 Kolom) */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Cari Karyawan</label>
            <Input
              type="text"
              placeholder="Nama atau NIK..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Filter Departemen</label>
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
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Filter Jabatan</label>
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
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>{pos.title}</option>
                ))}
              </select>
              <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Status Gaji</label>
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
                <option value="configured">Sudah Diatur</option>
                <option value="unconfigured">Belum Diatur</option>
              </select>
              <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 min-w-0 w-full overflow-hidden">
        <div className="rounded-xl shadow-sm bg-white dark:bg-card w-full overflow-hidden flex flex-col min-w-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16">
              <Icon icon="solar:users-group-rounded-line-duotone" width="48" className="text-gray-400 mx-auto mb-4" />
              <h5 className="text-lg font-medium text-gray-800 dark:text-white">Karyawan Tidak Ditemukan</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Coba ubah kata kunci pencarian atau filter yang digunakan.</p>
            </div>
          ) : (
            <div className="w-full py-7 overflow-hidden flex flex-col min-w-0">
              <div className="px-7 w-full overflow-x-auto">
                <table className="w-full min-w-[800px] caption-bottom text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                    <tr>
                      <th className="h-12 px-6 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[60px]">No</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">NIK</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Nama Karyawan</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Jabatan & Departemen</th>
                      <th className="h-12 px-6 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[120px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {employees.map((emp, index) => {
                      const empNik = emp.employee_id_number || "-";
                      const jobTitle = emp.JobPosition?.title || "Staff";
                      const deptName = emp.Department?.name || "Operasional";

                      return (
                        <tr key={emp.id || index} className="border-b border-gray-100 dark:border-defaultBorder/50 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors">
                          <td className="p-4 px-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-4 px-4 font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {empNik}
                          </td>
                          <td className="p-4 px-4 font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {emp.first_name} {emp.last_name || ""}
                          </td>
                          <td className="p-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                            {jobTitle} • <span className="text-primary font-medium">{deptName}</span>
                          </td>
                          <td className="p-4 px-6 text-right whitespace-nowrap">
                            <Link to={`/hr/esalaries/detail/${emp.id}`}>
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs bg-primary text-white flex items-center gap-1.5 ml-auto"
                              >
                                <Icon icon="solar:wallet-money-bold-duotone" width="16" />
                                Atur Gaji
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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
                {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
              </span>
              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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