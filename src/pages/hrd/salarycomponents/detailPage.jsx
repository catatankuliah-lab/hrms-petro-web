import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default function DetailSalaryComponentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    type: "Earning",
    is_taxable: false
  });

  useEffect(() => {
    const fetchDetail = async () => {
      setFetching(true);
      try {
        // Disesuaikan ke /salary-management/components/:id
        const res = await api.get(`/salary-management/components/${id}`);
        const data = res.data.data || res.data;
        setFormData({
          name: data.name || "",
          type: data.type || "Earning",
          is_taxable: data.is_taxable ?? false
        });
      } catch (error) {
        console.error("Gagal memuat detail komponen gaji:", error);
        Swal.fire("Gagal", "Gagal memuat data komponen gaji dari server.", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      Swal.fire({ icon: "warning", title: "Perhatian", text: "Nama komponen gaji wajib diisi!" });
      return;
    }

    setLoading(true);
    try {
      // Disesuaikan ke /salary-management/components/:id
      await api.put(`/salary-management/components/${id}`, formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Komponen gaji berhasil diperbarui.",
        showConfirmButton: false,
        timer: 2000,
      });
      navigate("/hr/salary-components");
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
      text: "Komponen gaji yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        // Disesuaikan ke /salary-management/components/:id
        await api.delete(`/salary-management/components/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Komponen gaji berhasil dihapus.",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate("/hr/salary-components");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.response?.data?.message || "Gagal menghapus komponen gaji.",
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
          <Link to="/hr/salary-components" className="hover:text-primary transition-colors">Komponen Gaji</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Detail & Edit Komponen</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detail & Edit Komponen Gaji</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Perbarui informasi atau hapus komponen pendapatan/potongan.</p>
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
              <Icon icon="solar:wallet-money-bold-duotone" className="text-primary" width="24" />
              Formulir Komponen Gaji (#{id})
            </h3>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Nama Komponen *</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Tunjangan Transport"
                  required
                  className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Tipe Komponen *</label>
                <div className="relative w-full">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                  >
                    <option value="Earning">Earning (Pendapatan)</option>
                    <option value="Deduction">Deduction (Potongan)</option>
                  </select>
                  <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Status Pajak (PPh 21)</label>
                <div className="relative w-full">
                  <select
                    name="is_taxable"
                    value={formData.is_taxable.toString()}
                    onChange={(e) => setFormData({ ...formData, is_taxable: e.target.value === "true" })}
                    required
                    className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                  >
                    <option value="false">Tidak Kena Pajak (Non-Taxable)</option>
                    <option value="true">Kena Pajak (Taxable)</option>
                  </select>
                  <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" />
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
                {loading ? "Memproses..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}