/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

// Helper tanggal
function getFormattedDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function IndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [rosterData, setRosterData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [masterShifts, setMasterShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [projectFilter, setProjectFilter] = useState(searchParams.get("project_id") || "");
  const [startDate, setStartDate] = useState(
    searchParams.get("start_date") || getFormattedDate(getMonday(new Date()))
  );

  // State untuk Modal Quick Edit per Sel Tanggal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState(null);
  const [selectedNewShift, setSelectedNewShift] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load Master Project & Master Shift
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [projRes, shiftRes] = await Promise.all([
          api.get("/projects"),
          api.get("/shifts")
        ]);
        setProjects(projRes.data.data || projRes.data || []);
        setMasterShifts(shiftRes.data.data || shiftRes.data || []);
      } catch (error) {
        console.error("Gagal memuat master data:", error);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    const currentStart = searchParams.get("start_date") || getFormattedDate(getMonday(new Date()));
    setSearchTerm(searchParams.get("search") || "");
    setProjectFilter(searchParams.get("project_id") || "");
    setStartDate(currentStart);
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (projectFilter) params.project_id = projectFilter;
    if (startDate) params.start_date = startDate;
    setSearchParams(params, { replace: true });
  }, [searchTerm, projectFilter, startDate, setSearchParams]);

  const fetchRoster = useCallback(async (search = "", projId = "", start = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (projId) params.append("project_id", projId);
      if (start) params.append("start_date", start);

      const res = await api.get(`/employee-shifts?${params.toString()}`);
      const responseData = res.data.data || res.data;

      const activeProjectObj = projects.find(p => String(p.id) === String(projId));
      const defaultProjName = activeProjectObj ? activeProjectObj.name : "Penugasan Operasional";

      const employeeMap = {};
      const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      const startOfWeek = new Date(start || getMonday(new Date()));

      const weekDates = dayKeys.map((_, idx) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + idx);
        return getFormattedDate(d);
      });

      if (Array.isArray(responseData)) {
        responseData.forEach((item) => {
          if (!item.Employee) return;

          const empId = item.employee_id;
          
          const departmentName = item.employee_department || item.Employee?.Department?.name || "Divisi Umum";
          const employeeRole = item.employee_role || item.Employee?.JobPosition?.name || item.Employee?.position || "Staff / Karyawan";
          const projectName = item.project_name || item.Project?.name || defaultProjName;

          if (!employeeMap[empId]) {
            const initialDays = {};
            weekDates.forEach((dateStr, idx) => {
              initialDays[dayKeys[idx]] = {
                shift_record_id: null,
                shift_id: null,
                shift_name: null,
                date: dateStr
              };
            });

            employeeMap[empId] = {
              employee_id: empId,
              employee_name: `${item.Employee.first_name} ${item.Employee.last_name || ""}`,
              employee_id_number: item.Employee.employee_id_number || "-",
              employee_department: departmentName,
              employee_role: employeeRole,
              project_name: projectName,
              days: initialDays
            };
          }

          const itemDate = item.date;
          const dayIndex = weekDates.indexOf(itemDate);

          if (dayIndex !== -1) {
            const dayKey = dayKeys[dayIndex];
            employeeMap[empId].days[dayKey] = {
              shift_record_id: item.id,
              shift_id: item.Shift ? item.Shift.id : null,
              shift_name: item.Shift ? item.Shift.name : null,
              date: itemDate
            };
          }
        });
      }

      setRosterData(Object.values(employeeMap));
    } catch (error) {
      console.error("Gagal memuat data roster:", error);
      setRosterData([]);
    } finally {
      setLoading(false);
    }
  }, [projects]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoster(searchTerm, projectFilter, startDate);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchRoster, searchTerm, projectFilter, startDate]);

  // Handler Ketika Sel Matrix Diklik untuk Quick Edit
  const handleCellClick = (employee, dayKey, shiftData) => {
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayIndex = dayKeys.indexOf(dayKey);
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayIndex);
    const targetDate = getFormattedDate(d);

    setActiveCell({
      employee_id: employee.employee_id,
      employee_name: employee.employee_name,
      date: targetDate,
      shift_record_id: shiftData?.shift_record_id || null,
      current_shift_id: shiftData?.shift_id || ""
    });
    setSelectedNewShift(shiftData?.shift_id || "");
    setIsModalOpen(true);
  };

  // Submit Perubahan Shift Satuan (Quick Edit)
  const handleQuickEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeCell) return;

    setSubmitting(true);
    try {
      await api.post("/employee-shifts", {
        employee_id: activeCell.employee_id,
        shift_id: selectedNewShift || null,
        date: activeCell.date
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Jadwal shift harian berhasil diperbarui.",
        showConfirmButton: false,
        timer: 1500,
      });

      setIsModalOpen(false);
      fetchRoster(searchTerm, projectFilter, startDate);
    } catch (error) {
      Swal.fire("Gagal", error.response?.data?.message || "Gagal memperbarui shift.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getWeekDaysHeader = (startStr) => {
    const start = new Date(startStr);
    const daysName = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    return daysName.map((name, idx) => {
      const d = new Date(start);
      d.setDate(d.getDate() + idx);
      return {
        name,
        dateFormatted: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      };
    });
  };

  const weekHeaders = getWeekDaysHeader(startDate);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/manager/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Roster Shift</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Roster Jadwal Shift Mingguan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Klik pada salah satu kotak jadwal di bawah untuk mengubah shift karyawan secara instan.
            </p>
          </div>
        </div>

        {/* Filter 3 Kolom Sejajar */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Cari Karyawan
            </label>
            <Input
              type="text"
              placeholder="Cari nama karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Filter Project
            </label>
            <div className="relative w-full">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">Semua Project</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name} ({proj.client_name || "Klien"})
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
              Pilih Minggu (Tanggal Senin)
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(getFormattedDate(getMonday(e.target.value)))}
              className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200 font-mono text-xs"
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
          ) : (
            <div className="w-full py-7 overflow-hidden flex flex-col min-w-0">
              <div className="px-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon icon="solar:calendar-bold-duotone" className="text-primary" width="24" />
                  Matriks Jadwal Kerja Mingguan (Klik sel untuk edit)
                </h3>
                <Link to="/manager/emp-shift/add">
                  <Button className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] justify-center">
                    <Icon icon="solar:add-circle-bold" width="20" />
                    Atur Shift Massal
                  </Button>
                </Link>
              </div>

              <div className="px-7 w-full mt-4 overflow-x-auto">
                <table className="w-full min-w-[1000px] caption-bottom text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                    <tr>
                      <th className="h-12 px-6 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[280px]">
                        Karyawan, Jabatan & Project
                      </th>
                      {weekHeaders.map((wh, idx) => (
                        <th key={idx} className="h-12 px-3 text-center font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {wh.name}
                          <span className="block text-[10px] font-normal text-gray-400 font-mono">
                            {wh.dateFormatted}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {rosterData.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-12 text-gray-400">
                          Belum ada data roster untuk minggu ini.
                        </td>
                      </tr>
                    ) : (
                      rosterData.map((row, index) => (
                        <tr key={row.employee_id || index} className="border-b border-gray-100 dark:border-defaultBorder/50 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors">
                          <td className="p-4 px-6 text-gray-800 dark:text-gray-200">
                            {/* Baris 1: Nama Karyawan */}
                            <div className="font-bold">{row.employee_name}</div>
                            
                            {/* Baris 2: NIK Karyawan */}
                            <div className="text-xs font-mono text-gray-400 mt-0.5">
                              {row.employee_id_number || "-"}
                            </div>

                            {/* Baris 3: Badge Gabungan (Divisi - Jabatan) & Project */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/25">
                                🏢 {row.employee_department} - {row.employee_role}
                              </span>
                              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/25">
                                📁 {row.project_name}
                              </span>
                            </div>
                          </td>

                          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((dayKey, dIdx) => {
                            const shiftInfo = row.days ? row.days[dayKey] : null;
                            return (
                              <td 
                                key={dIdx} 
                                onClick={() => handleCellClick(row, dayKey, shiftInfo)}
                                className="p-3 text-center whitespace-nowrap cursor-pointer group"
                              >
                                {shiftInfo?.shift_name ? (
                                  <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                    {shiftInfo.shift_name}
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-1 text-xs text-gray-400 italic rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-slate-800 transition-all">
                                    Libur / -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL QUICK EDIT SATUAN PER SEL */}
      {isModalOpen && activeCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Icon icon="solar:pen-new-square-bold-duotone" className="text-primary" width="22" />
                Ubah Shift Harian
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <Icon icon="solar:close-circle-linear" width="22" />
              </button>
            </div>

            <form onSubmit={handleQuickEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Karyawan</label>
                <Input
                  type="text"
                  disabled
                  value={activeCell.employee_name}
                  className="h-10 rounded-xl bg-gray-100 dark:bg-[#2a3547]/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Tanggal Penugasan</label>
                <Input
                  type="text"
                  disabled
                  value={activeCell.date}
                  className="h-10 rounded-xl bg-gray-100 dark:bg-[#2a3547]/50 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                  Pilih Shift Kerja *
                </label>
                <div className="relative w-full">
                  <select
                    value={selectedNewShift}
                    onChange={(e) => setSelectedNewShift(e.target.value)}
                    className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                  >
                    <option value="">-- Libur / Off (Kosongkan) --</option>
                    {masterShifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.clock_in_time ? `(${s.clock_in_time.slice(0, 5)})` : ""}
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

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}