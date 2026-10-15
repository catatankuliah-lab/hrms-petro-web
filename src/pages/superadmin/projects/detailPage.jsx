import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State untuk Project
  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    latitude: "",
    longitude: "",
    radius_meter: "",
    status: "Active"
  });

  // State untuk Anggota Karyawan di Project ini
  const [projectEmployees, setProjectEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  
  // State untuk Custom Select2 (Searchable Dropdown)
  const [empSearchQuery, setEmpSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEmpName, setSelectedEmpName] = useState("");
  const dropdownRef = useRef(null);

  const [assignForm, setAssignForm] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const [projRes, schedRes, empRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/employee-project-schedules?project_id=${id}`),
          api.get("/employees?limit=100")
        ]);

        const projData = projRes.data.data || projRes.data;
        setFormData({
          name: projData.name || "",
          client_name: projData.client_name || "",
          latitude: projData.latitude || "",
          longitude: projData.longitude || "",
          radius_meter: projData.radius_meter || "",
          status: projData.status || "Active"
        });

        setProjectEmployees(schedRes.data.data || schedRes.data || []);
        setAllEmployees(empRes.data.data || empRes.data || []);
      } catch (error) {
        console.error(error);
        Swal.fire("Gagal", "Gagal memuat data project dan anggota tim.", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  // Efek untuk menutup dropdown jika klik di luar area component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/projects/${id}`, formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data project berhasil diperbarui.",
        showConfirmButton: false,
        timer: 2000,
      });
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
      text: "Data project yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/projects/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Project berhasil dihapus.",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate("/super-admin/project");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.response?.data?.message || "Gagal menghapus project.",
        });
      }
    }
  };

  // Handler untuk Assign Karyawan ke Project
  const handleAssignEmployee = async (e) => {
    e.preventDefault();
    if (!assignForm.employee_id || !assignForm.date) {
      Swal.fire("Perhatian", "Pilih karyawan dan tanggal penugasan.", "warning");
      return;
    }

    setAssigning(true);
    try {
      await api.post("/employee-project-schedules", {
        employee_id: assignForm.employee_id,
        project_id: id,
        date: assignForm.date
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Karyawan berhasil ditugaskan ke project ini.",
        showConfirmButton: false,
        timer: 1500,
      });

      // Refresh list anggota project
      const schedRes = await api.get(`/employee-project-schedules?project_id=${id}`);
      setProjectEmployees(schedRes.data.data || schedRes.data || []);
      
      // Reset form input & select2 state
      setAssignForm({ employee_id: "", date: new Date().toISOString().split("T")[0] });
      setEmpSearchQuery("");
      setSelectedEmpName("");
    } catch (error) {
      Swal.fire("Gagal", error.response?.data?.message || "Gagal menambahkan karyawan ke project.", "error");
    } finally {
      setAssigning(false);
    }
  };

  // Handler untuk Hapus Karyawan dari Project
  const handleRemoveEmployee = async (scheduleId) => {
    const result = await Swal.fire({
      title: "Hapus Penugasan?",
      text: "Karyawan ini akan dikeluarkan dari jadwal penugasan project ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/employee-project-schedules/${scheduleId}`);
        Swal.fire({ icon: "success", title: "Terhapus!", showConfirmButton: false, timer: 1500 });
        
        const schedRes = await api.get(`/employee-project-schedules?project_id=${id}`);
        setProjectEmployees(schedRes.data.data || schedRes.data || []);
      } catch (error) {
        Swal.fire("Gagal", error.response?.data?.message || "Gagal menghapus penugasan.", "error");
      }
    }
  };

  // Filter daftar karyawan berdasarkan pencarian
  const filteredEmployees = allEmployees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name || ""}`.toLowerCase();
    const empNumber = (emp.employee_id_number || "").toLowerCase();
    const query = empSearchQuery.toLowerCase();
    return fullName.includes(query) || empNumber.includes(query);
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/super-admin/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <Link to="/super-admin/project" className="hover:text-primary transition-colors">
            Project
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Detail & Edit Project</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Detail & Edit Project
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola informasi geolokasi dan penugasan anggota tim untuk project ini.
          </p>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center py-16">
          <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* BAGIAN 1: FORM EDIT PROJECT */}
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Icon icon="solar:folder-with-files-bold-duotone" className="text-primary" width="24" />
                Informasi Project (#{id})
              </h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Nama Project *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Pembangunan Gedung A"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Nama Klien *
                  </label>
                  <Input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    placeholder="Contoh: PT Maju Jaya"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Status Project *
                  </label>
                  <div className="relative w-full">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      width="16"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Latitude *
                  </label>
                  <Input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Contoh: -6.2088"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Longitude *
                  </label>
                  <Input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Contoh: 106.8456"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Radius (Meter) *
                  </label>
                  <Input
                    type="number"
                    name="radius_meter"
                    value={formData.radius_meter}
                    onChange={handleChange}
                    placeholder="Contoh: 50"
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
                  Hapus Project
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
                >
                  <Icon icon="solar:check-circle-bold" width="18" />
                  {loading ? "Memproses..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>

          {/* BAGIAN 2: MANAJEMEN ANGGOTA TIM / KARYAWAN PROJECT */}
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Icon icon="solar:users-group-rounded-bold-duotone" className="text-primary" width="24" />
                Anggota Tim / Karyawan di Project Ini
              </h3>
            </div>

            {/* Form Tambah Karyawan dengan Select2-like Custom Dropdown */}
            <form onSubmit={handleAssignEmployee} className="space-y-5 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                
                {/* Kolom Custom Select2 Karyawan */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Pilih Karyawan *
                  </label>
                  
                  {/* Kotak Input Utama yang berfungsi sebagai Trigger & Search */}
                  <div 
                    onClick={() => setIsDropdownOpen(true)}
                    className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full flex items-center justify-between cursor-pointer text-gray-800 dark:text-gray-200"
                  >
                    <span className={selectedEmpName ? "text-gray-800 dark:text-gray-200 font-medium truncate pr-2" : "text-gray-400"}>
                      {selectedEmpName || "-- Pilih atau Cari Karyawan --"}
                    </span>
                    <Icon icon="solar:alt-arrow-down-linear" className="text-gray-400 shrink-0" width="16" />
                  </div>

                  {/* Dropdown Menu & Search Box */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-[74px] z-50 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 space-y-2">
                      <div className="relative">
                        <Input
                          type="text"
                          value={empSearchQuery}
                          onChange={(e) => setEmpSearchQuery(e.target.value)}
                          placeholder="Ketik nama atau NIK..."
                          autoFocus
                          className="h-9 rounded-lg px-3 pl-8 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-xs w-full text-gray-800 dark:text-gray-200"
                        />
                        <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" />
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredEmployees.length === 0 ? (
                          <div className="text-center py-3 text-xs text-gray-400">Karyawan tidak ditemukan</div>
                        ) : (
                          filteredEmployees.map((emp) => (
                            <div
                              key={emp.id}
                              onClick={() => {
                                setAssignForm({ ...assignForm, employee_id: emp.id });
                                setSelectedEmpName(`${emp.first_name} ${emp.last_name || ""} (${emp.employee_id_number || "EMP"})`);
                                setIsDropdownOpen(false);
                                setEmpSearchQuery("");
                              }}
                              className="px-3 py-2 text-xs rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium"
                            >
                              <span>{emp.first_name} {emp.last_name || ""}</span>
                              <span className="font-mono text-gray-400">{emp.employee_id_number || "EMP"}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Kolom Tanggal Penugasan */}
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Tanggal Penugasan *
                  </label>
                  <Input
                    type="date"
                    value={assignForm.date}
                    onChange={(e) => setAssignForm({ ...assignForm, date: e.target.value })}
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200 font-mono text-xs"
                  />
                </div>

                {/* Kolom Tombol Aksi (Full-width di mobile, auto di desktop) */}
                <div>
                  <label className="block mb-2 font-medium text-sm opacity-0 select-none hidden sm:block">
                    Aksi
                  </label>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <Icon icon="solar:user-plus-bold" width="18" />
                    {assigning ? "Menambahkan..." : "Tambah ke Project"}
                  </button>
                </div>
              </div>
            </form>

            {/* Tabel List Anggota Project */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="h-11 px-4 font-bold text-gray-500">Nama Karyawan</th>
                    <th className="h-11 px-4 font-bold text-gray-500">Nomor Induk</th>
                    <th className="h-11 px-4 font-bold text-gray-500">Tanggal Penugasan</th>
                    <th className="h-11 px-4 font-bold text-gray-500 text-center w-[100px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {projectEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-400">
                        Belum ada karyawan yang ditugaskan ke project ini.
                      </td>
                    </tr>
                  ) : (
                    projectEmployees.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-background/50">
                        <td className="p-3 px-4 font-bold text-gray-800 dark:text-gray-200">
                          {item.Employee ? `${item.Employee.first_name} ${item.Employee.last_name || ""}` : "-"}
                        </td>
                        <td className="p-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {item.Employee?.employee_id_number || "-"}
                        </td>
                        <td className="p-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {item.date}
                        </td>
                        <td className="p-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveEmployee(item.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Hapus dari Project"
                          >
                            <Icon icon="solar:trash-bin-trash-bold" width="18" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}