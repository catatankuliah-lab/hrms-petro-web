/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";

export default function IndexOvertimePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [overtimes, setOvertimes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [projectFilter, setProjectFilter] = useState(searchParams.get("project_id") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");

  // State Searchable Dropdown untuk Filter Proyek
  const [projSearch, setProjSearch] = useState("");
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [selectedProjFilterName, setSelectedProjFilterName] = useState("");
  const projRef = useRef(null);

  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        const list = res.data.data || res.data || [];
        setProjects(list);

        const currentProjId = searchParams.get("project_id");
        if (currentProjId) {
          const found = list.find(p => String(p.id) === String(currentProjId));
          if (found) setSelectedProjFilterName(`${found.name} (${found.client_name || "Klien"})`);
        }
      } catch (error) {
        console.error("Gagal memuat proyek:", error);
      }
    };
    fetchProjects();

    const handleClickOutside = (event) => {
      if (projRef.current && !projRef.current.contains(event.target)) setIsProjOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get("page")) || 1);
    setSearchTerm(searchParams.get("search") || "");
    setProjectFilter(searchParams.get("project_id") || "");
    setStatusFilter(searchParams.get("status") || "");
    setDateFilter(searchParams.get("date") || "");
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (searchTerm) params.search = searchTerm;
    if (projectFilter) params.project_id = projectFilter;
    if (statusFilter) params.status = statusFilter;
    if (dateFilter) params.date = dateFilter;
    setSearchParams(params, { replace: true });
  }, [currentPage, searchTerm, projectFilter, statusFilter, dateFilter, setSearchParams]);

  const fetchData = useCallback(async (page = 1, search = "", projId = "", status = "", date = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage,
      });
      if (search) params.append("search", search);
      if (projId) params.append("project_id", projId);
      if (status) params.append("status", status);
      if (date) params.append("date", date);

      const res = await api.get(`/overtimes?${params.toString()}`);
      const responseData = res.data.data || res.data;

      setOvertimes(Array.isArray(responseData) ? responseData : (responseData.data || []));
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.totalData || responseData.length || 0);
    } catch (error) {
      console.error("Gagal memuat data lembur:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(currentPage, searchTerm, projectFilter, statusFilter, dateFilter);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData, currentPage, searchTerm, projectFilter, statusFilter, dateFilter]);

  const filteredProjectsForFilter = projects.filter((proj) => {
    const projName = (proj.name || "").toLowerCase();
    const clientName = (proj.client_name || "").toLowerCase();
    return projName.includes(projSearch.toLowerCase()) || clientName.includes(projSearch.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/hr/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Lembur (Overtime)</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Lembur Karyawan</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Pantau dan kelola pengajuan jam lembur seluruh karyawan berdasarkan proyek.</p>
          </div>
        </div>

        {/* Bar Filter / Pencarian */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Cari Karyawan</label>
            <Input
              type="text"
              placeholder="Cari nama karyawan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Searchable Select Filter Proyek */}
          <div className="relative" ref={projRef}>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Filter Proyek</label>
            <div 
              onClick={() => setIsProjOpen(true)}
              className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full flex items-center justify-between cursor-pointer text-gray-800 dark:text-gray-200"
            >
              <span className={selectedProjFilterName ? "text-gray-800 dark:text-gray-200 font-medium truncate pr-2" : "text-gray-400"}>
                {selectedProjFilterName || "Semua Proyek"}
              </span>
              <div className="flex items-center gap-1">
                {projectFilter && (
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectFilter("");
                      setSelectedProjFilterName("");
                      setCurrentPage(1);
                    }}
                    className="text-gray-400 hover:text-rose-500 text-xs px-1"
                    title="Reset Filter"
                  >
                    ✕
                  </span>
                )}
                <Icon icon="solar:alt-arrow-down-linear" className="text-gray-400 shrink-0" width="16" />
              </div>
            </div>

            {isProjOpen && (
              <div className="absolute left-0 right-0 top-[74px] z-50 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    value={projSearch}
                    onChange={(e) => setProjSearch(e.target.value)}
                    placeholder="Cari nama proyek..."
                    autoFocus
                    className="h-9 rounded-lg px-3 pl-8 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-xs w-full text-gray-800 dark:text-gray-200"
                  />
                  <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  <div
                    onClick={() => {
                      setProjectFilter("");
                      setSelectedProjFilterName("");
                      setIsProjOpen(false);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-xs rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors text-gray-500 font-medium"
                  >
                    -- Semua Proyek --
                  </div>
                  {filteredProjectsForFilter.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setProjectFilter(proj.id);
                        setSelectedProjFilterName(`${proj.name} (${proj.client_name || "Klien"})`);
                        setIsProjOpen(false);
                        setProjSearch("");
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 text-xs rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium"
                    >
                      <span>{proj.name}</span>
                      <span className="font-mono text-gray-400">{proj.client_name || "-"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Filter Status</label>
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
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Filter Tanggal</label>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-4 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 min-w-0 w-full overflow-hidden">
        <div className="rounded-xl shadow-sm bg-white dark:bg-card w-full overflow-hidden flex flex-col min-w-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
            </div>
          ) : overtimes.length === 0 ? (
            <div className="w-full overflow-x-auto p-7">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon icon="solar:clock-circle-bold-duotone" className="text-primary" width="24" />
                  Daftar Lembur
                </h3>
                <Link to="/hr/overtimes/add">
                  <Button className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] justify-center">
                    <Icon icon="solar:add-circle-bold" width="20" />
                    Tambah Lembur
                  </Button>
                </Link>
              </div>
              <div className="text-center py-16">
                <Icon icon="solar:clock-circle-line-duotone" width="48" className="text-gray-400 mx-auto mb-4" />
                <h5 className="text-lg font-medium text-gray-800 dark:text-white">Belum Ada Data Lembur</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tambahkan pengajuan lembur baru untuk memulai.</p>
              </div>
            </div>
          ) : (
            <div className="w-full py-7 overflow-hidden flex flex-col min-w-0">
              <div className="px-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon icon="solar:clock-circle-bold-duotone" className="text-primary" width="24" />
                  Daftar Lembur
                </h3>
                <Link to="/hr/overtimes/add">
                  <Button className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] justify-center">
                    <Icon icon="solar:add-circle-bold" width="20" />
                    Tambah Lembur
                  </Button>
                </Link>
              </div>

              <div className="px-7 w-full mt-4 overflow-x-auto">
                <table className="w-full min-w-[1100px] caption-bottom text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                    <tr>
                      <th className="h-12 px-6 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[60px]">No</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Karyawan & Posisi</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Proyek</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Tanggal</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Waktu Lembur</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Durasi</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Alasan</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                      <th className="h-12 px-6 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[100px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {overtimes.map((item, index) => {
                      const empName = item.Employee?.first_name 
                        ? `${item.Employee.first_name} ${item.Employee.last_name || ''}`.trim()
                        : (item.Employee?.nama || "Karyawan");
                      
                      const jobTitle = item.Employee?.JobPosition?.title || "Staff";
                      const deptName = item.Employee?.Department?.name || "Operasional";
                      const empNik = item.Employee?.employee_id_number || "-";

                      const projName = item.Project?.name || item.project_name || "-";
                      const statusVal = item.status || "Pending";

                      let badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                      if (statusVal.toLowerCase() === "approved") {
                        badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                      } else if (statusVal.toLowerCase() === "rejected") {
                        badgeColor = "bg-rose-500/10 text-rose-600 border-rose-500/20";
                      }

                      return (
                        <tr key={item.id || index} className="border-b border-gray-100 dark:border-defaultBorder/50 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors">
                          <td className="p-4 px-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-4 px-4 whitespace-nowrap">
                            <div className="font-bold text-gray-800 dark:text-gray-200">{empName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {jobTitle} • {deptName}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">NIK: {empNik}</div>
                          </td>
                          <td className="p-4 px-4 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {projName}
                          </td>
                          <td className="p-4 px-4 font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="p-4 px-4 font-mono font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                          </td>
                          <td className="p-4 px-4 font-mono font-bold text-primary whitespace-nowrap">
                            {item.duration_hours ? `${item.duration_hours} Jam` : "-"}
                          </td>
                          <td className="p-4 px-4 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                            {item.reason}
                          </td>
                          <td className="p-4 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${badgeColor}`}>
                              {statusVal}
                            </span>
                          </td>
                          <td className="p-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link to={`/hr/overtimes/detail/${item.id}`}>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 text-primary hover:bg-primary/10 rounded-md"
                                  title="Detail & Edit"
                                >
                                  <Icon icon="solar:eye-bold-duotone" width="16" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && overtimes.length > 0 && (
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