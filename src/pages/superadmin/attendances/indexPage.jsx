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

  const [currentPage, ] = useState(parseInt(searchParams.get("page")) || 1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [projectFilter, setProjectFilter] = useState(searchParams.get("project_id") || "");
  
  // Ambil tanggal lokal hari ini (bukan ISO UTC) untuk filter default
  const getTodayLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || getTodayLocal());

  const [, setTotalPages] = useState(0);
  const [, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // --- HELPER FORMAT JAM (TANPA KONVERSI ZONA WAKTU) ---
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "-";
    
    // Jika format "2026-10-20 15:57:01", ambil bagian jamnya saja
    if (typeof timeStr === 'string' && timeStr.includes(" ")) {
      return timeStr.split(" ")[1].slice(0, 5); // Hasil: "15:57"
    }

    // Jika format ISO "2026-10-20T15:57:01.000Z"
    if (typeof timeStr === 'string' && timeStr.includes("T")) {
      return timeStr.split("T")[1].slice(0, 5); // Hasil: "15:57"
    }

    return String(timeStr).slice(0, 5);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data.data || res.data || []);
      } catch (error) { console.error(error); }
    };
    fetchProjects();
  }, []);

  const fetchData = useCallback(async (page = 1, search = "", projId = "", date = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: itemsPerPage });
      if (search) params.append("search", search);
      if (projId) params.append("project_id", projId);
      if (date) params.append("date", date);

      const res = await api.get(`/attendances?${params.toString()}`);
      const responseData = res.data.data || res.data;

      setAttendances(Array.isArray(responseData) ? responseData : (responseData.data || []));
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.totalData || responseData.length || 0);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData(currentPage, searchTerm, projectFilter, dateFilter);
    setSearchParams({
      page: currentPage,
      search: searchTerm,
      project_id: projectFilter,
      date: dateFilter
    }, { replace: true });
  }, [fetchData, currentPage, searchTerm, projectFilter, dateFilter, setSearchParams]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Kehadiran</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Rekap Kehadiran Karyawan</h2>
      </div>

      {/* Filter Bar */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input placeholder="Cari Karyawan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select 
          className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 px-3 text-sm"
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
        >
          <option value="">Semua Proyek</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
      </div>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" /></div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Belum ada data kehadiran.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b">
                <tr className="text-gray-500 font-bold uppercase text-[11px]">
                  <th className="p-4">No</th>
                  <th className="p-4">Karyawan</th>
                  <th className="p-4">Proyek</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Clock In</th>
                  <th className="p-4">Clock Out</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((item, index) => {
                  const isLate = item.status?.toLowerCase().includes("late");
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="p-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="p-4 font-bold">{item.Employee?.nama || item.employee_name}</td>
                      <td className="p-4">{item.Project?.name || "Operasional"}</td>
                      <td className="p-4">{item.date}</td>
                      <td className="p-4 text-emerald-600 font-bold">{formatTimeDisplay(item.clock_in)}</td>
                      <td className="p-4 text-amber-600 font-bold">{item.clock_out ? formatTimeDisplay(item.clock_out) : "-"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${isLate ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {item.status?.replace(/\[.*?\]/g, '').trim() || 'Hadir'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedAttendance(item); setShowDetailModal(true); }}>
                          <Icon icon="solar:eye-bold-duotone" width="18" className="text-primary" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Detail Absensi</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-xl">✕</button>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl mb-4 space-y-2 text-sm">
                <p><b>Karyawan:</b> {selectedAttendance.Employee?.nama || selectedAttendance.employee_name}</p>
                <p><b>Tanggal:</b> {selectedAttendance.date}</p>
                <p><b>Clock In:</b> {formatTimeDisplay(selectedAttendance.clock_in)}</p>
                <p><b>Clock Out:</b> {formatTimeDisplay(selectedAttendance.clock_out)}</p>
            </div>
            <div className="space-y-4">
                {selectedAttendance.selfie_in_url && (
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 mb-1">FOTO MASUK</p>
                        <img 
                          src={selectedAttendance.selfie_in_url.includes('http') ? selectedAttendance.selfie_in_url : `https://hrmsapi.petrolum.cloud/${selectedAttendance.selfie_in_url}`} 
                          className="w-full h-72 object-contain bg-black rounded-xl" 
                          alt="Selfie In" 
                        />
                    </div>
                )}
                {selectedAttendance.selfie_out_url && (
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 mb-1">FOTO KELUAR</p>
                        <img 
                          src={selectedAttendance.selfie_out_url.includes('http') ? selectedAttendance.selfie_out_url : `https://hrmsapi.petrolum.cloud/${selectedAttendance.selfie_out_url}`} 
                          className="w-full h-72 object-contain bg-black rounded-xl" 
                          alt="Selfie Out" 
                        />
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}