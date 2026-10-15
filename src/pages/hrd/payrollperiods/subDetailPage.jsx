import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/button";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default function SubDetailPayslipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payslip, setPayslip] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/payroll/payslips/${id}`);
        const data = res.data.data || res.data;
        setPayslip(data);
      } catch (error) {
        console.error("Gagal memuat detail slip gaji:", error);
        Swal.fire("Gagal", "Gagal memuat rincian slip gaji dari server.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-24">
          <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!payslip) {
    return (
      <DashboardLayout>
        <div className="text-center py-24 text-gray-500">Data slip gaji tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  const emp = payslip.Employee || {};
  const empName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
  const slipStatus = payslip.status || "Unpaid";
  const dailyBreakdown = payslip.daily_breakdown || [];

  let badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
  if (slipStatus.toLowerCase() === "paid") {
    badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/hr/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <Link to="/hr/payroll-periods" className="hover:text-primary transition-colors">Periode Penggajian</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Rincian Slip Gaji</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Rincian Slip Gaji Karyawan</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Informasi lengkap komponen gaji dan rincian kehadiran harian.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="h-10 px-6 rounded-xl border-gray-200 dark:border-gray-700"
          >
            Kembali
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profil Karyawan & Status */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Icon icon="solar:user-bold-duotone" className="text-primary" width="24" />
              Profil Karyawan (#{emp.id || "-"})
            </h3>
            <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${badgeColor}`}>
              {slipStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Nama Lengkap</label>
              <div className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 flex items-center text-sm font-bold">
                {empName}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Nomor Induk Karyawan (NIK)</label>
              <div className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 flex items-center text-sm font-mono">
                {emp.employee_id_number || "-"}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Jabatan & Divisi</label>
              <div className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 flex items-center text-sm">
                {emp.JobPosition?.title || "Staff"} • {emp.Department?.name || "Divisi Umum"}
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Komponen Pendapatan & Potongan */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Icon icon="solar:wallet-money-bold-duotone" className="text-primary" width="24" />
              Ringkasan Komponen Gaji
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Gaji Pokok</label>
              <div className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 flex items-center text-sm font-mono font-bold">
                Rp {Number(payslip.basic_salary || 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Total Tunjangan</label>
              <div className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-emerald-600 flex items-center text-sm font-mono font-bold">
                + Rp {Number(payslip.total_allowance || 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Total Lembur</label>
              <div className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-primary flex items-center text-sm font-mono font-bold">
                + Rp {Number(payslip.total_overtime || 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Total Potongan</label>
              <div className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-rose-600 flex items-center text-sm font-mono font-bold">
                - Rp {Number(payslip.total_deduction || 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Gaji Bersih (Net Salary)</label>
              <div className="h-10 px-3 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center text-base font-mono font-extrabold">
                Rp {Number(payslip.net_salary || 0).toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Rincian Kehadiran & Lembur Harian */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Icon icon="solar:calendar-mark-bold-duotone" className="text-primary" width="24" />
              Rincian Kehadiran & Lembur Per Hari
            </h3>
          </div>

          {dailyBreakdown.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Tidak ada catatan absensi atau lembur harian pada periode ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] caption-bottom text-sm text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                  <tr>
                    <th className="h-12 px-4 font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Tanggal</th>
                    <th className="h-12 px-4 font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Shift</th>
                    <th className="h-12 px-4 font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Jam Masuk / Keluar</th>
                    <th className="h-12 px-4 font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                    <th className="h-12 px-4 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Lembur (Jam)</th>
                    <th className="h-12 px-4 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Nominal Lembur</th>
                    <th className="h-12 px-4 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Potongan Telat</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900">
                  {dailyBreakdown.map((row, idx) => {
                    // Membersihkan teks di dalam kurung siku [...] dari status
                    const rawStatus = row.status || 'Hadir';
                    const cleanStatus = rawStatus.replace(/\[.*?\]/g, '').trim();

                    return (
                      <tr key={idx} className="border-b border-gray-100 dark:border-defaultBorder/50 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors">
                        <td className="p-4 px-4 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="p-4 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {row.shift_name}
                        </td>
                        <td className="p-4 px-4 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {row.clock_in} - {row.clock_out}
                        </td>
                        <td className="p-4 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                            {cleanStatus} {row.late_hours > 0 ? `(Telat ${row.late_hours} jam)` : ''}
                          </span>
                        </td>
                        <td className="p-4 px-4 text-right font-mono text-primary whitespace-nowrap">
                          {row.overtime_hours > 0 ? `${row.overtime_hours} jam (${row.overtime_source})` : '-'}
                        </td>
                        <td className="p-4 px-4 text-right font-mono text-emerald-600 whitespace-nowrap">
                          {row.overtime_amount > 0 ? `+ Rp ${row.overtime_amount.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="p-4 px-4 text-right font-mono text-rose-600 whitespace-nowrap">
                          {row.late_amount > 0 ? `- Rp ${row.late_amount.toLocaleString('id-ID')}` : '-'}
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
    </DashboardLayout>
  );
}