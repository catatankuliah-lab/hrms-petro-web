import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default function DetailPayrollPeriodPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    status: "Draft"
  });

  const [salarySlips, setSalarySlips] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const [detailRes, slipsRes] = await Promise.all([
          api.get(`/payroll/periods/${id}`),
          api.get(`/payroll/periods/${id}/payslips`).catch(() => api.get(`/salary-slips`, { params: { payroll_period_id: id } }))
        ]);

        const data = detailRes.data.data || detailRes.data;
        setFormData({
          name: data.name || "",
          start_date: data.start_date || "",
          end_date: data.end_date || "",
          status: data.status || "Draft"
        });

        const slipsData = slipsRes.data.data || slipsRes.data;
        setSalarySlips(Array.isArray(slipsData) ? slipsData : (slipsData.data || []));
      } catch (error) {
        console.error("Gagal memuat detail periode:", error);
        Swal.fire("Gagal", "Gagal memuat data periode dari server.", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date || !formData.end_date) {
      Swal.fire({ icon: "warning", title: "Perhatian", text: "Nama dan rentang tanggal wajib diisi!" });
      return;
    }

    setLoading(true);
    try {
      await api.put(`/payroll/periods/${id}`, formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data periode berhasil diperbarui.",
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
      text: "Periode penggajian yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/payroll/periods/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Periode payroll berhasil dihapus.",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate("/super-admin/payroll-periods");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.response?.data?.message || "Gagal menghapus periode.",
        });
      }
    }
  };

  const handleGeneratePayslips = async () => {
    const result = await Swal.fire({
      title: "Generate Slip Gaji?",
      text: "Sistem akan menghitung gaji pokok, tunjangan, lembur (resmi & bablas shift), dan potongan seluruh karyawan aktif untuk periode ini.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Generate!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setGenerating(true);
      try {
        const res = await api.post(`/payroll/periods/${id}/generate`);
        const slipsData = res.data.data || res.data;
        setSalarySlips(Array.isArray(slipsData) ? slipsData : (slipsData.data || []));
        
        Swal.fire("Berhasil!", "Slip gaji berhasil digenerate otomatis oleh sistem.", "success");
      } catch (error) {
        Swal.fire("Gagal!", error.response?.data?.message || "Gagal generate slip gaji.", "error");
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get(`/payroll/periods/${id}/export-excel`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Slip-Gaji-Periode-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      Swal.fire("Informasi", "Endpoint download Excel di backend sedang disiapkan. Pastikan rute export sudah terdaftar jika ingin mengunduh file.", "info");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <Link to="/super-admin/payroll-periods" className="hover:text-primary transition-colors">Periode Penggajian</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Detail & Edit Periode</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detail & Edit Periode Penggajian</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola informasi periode dan pantau daftar slip gaji karyawan.</p>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center py-16">
          <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Form Update Periode */}
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Icon icon="solar:calendar-bold-duotone" className="text-primary" width="24" />
                Informasi Periode (#{id})
              </h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Nama Periode *</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Tanggal Mulai *</label>
                  <Input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Tanggal Selesai *</label>
                  <Input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Status Periode *</label>
                  <div className="relative w-full">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
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
                  Hapus Periode
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
                >
                  <Icon icon="solar:check-circle-bold" width="18" />
                  {loading ? "Memproses..." : "Perbarui Periode"}
                </button>
              </div>
            </form>
          </div>

          {/* Tabel Daftar Slip Gaji Karyawan */}
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800 gap-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Icon icon="solar:wallet-money-bold-duotone" className="text-primary" width="24" />
                Daftar Gaji & Slip Karyawan
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleGeneratePayslips}
                  disabled={generating}
                  className="h-10 px-6 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
                >
                  <Icon icon="solar:calculator-bold-duotone" width="18" />
                  {generating ? "Menghitung..." : "Generate Slip Gaji"}
                </button>

                {salarySlips.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadExcel}
                    className="h-10 px-6 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-500/30 font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-100 transition-all w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
                  >
                    <Icon icon="solar:file-excel-bold-duotone" width="18" />
                    Download Excel
                  </button>
                )}
              </div>
            </div>

            {salarySlips.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="solar:wallet-money-line-duotone" width="48" className="text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Belum ada data slip gaji yang digenerate untuk periode ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] caption-bottom text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                    <tr>
                      <th className="h-12 px-6 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[60px]">No</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Karyawan & NIK</th>
                      <th className="h-12 px-4 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Gaji Pokok</th>
                      <th className="h-12 px-4 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Tunjangan</th>
                      <th className="h-12 px-4 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Lembur</th>
                      <th className="h-12 px-4 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Potongan</th>
                      <th className="h-12 px-4 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Gaji Bersih (Net)</th>
                      <th className="h-12 px-4 text-center font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[100px]">Status</th>
                      <th className="h-12 px-6 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[100px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {salarySlips.map((item, index) => {
                      const empName = item.Employee 
                        ? `${item.Employee.first_name} ${item.Employee.last_name || ""}`.trim() 
                        : "-";
                      const empNik = item.Employee?.employee_id_number || "-";
                      const jobTitle = item.Employee?.JobPosition?.title || "Staff";
                      const deptName = item.Employee?.Department?.name || "Operasional";
                      const slipStatus = item.status || "Unpaid";
                      
                      let badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                      if (slipStatus.toLowerCase() === "paid") {
                        badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                      }

                      return (
                        <tr key={item.id || index} className="border-b border-gray-100 dark:border-defaultBorder/50 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors">
                          <td className="p-4 px-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {index + 1}
                          </td>
                          <td className="p-4 px-4 whitespace-nowrap">
                            <div className="font-bold text-gray-800 dark:text-gray-200">{empName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {jobTitle} • {deptName}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">NIK: {empNik}</div>
                          </td>
                          <td className="p-4 px-4 text-right font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Rp {Number(item.basic_salary).toLocaleString('id-ID')}
                          </td>
                          <td className="p-4 px-4 text-right font-mono text-emerald-600 whitespace-nowrap">
                            + Rp {Number(item.total_allowance).toLocaleString('id-ID')}
                          </td>
                          <td className="p-4 px-4 text-right font-mono text-primary whitespace-nowrap">
                            + Rp {Number(item.total_overtime || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="p-4 px-4 text-right font-mono text-rose-600 whitespace-nowrap">
                            - Rp {Number(item.total_deduction).toLocaleString('id-ID')}
                          </td>
                          <td className="p-4 px-4 text-right font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            Rp {Number(item.net_salary).toLocaleString('id-ID')}
                          </td>
                          <td className="p-4 px-4 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${badgeColor}`}>
                              {slipStatus}
                            </span>
                          </td>
                          <td className="p-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link to={`/super-admin/payroll-payslips/detail/${item.id}`}>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 text-primary hover:bg-primary/10 rounded-md"
                                  title="Rincian Slip Gaji Karyawan"
                                >
                                  <Icon icon="solar:eye-bold-duotone" width="16" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}