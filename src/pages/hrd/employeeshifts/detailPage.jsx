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

  const [formData, setFormData] = useState({
    name: "",
    clock_in_time: "",
    clock_out_time: "",
    late_tolerance: ""
  });

  useEffect(() => {
    const fetchDetail = async () => {
      setFetching(true);
      try {
        const res = await api.get(`/shifts/${id}`);
        const data = res.data.data || res.data;
        setFormData({
          name: data.name || "",
          clock_in_time: data.clock_in_time || "",
          clock_out_time: data.clock_out_time || "",
          late_tolerance: data.late_tolerance || ""
        });
      } catch (error) {
        console.error(error);
        Swal.fire("Gagal", "Gagal memuat data shift.", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/shifts/${id}`, formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data shift berhasil diperbarui.",
        showConfirmButton: false,
        timer: 2000,
      });
      navigate("/hr/shift");
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
      text: "Data shift yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/shifts/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Shift berhasil dihapus.",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate("/hr/shift");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.response?.data?.message || "Gagal menghapus shift.",
        });
      }
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
          <Link to="/hr/shift" className="hover:text-primary transition-colors">
            Shift
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Detail & Edit Shift</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Detail & Edit Shift
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola informasi jam kerja atau hapus data shift ini.
          </p>
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
              Formulir Shift (#{id})
            </h3>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Baris 1: Nama Shift, Jam Masuk, Jam Pulang (3 Kolom) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                  Nama Shift *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Shift Pagi"
                  required
                  className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                  Jam Masuk (Clock In) *
                </label>
                <Input
                  type="time"
                  name="clock_in_time"
                  value={formData.clock_in_time}
                  onChange={handleChange}
                  required
                  className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                  Jam Pulang (Clock Out) *
                </label>
                <Input
                  type="time"
                  name="clock_out_time"
                  value={formData.clock_out_time}
                  onChange={handleChange}
                  required
                  className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono text-xs"
                />
              </div>
            </div>

            {/* Baris 2: Toleransi Terlambat */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                  Toleransi Terlambat (Menit) *
                </label>
                <Input
                  type="number"
                  name="late_tolerance"
                  value={formData.late_tolerance}
                  onChange={handleChange}
                  placeholder="Contoh: 15"
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