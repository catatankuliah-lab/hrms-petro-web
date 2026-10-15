import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default function DetailEmployeeSalaryPage() {
  const params = useParams();
  const employee_id = params.employee_id || params.id; 

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [employee, setEmployee] = useState(null);
  const [components, setComponents] = useState([]);
  const [assignedSalaries, setAssignedSalaries] = useState([]);

  const [formData, setFormData] = useState({
    salary_component_id: "",
    amount: ""
  });

  const [compSearch, setCompSearch] = useState("");
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [selectedCompName, setSelectedCompName] = useState("");
  const compRef = useRef(null);

  useEffect(() => {
    if (!employee_id) return;

    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) setLoading(true);

      try {
        const compRes = await api.get("/salary-management/components");
        const compData = compRes.data.data || compRes.data;
        if (isMounted) {
          setComponents(Array.isArray(compData) ? compData : (compData.data || []));
        }
      } catch (error) {
        console.error("Gagal memuat komponen gaji:", error);
      }

      try {
        const salaryRes = await api.get(`/salary-management/employee-salaries/${employee_id}`);
        if (isMounted) {
          setAssignedSalaries(salaryRes.data.data || []);
        }
      } catch (error) {
        console.error("Gagal memuat gaji karyawan:", error);
      }

      try {
        const empRes = await api.get(`/employees/${employee_id}`);
        if (isMounted) {
          setEmployee(empRes.data.data || empRes.data || null);
        }
      } catch (error) {
        console.error("Gagal memuat detail karyawan:", error);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [employee_id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (compRef.current && !compRef.current.contains(event.target)) setIsCompOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredComponents = components.filter((comp) => 
    comp.name.toLowerCase().includes(compSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.salary_component_id || !formData.amount) {
      Swal.fire({ icon: "warning", title: "Perhatian", text: "Komponen dan nominal gaji wajib diisi!" });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/salary-management/employee-salaries", {
        employee_id: employee_id,
        salary_component_id: formData.salary_component_id,
        amount: parseFloat(formData.amount)
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Komponen gaji karyawan berhasil disimpan.",
        showConfirmButton: false,
        timer: 1500,
      });

      const salaryRes = await api.get(`/salary-management/employee-salaries/${employee_id}`);
      setAssignedSalaries(salaryRes.data.data || []);

      setFormData({ salary_component_id: "", amount: "" });
      setSelectedCompName("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.response?.data?.message || "Gagal menyimpan data gaji.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/hr/esalaries" className="hover:text-primary transition-colors">Gaji Karyawan</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Pengaturan Gaji</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Pengaturan Gaji: {employee ? `${employee.first_name} ${employee.last_name || ""}` : "Memuat..."}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Atur komponen pendapatan dan potongan tetap untuk karyawan ini.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Form Tambah / Update Komponen Gaji */}
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Icon icon="solar:wallet-money-bold-duotone" className="text-primary" width="22" />
              Tambah / Ubah Komponen Gaji Karyawan
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              
              {/* Searchable Select Komponen Gaji */}
              <div className="relative" ref={compRef}>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Komponen Gaji *</label>
                <div 
                  onClick={() => setIsCompOpen(true)}
                  className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full flex items-center justify-between cursor-pointer text-gray-800 dark:text-gray-200"
                >
                  <span className={selectedCompName ? "text-gray-800 dark:text-gray-200 font-medium truncate pr-2" : "text-gray-400"}>
                    {selectedCompName || "-- Pilih Komponen --"}
                  </span>
                  <Icon icon="solar:alt-arrow-down-linear" className="text-gray-400 shrink-0" width="16" />
                </div>

                {isCompOpen && (
                  <div className="absolute left-0 right-0 top-[74px] z-50 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 space-y-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={compSearch}
                        onChange={(e) => setCompSearch(e.target.value)}
                        placeholder="Cari komponen..."
                        autoFocus
                        className="h-9 rounded-lg px-3 pl-8 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-xs w-full text-gray-800 dark:text-gray-200"
                      />
                      <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredComponents.length === 0 ? (
                        <div className="text-center py-3 text-xs text-gray-400">Komponen tidak ditemukan</div>
                      ) : (
                        filteredComponents.map((comp) => (
                          <div
                            key={comp.id}
                            onClick={() => {
                              setFormData({ ...formData, salary_component_id: comp.id });
                              setSelectedCompName(`${comp.name} (${comp.type})`);
                              setIsCompOpen(false);
                              setCompSearch("");
                            }}
                            className="px-3 py-2 text-xs rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium"
                          >
                            <span>{comp.name}</span>
                            <span className="font-mono text-gray-400 text-[10px]">{comp.type}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Nominal (Rp) *</label>
                <Input
                  type="number"
                  placeholder="Contoh: 5000000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <Button type="submit" disabled={submitting} className="h-10 w-full flex items-center justify-center gap-2">
                  <Icon icon="solar:check-circle-bold" width="18" />
                  {submitting ? "Menyimpan..." : "Simpan / Perbarui"}
                </Button>
              </div>

            </form>
          </div>

          {/* Tabel Daftar Komponen Gaji Aktif */}
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-50 dark:border-none p-6 w-full">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Daftar Komponen Gaji Aktif Karyawan</h3>
            
            {assignedSalaries.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Belum ada komponen gaji yang diatur untuk karyawan ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                    <tr>
                      <th className="h-10 px-4 font-bold text-gray-500 w-[60px]">No</th>
                      <th className="h-10 px-4 font-bold text-gray-500">Nama Komponen</th>
                      <th className="h-10 px-4 font-bold text-gray-500">Tipe</th>
                      <th className="h-10 px-4 font-bold text-gray-500 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedSalaries.map((item, index) => (
                      <tr key={item.id || index} className="border-b border-gray-100 dark:border-defaultBorder/50">
                        <td className="p-3 px-4 font-medium">{index + 1}</td>
                        <td className="p-3 px-4 font-bold text-gray-800 dark:text-gray-200">
                          {item.SalaryComponent?.name || "-"}
                        </td>
                        <td className="p-3 px-4">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${item.SalaryComponent?.type === 'Earning' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                            {item.SalaryComponent?.type || "-"}
                          </span>
                        </td>
                        <td className="p-3 px-4 font-mono font-semibold text-right text-gray-700 dark:text-gray-300">
                          Rp {Number(item.amount).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
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