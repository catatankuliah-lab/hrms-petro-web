import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default function DetailOvertimePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    employee_id: "",
    project_id: "",
    date: "",
    start_time: "",
    end_time: "",
    reason: "",
    status: "Pending"
  });

  // State Searchable Dropdown Karyawan
  const [empSearch, setEmpSearch] = useState("");
  const [isEmpOpen, setIsEmpOpen] = useState(false);
  const [selectedEmpName, setSelectedEmpName] = useState("");
  const empRef = useRef(null);

  // State Searchable Dropdown Proyek
  const [projSearch, setProjSearch] = useState("");
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [selectedProjName, setSelectedProjName] = useState("");
  const projRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const [empRes, projRes, detailRes] = await Promise.all([
          api.get("/employees"),
          api.get("/projects"),
          api.get(`/overtimes/${id}`)
        ]);

        const empList = empRes.data.data || empRes.data || [];
        const projList = projRes.data.data || projRes.data || [];
        setEmployees(empList);
        setProjects(projList);

        const data = detailRes.data.data || detailRes.data;
        const curEmpId = data.employee_id || data.Employee?.id || "";
        const curProjId = data.project_id || data.Project?.id || "";

        setFormData({
          employee_id: curEmpId,
          project_id: curProjId,
          date: data.date || "",
          start_time: data.start_time || "",
          end_time: data.end_time || "",
          reason: data.reason || "",
          status: data.status || "Pending"
        });

        // Set nama awal karyawan
        const foundEmp = empList.find(e => String(e.id) === String(curEmpId));
        if (foundEmp) {
          const jobTitle = foundEmp.JobPosition?.title || "Staff";
          const deptName = foundEmp.Department?.name || "Operasional";
          setSelectedEmpName(`${foundEmp.first_name} ${foundEmp.last_name || ""} (${jobTitle} • ${deptName})`);
        }

        // Set nama awal proyek
        const foundProj = projList.find(p => String(p.id) === String(curProjId));
        if (foundProj) {
          setSelectedProjName(`${foundProj.name} (${foundProj.client_name || "Klien"})`);
        }
      } catch (error) {
        console.error("Gagal memuat detail lembur:", error);
        Swal.fire("Gagal", "Gagal memuat data lembur dari server.", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchData();

    const handleClickOutside = (event) => {
      if (empRef.current && !empRef.current.contains(event.target)) setIsEmpOpen(false);
      if (projRef.current && !projRef.current.contains(event.target)) setIsProjOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name || ""}`.toLowerCase();
    const nik = (emp.employee_id_number || "").toLowerCase();
    const jobTitle = (emp.JobPosition?.title || "").toLowerCase();
    const deptName = (emp.Department?.name || "").toLowerCase();
    const query = empSearch.toLowerCase();
    return fullName.includes(query) || nik.includes(query) || jobTitle.includes(query) || deptName.includes(query);
  });

  const filteredProjects = projects.filter((proj) => {
    const projName = (proj.name || "").toLowerCase();
    const clientName = (proj.client_name || "").toLowerCase();
    const query = projSearch.toLowerCase();
    return projName.includes(query) || clientName.includes(query);
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.project_id) {
      Swal.fire({ icon: "warning", title: "Perhatian", text: "Karyawan dan Proyek wajib dipilih!" });
      return;
    }

    setLoading(true);
    try {
      await api.put(`/overtimes/${id}`, formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data lembur berhasil diperbarui.",
        showConfirmButton: false,
        timer: 2000,
      });
      navigate("/hr/overtimes");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan saat memperbarui data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data pengajuan lembur yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/overtimes/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Data lembur berhasil dihapus.",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate("/hr/overtimes");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.response?.data?.message || "Gagal menghapus data lembur.",
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/hr/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <Link to="/hr/overtimes" className="hover:text-primary transition-colors">Lembur (Overtime)</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Detail & Edit Lembur</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detail & Edit Pengajuan Lembur</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola persetujuan atau perbarui informasi lembur karyawan.</p>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center py-16">
          <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
        </div>
      ) : (
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold-duotone" className="text-primary" width="24" />
              Formulir Lembur (#{id})
            </h3>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Searchable Select Karyawan */}
              <div className="relative" ref={empRef}>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Pilih Karyawan *</label>
                <div 
                  onClick={() => setIsEmpOpen(true)}
                  className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full flex items-center justify-between cursor-pointer text-gray-800 dark:text-gray-200"
                >
                  <span className={selectedEmpName ? "text-gray-800 dark:text-gray-200 font-medium truncate pr-2" : "text-gray-400"}>
                    {selectedEmpName || "-- Pilih atau Cari Karyawan --"}
                  </span>
                  <Icon icon="solar:alt-arrow-down-linear" className="text-gray-400 shrink-0" width="16" />
                </div>

                {isEmpOpen && (
                  <div className="absolute left-0 right-0 top-[74px] z-50 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 space-y-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={empSearch}
                        onChange={(e) => setEmpSearch(e.target.value)}
                        placeholder="Cari nama, NIK, jabatan..."
                        autoFocus
                        className="h-9 rounded-lg px-3 pl-8 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-xs w-full text-gray-800 dark:text-gray-200"
                      />
                      <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" />
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {filteredEmployees.length === 0 ? (
                        <div className="text-center py-3 text-xs text-gray-400">Karyawan tidak ditemukan</div>
                      ) : (
                        filteredEmployees.map((emp) => {
                          const jobTitle = emp.JobPosition?.title || "Staff";
                          const deptName = emp.Department?.name || "Operasional";
                          const empNik = emp.employee_id_number || "-";

                          return (
                            <div
                              key={emp.id}
                              onClick={() => {
                                setFormData({ ...formData, employee_id: emp.id });
                                setSelectedEmpName(`${emp.first_name} ${emp.last_name || ""} (${jobTitle} • ${deptName})`);
                                setIsEmpOpen(false);
                                setEmpSearch("");
                              }}
                              className="px-3 py-2 text-xs rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium border-b border-gray-100 dark:border-gray-800/50 last:border-none"
                            >
                              <div>
                                <div className="font-bold text-gray-800 dark:text-gray-200">
                                  {emp.first_name} {emp.last_name || ""}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {jobTitle} • {deptName}
                                </div>
                              </div>
                              <span className="font-mono text-gray-400 text-[10px]">{empNik}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Searchable Select Proyek */}
              <div className="relative" ref={projRef}>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Pilih Proyek *</label>
                <div 
                  onClick={() => setIsProjOpen(true)}
                  className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full flex items-center justify-between cursor-pointer text-gray-800 dark:text-gray-200"
                >
                  <span className={selectedProjName ? "text-gray-800 dark:text-gray-200 font-medium truncate pr-2" : "text-gray-400"}>
                    {selectedProjName || "-- Pilih atau Cari Proyek --"}
                  </span>
                  <Icon icon="solar:alt-arrow-down-linear" className="text-gray-400 shrink-0" width="16" />
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
                      {filteredProjects.length === 0 ? (
                        <div className="text-center py-3 text-xs text-gray-400">Proyek tidak ditemukan</div>
                      ) : (
                        filteredProjects.map((proj) => (
                          <div
                            key={proj.id}
                            onClick={() => {
                              setFormData({ ...formData, project_id: proj.id });
                              setSelectedProjName(`${proj.name} (${proj.client_name || "Klien"})`);
                              setIsProjOpen(false);
                              setProjSearch("");
                            }}
                            className="px-3 py-2 text-xs rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium"
                          >
                            <span>{proj.name}</span>
                            <span className="font-mono text-gray-400">{proj.client_name || "-"}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Tanggal Lembur *</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Jam Mulai *</label>
                <Input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Jam Selesai *</label>
                <Input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Status Approval *</label>
                <div className="relative w-full">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Alasan / Keterangan Lembur *</label>
                <Input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Contoh: Menyelesaikan laporan penutupan proyek"
                  required
                  className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={handleDelete}
                className="h-10 px-6 bg-rose-50 dark:bg-rose-950/50 text-rose-600 font-bold text-xs rounded-xl shadow-sm hover:bg-rose-100 transition-all w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
              >
                <Icon icon="solar:trash-bin-trash-bold" width="18" />
                Hapus
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
              >
                <Icon icon="solar:check-circle-bold" width="18" />
                {loading ? "Memproses..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}