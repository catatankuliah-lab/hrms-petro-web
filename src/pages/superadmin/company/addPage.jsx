import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default function AddPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (id) {
      const fetchCompanyDetail = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/companies/${id}`);
          const data = res.data.data || res.data;
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || ""
          });
        } catch (error) {
          console.error("Error fetching company detail:", error);
          Swal.fire("Gagal", "Gagal memuat data perusahaan untuk diedit.", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchCompanyDetail();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.put(`/companies/${id}`, formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data perusahaan berhasil diperbarui.",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        await api.post("/companies", formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Perusahaan baru berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 2000,
        });
      }
      navigate("/super-admin/company");
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
          <Link to="/super-admin/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <Link to="/super-admin/company" className="hover:text-primary transition-colors">
            Perusahaan
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            {id ? "Edit Perusahaan" : "Tambah Perusahaan"}
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {id ? "Edit Data Perusahaan" : "Tambah Perusahaan Baru"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {id ? "Perbarui informasi entitas perusahaan." : "Daftarkan entitas perusahaan baru ke dalam sistem."}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Icon icon="solar:buildings-bold-duotone" className="text-primary" width="24" />
            {id ? "Formulir Edit Perusahaan" : "Formulir Tambah Perusahaan"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Nama Perusahaan *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: PT Petro Pacific Indonesia"
              required
              className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Email Resmi
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hr@petropacific.com"
                className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                No Telepon
              </label>
              <Input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="021-xxxxxxx"
                className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Alamat Lengkap
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              placeholder="Masukkan alamat kantor perusahaan..."
              className="w-full rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm p-3 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
            ></textarea>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
            >
              <Icon icon="solar:check-circle-bold" width="18" />
              {loading ? "Memproses..." : "Simpan Perusahaan"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}