import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default function AddPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    latitude: "",
    longitude: "",
    radius_meter: "",
    status: "Active"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/projects", formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Project baru berhasil ditambahkan.",
        showConfirmButton: false,
        timer: 2000,
      });
      navigate("/hr/project");
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
          <Link to="/hr/project" className="hover:text-primary transition-colors">
            Project
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Tambah Project</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Tambah Project Baru
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Daftarkan entitas project dan titik geolokasi operasional.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Icon icon="solar:folder-with-files-bold-duotone" className="text-primary" width="24" />
            Formulir Tambah Project
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Baris 1: Nama Project, Nama Klien, Status (3 Kolom) */}
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

          {/* Baris 2: Latitude, Longitude, Radius Meter (3 Kolom) */}
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

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
            >
              <Icon icon="solar:check-circle-bold" width="18" />
              {loading ? "Memproses..." : "Simpan Project"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}