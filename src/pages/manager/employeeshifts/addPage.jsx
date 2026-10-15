import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
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

export default function AddPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [projects, setProjects] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Filter utama untuk generate matriks
  const [selectedProject, setSelectedProject] = useState("");
  const [startDate, setStartDate] = useState(getFormattedDate(getMonday(new Date())));

  // State matriks jadwal: { [employee_id]: { [dateStr]: shift_id } }
  const [matrixState, setMatrixState] = useState({});

  // 1. Ambil Master Project & Master Shift saat load awal
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [projRes, shiftRes] = await Promise.all([
          api.get("/projects"),
          api.get("/shifts")
        ]);
        setProjects(projRes.data.data || projRes.data || []);
        setShifts(shiftRes.data.data || shiftRes.data || []);
      } catch (error) {
        console.error("Gagal memuat master data:", error);
      }
    };
    fetchMaster();
  }, []);

  // 2. Ambil Karyawan berdasarkan Project yang dipilih via tabel employee_project_schedules
  useEffect(() => {
    const fetchEmployeesByProject = async () => {
      if (!selectedProject) {
        setEmployees([]);
        setMatrixState({});
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/employee-project-schedules?project_id=${selectedProject}`);
        const schedules = res.data.data || res.data || [];
        
        // Ekstrak data karyawan dari relasi Employee
        const empList = schedules.map(item => item.Employee).filter(Boolean);
        
        // Hapus duplikat jika ada penugasan ganda
        const uniqueEmployees = Array.from(new Set(empList.map(a => a.id)))
          .map(id => empList.find(a => a.id === id));

        setEmployees(uniqueEmployees);
        setMatrixState({});
      } catch (error) {
        console.error("Gagal memuat karyawan project:", error);
        Swal.fire("Gagal", "Gagal memuat daftar anggota tim project.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeesByProject();
  }, [selectedProject]);

  // Generate 7 tanggal dalam seminggu mulai dari startDate (Senin)
  const getWeekDays = (startStr) => {
    const start = new Date(startStr);
    const daysName = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    return daysName.map((name, idx) => {
      const d = new Date(start);
      d.setDate(d.getDate() + idx);
      return {
        name,
        dateStr: getFormattedDate(d),
        dateFormatted: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      };
    });
  };

  const weekDays = getWeekDays(startDate);

  // Handle perubahan select shift pada sel matriks
  const handleCellChange = (employeeId, dateStr, shiftId) => {
    setMatrixState((prev) => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || {}),
        [dateStr]: shiftId
      }
    }));
  };

  // Submit Massal (Bulk Save)
  const handleSubmitBulk = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      Swal.fire("Perhatian", "Silakan pilih Project terlebih dahulu.", "warning");
      return;
    }

    // Ubah matrixState menjadi array payload yang siap dikirim ke backend
    const payloadItems = [];
    Object.keys(matrixState).forEach((empId) => {
      Object.keys(matrixState[empId]).forEach((dateStr) => {
        const shiftId = matrixState[empId][dateStr];
        if (shiftId) { // Hanya kirim jika shift dipilih (tidak kosong)
          payloadItems.push({
            employee_id: empId,
            shift_id: shiftId,
            date: dateStr
          });
        }
      });
    });

    if (payloadItems.length === 0) {
      Swal.fire("Perhatian", "Belum ada jadwal shift yang diisi dalam matriks.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/employee-shifts/bulk", { items: payloadItems });
      
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Roster jadwal shift massal berhasil disimpan.",
        showConfirmButton: false,
        timer: 2000,
      });
      navigate("/manager/emp-shift");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan roster.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/manager/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <Link to="/manager/emp-shift" className="hover:text-primary transition-colors">
            Roster Shift
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Atur Roster Massal</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Pengaturan Roster Shift Massal
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pilih project dan rentang minggu untuk mengatur jadwal kerja seluruh karyawan sekaligus.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
        {/* Filter Konfigurasi Awal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Pilih Project *
            </label>
            <div className="relative w-full">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                required
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">-- Pilih Project --</option>
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
              Pilih Minggu (Tanggal Senin) *
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(getFormattedDate(getMonday(e.target.value)))}
              className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200 font-mono text-xs"
            />
          </div>
        </div>

        {/* Tabel Matriks Input Massal */}
        <form onSubmit={handleSubmitBulk}>
          {loading ? (
            <div className="flex justify-center py-16">
              <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
            </div>
          ) : !selectedProject ? (
            <div className="text-center py-16 text-gray-400">
              Silakan pilih project terlebih dahulu untuk memuat daftar anggota tim.
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              Belum ada karyawan yang ditugaskan ke project ini. Silakan atur melalui halaman Detail Project.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[1100px] text-sm text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                  <tr>
                    <th className="h-12 px-4 font-bold text-gray-500 w-[220px]">Karyawan</th>
                    {weekDays.map((wd, idx) => (
                      <th key={idx} className="h-12 px-2 text-center font-bold text-gray-500 whitespace-nowrap">
                        {wd.name}
                        <span className="block text-[10px] font-normal text-gray-400 font-mono">{wd.dateFormatted}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-background/50">
                      <td className="p-3 px-4 font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {emp.first_name} {emp.last_name || ""}
                        <span className="block text-xs font-normal text-gray-400 font-mono">{emp.employee_id_number || "-"}</span>
                      </td>
                      {weekDays.map((wd, dIdx) => (
                        <td key={dIdx} className="p-2 text-center">
                          <select
                            value={matrixState[emp.id]?.[wd.dateStr] || ""}
                            onChange={(e) => handleCellChange(emp.id, wd.dateStr, e.target.value)}
                            className="h-9 rounded-lg px-2 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-xs w-full text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                          >
                            <option value="">- Libur / Off -</option>
                            {shifts.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} {s.clock_in_time ? `(${s.clock_in_time.slice(0, 5)})` : ""}
                              </option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end mt-6">
            <button
              type="submit"
              disabled={submitting || employees.length === 0}
              className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all w-full md:w-auto md:min-w-[220px] flex items-center justify-center gap-2"
            >
              <Icon icon="solar:check-circle-bold" width="18" />
              {submitting ? "Menyimpan Roster..." : "Simpan Semua Jadwal"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}