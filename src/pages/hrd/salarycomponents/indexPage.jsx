/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";

export default function IndexSalaryComponentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [taxFilter, setTaxFilter] = useState(searchParams.get("is_taxable") || "");

  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get("page")) || 1);
    setSearchTerm(searchParams.get("search") || "");
    setTypeFilter(searchParams.get("type") || "");
    setTaxFilter(searchParams.get("is_taxable") || "");
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (searchTerm) params.search = searchTerm;
    if (typeFilter) params.type = typeFilter;
    if (taxFilter !== "") params.is_taxable = taxFilter;
    setSearchParams(params, { replace: true });
  }, [currentPage, searchTerm, typeFilter, taxFilter, setSearchParams]);

  const fetchData = useCallback(async (page = 1, search = "", type = "", taxable = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: itemsPerPage });
      if (search) params.append("search", search);
      if (type) params.append("type", type);
      if (taxable !== "") params.append("is_taxable", taxable);

      // Endpoint disesuaikan ke /salary-management/components[cite: 2]
      const res = await api.get(`/salary-management/components?${params.toString()}`);
      const responseData = res.data.data || res.data;

      setComponents(Array.isArray(responseData) ? responseData : (responseData.data || []));
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.totalData || responseData.length || 0);
    } catch (error) {
      console.error("Gagal memuat komponen gaji:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(currentPage, searchTerm, typeFilter, taxFilter);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData, currentPage, searchTerm, typeFilter, taxFilter]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/hr/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Komponen Gaji</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Komponen Gaji</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola daftar komponen pendapatan dan potongan gaji karyawan.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Cari Komponen</label>
            <Input
              type="text"
              placeholder="Cari nama komponen..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Filter Tipe</label>
            <div className="relative w-full">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">Semua Tipe</option>
                <option value="Earning">Earning (Pendapatan)</option>
                <option value="Deduction">Deduction (Potongan)</option>
              </select>
              <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Status Pajak</label>
            <div className="relative w-full">
              <select
                value={taxFilter}
                onChange={(e) => {
                  setTaxFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl px-3 bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 text-sm w-full appearance-none pr-8 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
              >
                <option value="">Semua Status</option>
                <option value="true">Kena Pajak (Taxable)</option>
                <option value="false">Tidak Kena Pajak</option>
              </select>
              <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 min-w-0 w-full overflow-hidden">
        <div className="rounded-xl shadow-sm bg-white dark:bg-card w-full overflow-hidden flex flex-col min-w-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
            </div>
          ) : components.length === 0 ? (
            <div className="w-full overflow-x-auto p-7">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon icon="solar:wallet-money-bold-duotone" className="text-primary" width="24" />
                  Daftar Komponen Gaji
                </h3>
                <Link to="/hr/salary-components/add">
                  <Button className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] justify-center">
                    <Icon icon="solar:add-circle-bold" width="20" />
                    Tambah Komponen
                  </Button>
                </Link>
              </div>
              <div className="text-center py-16">
                <Icon icon="solar:wallet-money-line-duotone" width="48" className="text-gray-400 mx-auto mb-4" />
                <h5 className="text-lg font-medium text-gray-800 dark:text-white">Belum Ada Komponen Gaji</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tambahkan komponen gaji baru untuk mulai menghitung payroll.</p>
              </div>
            </div>
          ) : (
            <div className="w-full py-7 overflow-hidden flex flex-col min-w-0">
              <div className="px-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon icon="solar:wallet-money-bold-duotone" className="text-primary" width="24" />
                  Daftar Komponen Gaji
                </h3>
                <Link to="/hr/salary-components/add">
                  <Button className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] justify-center">
                    <Icon icon="solar:add-circle-bold" width="20" />
                    Tambah Komponen
                  </Button>
                </Link>
              </div>

              <div className="px-7 w-full mt-4 overflow-x-auto">
                <table className="w-full min-w-[800px] caption-bottom text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                    <tr>
                      <th className="h-12 px-6 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[60px]">No</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Nama Komponen</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Tipe</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Status Pajak</th>
                      <th className="h-12 px-6 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[100px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {components.map((item, index) => {
                      const isEarning = item.type === "Earning";
                      const typeBadge = isEarning 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-600 border-rose-500/20";
                      
                      const taxBadge = item.is_taxable 
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20" 
                        : "bg-gray-500/10 text-gray-500 border-gray-500/20";

                      return (
                        <tr key={item.id || index} className="border-b border-gray-100 dark:border-defaultBorder/50 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors">
                          <td className="p-4 px-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-4 px-4 font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {item.name}
                          </td>
                          <td className="p-4 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${typeBadge}`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="p-4 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${taxBadge}`}>
                              {item.is_taxable ? "Taxable (Kena Pajak)" : "Non-Taxable"}
                            </span>
                          </td>
                          <td className="p-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link to={`/hr/salary-components/detail/${item.id}`}>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 text-primary hover:bg-primary/10 rounded-md"
                                  title="Detail & Edit"
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
            </div>
          )}

          {!loading && components.length > 0 && (
            <div className="flex justify-between items-center p-7 border-t border-gray-100 dark:border-defaultBorder/50">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
              </span>
              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                variant="outline"
                size="sm"
              >
                Berikutnya
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}