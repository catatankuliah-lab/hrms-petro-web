import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default function AddPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    company_id: "",
    name: ""
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/companies");
        setCompanies(res.data.data || res.data || []);
      } catch (error) {
        console.error("Gagal memuat daftar perusahaan:", error);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/departments", formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Departemen baru berhasil ditambahkan.",
        showConfirmButton: false,
        timer: 2000,
      });
      navigate("/hr/department");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/hr/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <Link to="/hr/department" className="hover:text-primary transition-colors">
            Departemen
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Tambah Departemen</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Tambah Departemen Baru
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Daftarkan divisi atau departemen baru ke dalam sistem.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="text-primary" width="24" />
            Formulir Tambah Departemen
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Baris 1: Pilih Perusahaan & Nama Departemen (Dibagi 2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Pilih Perusahaan *
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
                Nama Departemen *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Human Resources (HR)"
                required
                className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
            >
              <Icon icon="solar:check-circle-bold" width="18" />
              {loading ? "Memproses..." : "Simpan Departemen"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}