import { useState, useEffect } from "react";
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

  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);
  const [projects, setProjects] = useState([]); // State untuk menampung data riwayat proyek

  const [formData, setFormData] = useState({
    company_id: "",
    branch_id: "",
    department_id: "",
    job_position_id: "",
    employee_id_number: "",
    national_id_number: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "Employee",
    phone: "",
    gender: "Male",
    marital_status: "Single",
    tax_status: "TK/0",
    join_date: "",
    status: "Active",
  });

  useEffect(() => {
    const fetchMasterAndDetail = async () => {
      setFetching(true);
      try {
        const [compRes, branchRes, deptRes, posRes, empRes] = await Promise.all(
          [
            api.get("/companies"),
            api.get("/branches"),
            api.get("/departments"),
            api.get("/job-positions"),
            api.get(`/employees/${id}`),
          ],
        );
        setCompanies(compRes.data.data || compRes.data || []);
        setBranches(branchRes.data.data || branchRes.data || []);
        setDepartments(deptRes.data.data || deptRes.data || []);
        setJobPositions(posRes.data.data || posRes.data || []);

        const data = empRes.data.data || empRes.data;
        setFormData({
          company_id: data.company_id || "",
          branch_id: data.branch_id || "",
          department_id: data.department_id || "",
          job_position_id: data.job_position_id || "",
          employee_id_number: data.employee_id_number || "",
          national_id_number: data.national_id_number || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          password: "", // Kosongkan password saat edit kecuali diubah
          role: data.role || "Employee",
          phone: data.phone || "",
          gender: data.gender || "Male",
          marital_status: data.marital_status || "Single",
          tax_status: data.tax_status || "TK/0",
          join_date: data.join_date ? data.join_date.split("T")[0] : "",
          status: data.status || "Active",
        });

        // Tangkap data projects dari response backend
        setProjects(data.Projects || data.projects || []);
      } catch (error) {
        console.error(error);
        Swal.fire("Gagal", "Gagal memuat data karyawan.", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchMasterAndDetail();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      await api.put(`/employees/${id}`, payload);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data karyawan berhasil diperbarui.",
        showConfirmButton: false,
        timer: 2000,
      });
      navigate("/hr/employee");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data karyawan yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/employees/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Karyawan berhasil dihapus.",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate("/hr/employee");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.response?.data?.message || "Gagal menghapus karyawan.",
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/hr/dashboard"
            className="hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <Link
            to="/hr/employee"
            className="hover:text-primary transition-colors"
          >
            Karyawan
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            Detail & Edit Karyawan
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Detail & Edit Karyawan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola informasi profil, jabatan, atau hapus data karyawan ini.
          </p>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center py-16">
          <Icon
            icon="line-md:loading-twotone-loop"
            width="40"
            className="text-primary"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card Utama: Form Edit Karyawan */}
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Icon
                  icon="solar:users-group-two-rounded-bold-duotone"
                  className="text-primary"
                  width="24"
                />
                Formulir Karyawan (#{id})
              </h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              {/* Baris 1: Nama Depan, Nama Belakang, NIK Karyawan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Nama Depan (First Name) *
                  </label>
                  <Input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Contoh: Budi"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Nama Belakang (Last Name)
                  </label>
                  <Input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Contoh: Santoso"
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    NIK Karyawan (Employee ID) *
                  </label>
                  <Input
                    type="text"
                    name="employee_id_number"
                    value={formData.employee_id_number}
                    onChange={handleChange}
                    placeholder="Contoh: EMP-001"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Baris 2: NIK KTP, Email, Password */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    No. KTP / NIK Nasional *
                  </label>
                  <Input
                    type="text"
                    name="national_id_number"
                    value={formData.national_id_number}
                    onChange={handleChange}
                    placeholder="Contoh: 3201................"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Email Karyawan *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="budi@company.com"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Password Baru (Opsional)
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak diubah"
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Baris 3: Role, Phone, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Role Akses *
                  </label>
                  <div className="relative w-full">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Super Admin">Super Admin</option>
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
                    No. Telepon / WhatsApp *
                  </label>
                  <Input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="081234567890"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Jenis Kelamin (Gender) *
                  </label>
                  <div className="relative w-full">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                    >
                      <option value="Male">Laki-laki (Male)</option>
                      <option value="Female">Perempuan (Female)</option>
                    </select>
                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      width="16"
                    />
                  </div>
                </div>
              </div>

              {/* Baris 4: Marital Status, Tax Status, Join Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Status Pernikahan *
                  </label>
                  <div className="relative w-full">
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleChange}
                      required
                      className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Menikah (Married)</option>
                      <option value="Divorced">Cerai (Divorced)</option>
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
                    Status Pajak (Tax Status) *
                  </label>
                  <Input
                    type="text"
                    name="tax_status"
                    value={formData.tax_status}
                    onChange={handleChange}
                    placeholder="Contoh: TK/0, K/1"
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Tanggal Bergabung (Join Date) *
                  </label>
                  <Input
                    type="date"
                    name="join_date"
                    value={formData.join_date}
                    onChange={handleChange}
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Baris 5: Perusahaan, Cabang, Departemen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Perusahaan *
                  </label>
                  <div className="relative w-full">
                    <select
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleChange}
                      required
                      className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                    >
                      <option value="">-- Pilih Perusahaan --</option>
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
                    Cabang *
                  </label>
                  <div className="relative w-full">
                    <select
                      name="branch_id"
                      value={formData.branch_id}
                      onChange={handleChange}
                      required
                      className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                    >
                      <option value="">-- Pilih Cabang --</option>
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
                    Departemen *
                  </label>
                  <div className="relative w-full">
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      required
                      className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                    >
                      <option value="">-- Pilih Departemen --</option>
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
              </div>

              {/* Baris 6: Jabatan & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Jabatan (Job Position) *
                  </label>
                  <div className="relative w-full">
                    <select
                      name="job_position_id"
                      value={formData.job_position_id}
                      onChange={handleChange}
                      required
                      className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                    >
                      <option value="">-- Pilih Jabatan --</option>
                      {jobPositions.map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.title} ({pos.level})
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
                    Status Karyawan *
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

          {/* Card Tambahan: Penugasan & Riwayat Proyek */}
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Icon
                  icon="solar:clipboard-text-bold-duotone"
                  className="text-primary"
                  width="24"
                />
                Penugasan & Riwayat Proyek
              </h3>
              <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary font-semibold rounded-lg">
                {projects.length} Proyek Total
              </span>
            </div>

            {projects && projects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="h-10 px-4 font-bold text-gray-500 dark:text-gray-400">
                        Nama Proyek
                      </th>
                      <th className="h-10 px-4 font-bold text-gray-500 dark:text-gray-400">
                        Peran di Proyek
                      </th>
                      <th className="h-10 px-4 font-bold text-gray-500 dark:text-gray-400">
                        Lokasi
                      </th>
                      <th className="h-10 px-4 font-bold text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {projects.map((project, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-background/50"
                      >
                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                          {project.name || project.title}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">
                          {project.EmployeeProjects?.role_in_project ||
                            project.role ||
                            "Anggota Tim"}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">
                          {project.location || "-"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                              project.status === "Ongoing" ||
                              project.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {project.status || "Ongoing"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <Icon
                  icon="solar:folder-error-linear"
                  width="40"
                  className="text-gray-400 mx-auto mb-2"
                />
                <h5 className="text-base font-medium text-gray-800 dark:text-white">
                  Belum Ada Penugasan Proyek
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Karyawan ini belum terdaftar ke dalam proyek aktif manapun.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
