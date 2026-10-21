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

  const [attendances, setAttendances] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [projectFilter, setProjectFilter] = useState(searchParams.get("project_id") || "");
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || new Date().toISOString().split("T")[0]);

  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // States untuk Detail Modal
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Ambil daftar proyek untuk pilihan dropdown filter
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data.data || res.data || []);
      } catch (error) {
        console.error("Gagal memuat data proyek:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get("page")) || 1);
    setSearchTerm(searchParams.get("search") || "");
    setProjectFilter(searchParams.get("project_id") || "");
    setDateFilter(searchParams.get("date") || new Date().toISOString().split("T")[0]);
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (searchTerm) params.search = searchTerm;
    if (projectFilter) params.project_id = projectFilter;
    if (dateFilter) params.date = dateFilter;
    setSearchParams(params, { replace: true });
  }, [currentPage, searchTerm, projectFilter, dateFilter, setSearchParams]);

  const fetchData = useCallback(async (page = 1, search = "", projId = "", date = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage,
      });
      if (search) params.append("search", search);
      if (projId) params.append("project_id", projId);
      if (date) params.append("date", date);

      const res = await api.get(`/attendances?${params.toString()}`);
      const responseData = res.data.data || res.data;

      setAttendances(Array.isArray(responseData) ? responseData : (responseData.data || []));
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.totalData || responseData.length || 0);
    } catch (error) {
      console.error("Gagal memuat data kehadiran:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(currentPage, searchTerm, projectFilter, dateFilter);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData, currentPage, searchTerm, projectFilter, dateFilter]);

  // Helper Format Jam: Mengatasi pergeseran UTC ke WIB (+7 Jam) secara aman di Frontend
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "-";
    
    try {
      // Jika format dari backend berupa ISO string ber-Z (misal: "2026-10-20T00:57:01.000Z")
      if (typeof timeStr === 'string' && (timeStr.includes("T") || timeStr.includes("Z"))) {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
          // Paksa render ke zona waktu Asia/Jakarta (WIB)
          return d.toLocaleTimeString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          });
        }
      }

      // Jika format SQL biasa ("2026-10-20 07:57:01")
      if (typeof timeStr === 'string' && timeStr.includes(" ")) {
        const parts = timeStr.split(" ")[1];
        return parts ? parts.slice(0, 5) : "-";
      }

      return String(timeStr).slice(0, 5);
    } catch (e) {
      console.error("Gagal format waktu:", e);
      return timeStr;
    }
  };

  const handleOpenDetail = (item) => {
    setSelectedAttendance(item);
    setShowDetailModal(true);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/hr/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Kehadiran</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Rekap Kehadiran Karyawan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Pantau log absensi, status kehadiran, koordinat GPS, dan bukti foto selfie seluruh karyawan.
            </p>
          </div>
        </div>

        {/* Bar Filter & Pencarian */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Cari Karyawan
            </label>
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

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Filter Proyek
            </label>
            <div className="relative w-full">
              <select
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">Semua Proyek</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
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
              Filter Tanggal
            </label>
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
          ) : attendances.length === 0 ? (
            <div className="w-full overflow-x-auto p-7">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon icon="solar:user-check-bold-duotone" className="text-primary" width="24" />
                  Daftar Kehadiran
                </h3>
              </div>
              <div className="text-center py-16">
                <Icon icon="solar:user-bold-duotone" width="48" className="text-gray-400 mx-auto mb-4" />
                <h5 className="text-lg font-medium text-gray-800 dark:text-white">Tidak Ada Data Kehadiran</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Belum ada catatan absensi untuk kriteria ini.</p>
              </div>
            </div>
          ) : (
            <div className="w-full py-7 overflow-hidden flex flex-col min-w-0">
              <div className="px-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon icon="solar:user-check-bold-duotone" className="text-primary" width="24" />
                  Daftar Kehadiran
                </h3>
              </div>

              <div className="px-7 w-full mt-4 overflow-x-auto">
                <table className="w-full min-w-[900px] caption-bottom text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                    <tr>
                      <th className="h-12 px-6 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[60px]">No</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Karyawan</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Proyek / Lokasi</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Tanggal</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Clock In</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Clock Out</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                      <th className="h-12 px-6 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[100px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {attendances.map((item, index) => {
                      const empName = item.Employee?.first_name 
                        ? `${item.Employee.first_name} ${item.Employee.last_name || ''}`.trim()
                        : (item.Employee?.nama || item.employee_name || "Karyawan");
                      
                      const empRole = item.Employee?.role || item.employee_role || "-";
                      const projName = item.Project?.name || item.project_name || "Penugasan Operasional";
                      const isLate = item.status && item.status.toLowerCase().includes("late");
                      
                      const rawStatus = item.status || 'Hadir';
                      const cleanStatus = rawStatus.replace(/\[.*?\]/g, '').trim();

                      return (
                        <tr key={item.id || index} className="border-b border-gray-100 dark:border-defaultBorder/50 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors">
                          <td className="p-4 px-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-4 px-4 whitespace-nowrap">
                            <div className="font-bold text-gray-800 dark:text-gray-200">{empName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{empRole}</div>
                          </td>
                          <td className="p-4 px-4 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {projName}
                          </td>
                          <td className="p-4 px-4 font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="p-4 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {formatTimeDisplay(item.clock_in)}
                          </td>
                          <td className="p-4 px-4 font-mono font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                            {item.clock_out ? formatTimeDisplay(item.clock_out) : "Belum Out"}
                          </td>
                          <td className="p-4 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                              isLate 
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" 
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}>
                              {cleanStatus || (isLate ? "Terlambat" : "Hadir")}
                            </span>
                          </td>
                          <td className="p-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleOpenDetail(item)}
                                className="h-8 w-8 text-primary hover:bg-primary/10 rounded-md"
                                title="Detail & Foto"
                              >
                                <Icon icon="solar:eye-bold-duotone" width="16" />
                              </Button>
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

          {!loading && attendances.length > 0 && (
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

      {/* MODAL DETAIL */}
      {showDetailModal && selectedAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Icon icon="solar:user-check-bold-duotone" className="text-primary" width="22" />
                Detail Kehadiran Karyawan
              </h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <p><b>Karyawan:</b> <span className="text-slate-900 dark:text-white font-bold">{selectedAttendance.Employee?.nama || selectedAttendance.employee_name || "-"}</span></p>
                <p><b>Proyek:</b> <span className="text-slate-900 dark:text-white font-medium">{selectedAttendance.Project?.name || selectedAttendance.project_name || "-"}</span></p>
                <p><b>Tanggal:</b> <span className="font-mono">{selectedAttendance.date}</span></p>
                <p><b>Status:</b> <span className={`font-bold ${selectedAttendance.status?.toLowerCase().includes('late') ? 'text-amber-500' : 'text-emerald-500'}`}>{selectedAttendance.status?.replace(/\[.*?\]/g, '').trim() || 'Hadir'}</span></p>
                <p><b>Clock In:</b> <span className="font-mono text-emerald-600 font-bold">{formatTimeDisplay(selectedAttendance.clock_in)}</span></p>
                <p><b>Clock Out:</b> <span className="font-mono text-amber-600 font-bold">{selectedAttendance.clock_out ? formatTimeDisplay(selectedAttendance.clock_out) : 'Belum Out'}</span></p>
                <p><b>Koordinat In:</b> <span className="font-mono text-slate-500">{selectedAttendance.clock_in_lat || '-'}, {selectedAttendance.clock_in_lng || '-'}</span></p>
              </div>

              <div className="space-y-3">
                {selectedAttendance.selfie_in_url && (
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
                    <p className="font-bold text-slate-300 mb-2 text-[11px]">📸 Foto Clock In (Masuk)</p>
                    <img src={selectedAttendance.selfie_in_url.includes('http') ? selectedAttendance.selfie_in_url : `https://hrmsapi.petrolum.cloud/${selectedAttendance.selfie_in_url}`} onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/150?text=Gagal+Muat'; }} className="w-full max-h-72 object-contain rounded-xl bg-black" alt="Selfie In" />
                  </div>
                )}
                {selectedAttendance.selfie_out_url && (
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
                    <p className="font-bold text-slate-300 mb-2 text-[11px]">📷 Foto Clock Out (Pulang)</p>
                    <img src={selectedAttendance.selfie_out_url.includes('http') ? selectedAttendance.selfie_out_url : `https://hrmsapi.petrolum.cloud/${selectedAttendance.selfie_out_url}`} onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/150?text=Gagal+Muat'; }} className="w-full max-h-72 object-contain rounded-xl bg-black" alt="Selfie Out" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}