/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Icon } from "@iconify/react";
import api from "../../../services/api";

export default function IndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get("page")) || 1);
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (searchTerm) params.search = searchTerm;
    setSearchParams(params, { replace: true });
  }, [currentPage, searchTerm, setSearchParams]);

  const fetchData = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage,
      });
      if (search) params.append("search", search);

      const res = await api.get(`/shifts?${params.toString()}`);
      const responseData = res.data.data || res.data;

      setShifts(Array.isArray(responseData) ? responseData : []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.totalData || responseData.length || 0);
    } catch (error) {
      console.error("Gagal memuat data shift:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(currentPage, searchTerm);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData, currentPage, searchTerm]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/hr/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Icon icon="solar:alt-arrow-right-linear" width="14" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Shift</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Manajemen Shift Kerja
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Kelola daftar jam masuk, jam pulang, dan toleransi keterlambatan karyawan.
            </p>
          </div>
        </div>

        {/* Pencarian */}
        <div className="mt-2 flex flex-wrap items-center gap-3 w-full">
          <div className="w-full sm:w-80">
            <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Cari Shift
            </label>
            <Input
              type="text"
              placeholder="Cari nama shift..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl bg-gray-50 dark:bg-[#2a3547] border border-gray-200 dark:border-gray-700 w-full text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 min-w-0 w-full overflow-hidden">
        <div className="rounded-xl shadow-sm bg-white dark:bg-card w-full overflow-hidden flex flex-col min-w-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Icon icon="line-md:loading-twotone-loop" width="40" className="text-primary" />
            </div>
          ) : shifts.length === 0 ? (
            <div className="w-full overflow-x-auto p-7">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon icon="solar:clock-circle-bold-duotone" className="text-primary" width="24" />
                  Daftar Shift
                </h3>
                <Link to="/hr/shift/add">
                  <Button className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] justify-center">
                    <Icon icon="solar:add-circle-bold" width="20" />
                    Tambah Shift
                  </Button>
                </Link>
              </div>
              <div className="text-center py-16">
                <Icon icon="solar:clock-circle-line-duotone" width="48" className="text-gray-400 mx-auto mb-4" />
                <h5 className="text-lg font-medium text-gray-800 dark:text-white">Belum Ada Shift</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tambahkan shift kerja baru untuk memulai.</p>
              </div>
            </div>
          ) : (
            <div className="w-full py-7 overflow-hidden flex flex-col min-w-0">
              <div className="px-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Icon icon="solar:clock-circle-bold-duotone" className="text-primary" width="24" />
                  Daftar Shift
                </h3>
                <Link to="/hr/shift/add">
                  <Button className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] justify-center">
                    <Icon icon="solar:add-circle-bold" width="20" />
                    Tambah Shift
                  </Button>
                </Link>
              </div>

              <div className="px-7 w-full mt-4 overflow-x-auto">
                <table className="w-full min-w-[800px] caption-bottom text-sm text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-defaultBorder">
                    <tr>
                      <th className="h-12 px-6 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[60px]">No</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Nama Shift</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Jam Masuk</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Jam Pulang</th>
                      <th className="h-12 px-4 text-left font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Toleransi Terlambat</th>
                      <th className="h-12 px-6 text-right font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap w-[100px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {shifts.map((shift, index) => (
                      <tr key={shift.id || index} className="border-b border-gray-100 dark:border-defaultBorder/50 hover:bg-gray-50 dark:hover:bg-background/50 transition-colors">
                        <td className="p-4 px-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-4 px-4 font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {shift.name}
                        </td>
                        <td className="p-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap font-mono text-xs">
                          {shift.clock_in_time || "-"}
                        </td>
                        <td className="p-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap font-mono text-xs">
                          {shift.clock_out_time || "-"}
                        </td>
                        <td className="p-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {shift.late_tolerance !== undefined ? `${shift.late_tolerance} Menit` : "-"}
                        </td>
                        <td className="p-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/hr/shift/detail/${shift.id}`}>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && shifts.length > 0 && (
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