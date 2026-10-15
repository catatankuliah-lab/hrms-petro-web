import { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { AuthContext } from "../../../context/AuthContext";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import api from "../../../services/api";

export default function SuperAdminDashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalBranches: 0,
    totalDepartments: 0,
    totalProjects: 0,
    activeProjects: 0,
    pendingCashAdvances: 0,
    pendingOvertimes: 0,
    todayPresent: 0,
    todayLate: 0,
  });
  
  const [myAttendancesMap, setMyAttendancesMap] = useState({});
  const [myShiftsMap, setMyShiftsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [calendarDate, setCalendarDate] = useState(new Date());

  const [attendanceStatus, setAttendanceStatus] = useState("Belum Absen Hari Ini");
  const [todayAttendanceId, setTodayAttendanceId] = useState(null);
  const [todayProjectId, setTodayProjectId] = useState(null);
  const [todayShiftInfo, setTodayShiftInfo] = useState("Memuat jadwal shift...");
  const [todayProjectName, setTodayProjectName] = useState("Penugasan Operasional");
  const [loadingAbsen, setLoadingAbsen] = useState(false);

  const [attendanceActionType, setAttendanceActionType] = useState("clock-in");
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentCoords, setCurrentCoords] = useState({ lat: 0, lon: 0 });
  const [currentAddress, setCurrentAddress] = useState("Mengambil alamat lokasi...");
  const [logoImage, setLogoImage] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/images/logos/logopetropacific.png";
    img.onload = () => setLogoImage(img);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const currentUserId = user?.id || localStorage.getItem("user_id");

        const [empRes, branchRes, deptRes, projRes, caRes, otRes, attRes, shiftRes] = await Promise.all([
          api.get("/employees").catch(() => ({ data: { data: [] } })),
          api.get("/branches").catch(() => ({ data: { data: [] } })),
          api.get("/departments").catch(() => ({ data: { data: [] } })),
          api.get("/projects").catch(() => ({ data: { data: [] } })),
          api.get("/cash-advances?status=Pending").catch(() => ({ data: { data: [] } })),
          api.get("/overtimes?status=Pending").catch(() => ({ data: { data: [] } })),
          api.get("/attendances").catch(() => ({ data: { data: [] } })),
          api.get("/employee-shifts").catch(() => ({ data: { data: [] } })),
        ]);

        const projects = projRes.data.data || [];
        const activeProj = projects.filter(p => 
          p.status && (p.status.toLowerCase() === "active" || p.status.toLowerCase() === "ongoing")
        );

        const allAttendances = attRes.data.data || [];
        const todayAttendances = allAttendances.filter(a => a.date === todayStr);
        
        const presentCount = todayAttendances.length;
        const lateCount = todayAttendances.filter(a => a.status && a.status.toLowerCase().includes("late")).length;

        const userAttendances = allAttendances.filter(a => {
          const empId = a.employee_id || a.Employee?.id;
          return String(empId) === String(currentUserId);
        });
        const attMap = {};
        userAttendances.forEach(item => {
          attMap[item.date] = item;
        });
        setMyAttendancesMap(attMap);

        const allEmployeeShifts = shiftRes.data.data || [];
        const userShifts = allEmployeeShifts.filter(s => {
          const empId = s.employee_id || s.Employee?.id || s.raw_employee_id;
          return String(empId) === String(currentUserId) || String(s.Employee?.id) === String(currentUserId);
        });

        const shiftMap = {};
        userShifts.forEach(item => {
          shiftMap[item.date] = item;
        });
        setMyShiftsMap(shiftMap);

        const userTodayAtt = todayAttendances.find(a => {
          const empId = a.employee_id || a.Employee?.id;
          return String(empId) === String(currentUserId);
        });
        if (userTodayAtt) {
          setTodayAttendanceId(userTodayAtt.id);
          setTodayProjectId(userTodayAtt.project_id || userTodayAtt.Project?.id);
          setAttendanceStatus(userTodayAtt.clock_out ? "Sudah Clock Out" : "Sudah Clock In");
        }

        const myTodayShift = shiftMap[todayStr];
        if (myTodayShift && myTodayShift.Shift) {
          const shiftName = myTodayShift.Shift.name || "Shift Reguler";
          const clockIn = myTodayShift.Shift.clock_in_time || "08:00";
          const clockOut = myTodayShift.Shift.clock_out_time || "17:00";
          setTodayShiftInfo(`${shiftName} (${clockIn} - ${clockOut})`);
          
          const projName = myTodayShift.Project?.name || myTodayShift.project_name;
          if (projName) {
            setTodayProjectName(projName);
          }

          const projId = myTodayShift.project_id || myTodayShift.Project?.id || myTodayShift.raw_project_id;
          if (projId) {
            setTodayProjectId(projId);
          }
        } else {
          setTodayShiftInfo("Tidak ada jadwal shift / Libur");
        }

        setStats({
          totalEmployees: empRes.data.data?.length || 0,
          totalBranches: branchRes.data.data?.length || 0,
          totalDepartments: deptRes.data.data?.length || 0,
          totalProjects: projects.length,
          activeProjects: activeProj.length > 0 ? activeProj.length : projects.length,
          pendingCashAdvances: caRes.data.data?.length || 0,
          pendingOvertimes: otRes.data.data?.length || 0,
          todayPresent: presentCount,
          todayLate: lateCount,
        });
      } catch (error) {
        console.error(error);
        // Silent error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "";
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
      }
    } catch (e) {
      console.error(e);
    }
    if (timeStr.includes("T")) {
      const parts = timeStr.split("T")[1];
      return parts ? parts.slice(0, 5) : "";
    }
    if (timeStr.includes(" ")) {
      const parts = timeStr.split(" ")[1];
      return parts ? parts.slice(0, 5) : "";
    }
    return timeStr.slice(0, 5);
  };

  const handlePreviewAttendance = (attRecord) => {
    if (!attRecord) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://hrmsapi.petrolum.cloud/api';
    const serverBaseUrl = apiBase.replace('/api', '');
    
    const cleanInUrl = attRecord.selfie_in_url ? attRecord.selfie_in_url.replace(/^\/+/, '') : null;
    const cleanOutUrl = attRecord.selfie_out_url ? attRecord.selfie_out_url.replace(/^\/+/, '') : null;

    const selfieInUrl = cleanInUrl ? `${serverBaseUrl}/${cleanInUrl}` : null;
    const selfieOutUrl = cleanOutUrl ? `${serverBaseUrl}/${cleanOutUrl}` : null;

    Swal.fire({
      title: `<div style="font-size: 15px; font-weight: bold; padding-right: 25px; text-align: left;">Detail Absensi (${attRecord.date})</div>`,
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.5; color: #334155; max-height: 75vh; overflow-y: auto; padding-right: 4px;">
          <div style="background: #f8fafc; padding: 10px 12px; border-radius: 10px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 6px 0;"><b>Status:</b> <span style="color: ${attRecord.status?.toLowerCase().includes('late') ? '#d97706' : '#059669'}; font-weight: bold;">${attRecord.status || 'Hadir'}</span></p>
            <p style="margin: 0 0 6px 0;"><b>Clock In:</b> ${formatTimeDisplay(attRecord.clock_in)}</p>
            <p style="margin: 0;"><b>Clock Out:</b> ${attRecord.clock_out ? formatTimeDisplay(attRecord.clock_out) : 'Belum Clock Out'}</p>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${selfieInUrl ? `
              <div style="background: #0f172a; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
                <p style="font-weight: bold; margin: 0 0 6px 0; font-size: 12px; color: #cbd5e1;">📷 Foto Clock In (Masuk)</p>
                <img src="${selfieInUrl}" onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=Gagal+Muat';" style="width: 100%; max-height: 320px; object-fit: contain; border-radius: 8px; background: #000;" />
              </div>
            ` : ''}
            
            ${selfieOutUrl ? `
              <div style="background: #0f172a; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
                <p style="font-weight: bold; margin: 0 0 6px 0; font-size: 12px; color: #cbd5e1;">📷 Foto Clock Out (Pulang)</p>
                <img src="${selfieOutUrl}" onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=Gagal+Muat';" style="width: 100%; max-height: 320px; object-fit: contain; border-radius: 8px; background: #000;" />
              </div>
            ` : ''}
          </div>
        </div>
      `,
      width: 420,
      showConfirmButton: false,
      showCloseButton: true,
      closeButtonHtml: '&times;'
    });
  };

  const handleMainButtonAction = () => {
    if (attendanceStatus === "Belum Absen Hari Ini") {
      setAttendanceActionType("clock-in");
      initCameraAndGPS();
    } else if (attendanceStatus === "Sudah Clock In" && todayAttendanceId) {
      setAttendanceActionType("clock-out");
      initCameraAndGPS();
    }
  };

  const initCameraAndGPS = async () => {
    if (!navigator.geolocation) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Browser Anda tidak mendukung Geolocation.", showConfirmButton: false, timer: 2000 });
      return;
    }

    setShowCameraModal(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCurrentCoords({ lat, lon });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'id' }
          });
          const data = await res.json();
          if (data && data.display_name) {
            setCurrentAddress(data.display_name);
          } else {
            setCurrentAddress("Alamat tidak dapat ditemukan");
          }
        } catch (e) {
          console.error(e);
          setCurrentAddress("Gagal memuat alamat internet");
        }
      },
      () => {
        Swal.fire({ icon: "error", title: "Gagal GPS", text: "Gagal mendeteksi lokasi GPS. Pastikan izin lokasi aktif.", showConfirmButton: false, timer: 2000 });
        setShowCameraModal(false);
      },
      { enableHighAccuracy: true }
    );

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Kamera Gagal", text: "Tidak dapat mengakses kamera perangkat. Periksa izin kamera browser.", showConfirmButton: false, timer: 2000 });
      setShowCameraModal(false);
    }
  };

  const closeCameraModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCameraModal(false);
    setPreviewUrl(null);
  };

  const capturePhotoWithWatermark = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    if (logoImage) {
      const targetHeight = 55;
      const imgAspect = logoImage.width / logoImage.height;
      const targetWidth = targetHeight * imgAspect;
      ctx.drawImage(logoImage, 30, 30, targetWidth, targetHeight);
    }

    const employeeName = user?.nama || "Super Admin";
    const employeeRole = user?.role || "Super Admin";
    const timeNow = new Date().toLocaleString("id-ID", { dateStyle: "full", timeStyle: "medium" });

    const leftMargin = 30;
    const maxWidth = canvas.width - 60;

    ctx.font = "14px sans-serif";
    const addressWords = `🏠 ${currentAddress}`.split(" ");
    let addressLines = [];
    let currentLine = "";
    for (let i = 0; i < addressWords.length; i++) {
      const testLine = currentLine + addressWords[i] + " ";
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        addressLines.push(currentLine);
        currentLine = addressWords[i] + " ";
      } else {
        currentLine = testLine;
      }
    }
    addressLines.push(currentLine);

    let dynamicBoxHeight = 45 + 32 + 28 + 26 + 26 + (addressLines.length * 20) + 28 + 24 + 35;
    let boxY = canvas.height - dynamicBoxHeight;

    ctx.fillStyle = "rgba(15, 23, 42, 0.93)";
    ctx.fillRect(0, boxY, canvas.width, dynamicBoxHeight);

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(0, boxY, canvas.width, 6);

    let currentY = boxY + 60;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`👤 ${employeeName}`, leftMargin, currentY);
    currentY += 28;

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`💼 ${employeeRole}`, leftMargin, currentY);
    currentY += 28;

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`📌 ${todayProjectName}`, leftMargin, currentY);
    currentY += 26;

    ctx.fillStyle = "#34d399";
    ctx.font = "14px monospace";
    ctx.fillText(`📍 ${currentCoords.lat.toFixed(6)}, ${currentCoords.lon.toFixed(6)}`, leftMargin, currentY);
    currentY += 26;

    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#cbd5e1";
    for (let lineText of addressLines) {
      ctx.fillText(lineText, leftMargin, currentY);
      currentY += 20;
    }
    currentY += 4;

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`🕒 ${timeNow}`, leftMargin, currentY);
    currentY += 28;

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`HRMS PT Petro Pacific by Nana Supriatna (KalaituDev)`, leftMargin, currentY);

    const watermarkedImage = canvas.toDataURL("image/jpeg", 0.90);
    setPreviewUrl(watermarkedImage);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmitAttendance = async () => {
    if (!previewUrl) {
      Swal.fire({ icon: "warning", title: "Perhatian", text: "Silakan ambil foto terlebih dahulu!", showConfirmButton: false, timer: 1800 });
      return;
    }

    if (!todayProjectId) {
      Swal.fire({ icon: "error", title: "Gagal Absen", text: "ID Proyek untuk hari ini tidak ditemukan pada jadwal Anda.", showConfirmButton: false, timer: 2000 });
      return;
    }

    setLoadingAbsen(true);
    try {
      if (attendanceActionType === "clock-in") {
        const payload = {
          project_id: todayProjectId,
          latitude: currentCoords.lat,
          longitude: currentCoords.lon,
          selfie_in_url: previewUrl
        };

        await api.post("/attendances/clock-in", payload);
        await Swal.fire({ icon: "success", title: "Berhasil!", text: "Clock In berhasil dicatat.", showConfirmButton: false, timer: 1500 });
      } else {
        const payload = {
          project_id: todayProjectId,
          selfie_out_url: previewUrl
        };

        await api.put("/attendances/clock-out", payload);
        await Swal.fire({ icon: "success", title: "Berhasil!", text: "Clock Out berhasil dicatat.", showConfirmButton: false, timer: 1500 });
      }

      closeCameraModal();
      setLoadingAbsen(false);
      window.location.reload();
    } catch (err) {
      Swal.fire({ 
        icon: "error", 
        title: attendanceActionType === "clock-in" ? "Gagal Clock In" : "Gagal Clock Out", 
        text: err.response?.data?.message || "Terjadi kesalahan pada server.", 
        showConfirmButton: false, 
        timer: 2000 
      });
      setLoadingAbsen(false);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const totalDays = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handlePrevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Super Admin HRMS
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Selamat datang kembali, <strong className="text-primary">{user?.nama || "Admin"}</strong>! Berikut adalah ringkasan operasional perusahaan hari ini.
        </p>
      </div>

      <div className="mb-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Icon icon="solar:clock-circle-bold-duotone" width="28" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-white text-base">Absensi & Shift Kehadiran Anda</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              <span>Shift: <strong className="text-slate-700 dark:text-slate-300">{todayShiftInfo}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Status: <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{attendanceStatus}</span></span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-auto flex justify-end">
          <button
            onClick={handleMainButtonAction}
            disabled={loadingAbsen || attendanceStatus === "Sudah Clock Out"}
            className={`h-11 px-6 font-bold text-xs rounded-xl shadow-sm transition-all w-full md:w-auto md:min-w-[160px] flex items-center justify-center gap-2 ${
              attendanceStatus === "Sudah Clock Out"
                ? "bg-emerald-500 text-white cursor-not-allowed opacity-90"
                : attendanceStatus === "Sudah Clock In"
                ? "bg-amber-500 text-white hover:opacity-90"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            <Icon icon={attendanceStatus === "Sudah Clock In" ? "solar:logout-3-bold" : "solar:login-3-bold"} width="16" />
            {loadingAbsen 
              ? "Memproses..." 
              : attendanceStatus === "Sudah Clock Out" 
              ? "Sudah Selesai Absen" 
              : attendanceStatus === "Sudah Clock In" 
              ? "Clock Out / Pulang" 
              : "Clock In / Masuk"}
          </button>
        </div>
      </div>

      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
              <Icon icon="solar:camera-bold-duotone" className="text-primary" width="22" />
              {attendanceActionType === "clock-in" ? "Absensi Clock In (Masuk)" : "Absensi Clock Out (Pulang)"}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 text-center truncate w-full">
              📍 {currentAddress}
            </p>

            <div className="relative rounded-2xl overflow-hidden bg-black w-full aspect-[9/16] max-h-[420px] flex items-center justify-center shadow-inner mb-4">
              {!previewUrl ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <img src={previewUrl} alt="Watermarked Selfie" className="w-full h-full object-cover rounded-xl" />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex items-center justify-between gap-3 w-full">
              <button 
                onClick={closeCameraModal}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:opacity-80 transition-all"
              >
                Batal
              </button>

              {!previewUrl ? (
                <button 
                  onClick={capturePhotoWithWatermark}
                  className="flex-1 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:opacity-90 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Icon icon="solar:camera-circle-bold" width="20" />
                  Ambil Foto
                </button>
              ) : (
                <div className="flex gap-2 flex-1">
                  <button 
                    onClick={() => {
                      setPreviewUrl(null);
                      initCameraAndGPS();
                    }}
                    className="flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-center"
                  >
                    Ulangi
                  </button>
                  <button 
                    onClick={handleSubmitAttendance}
                    disabled={loadingAbsen}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:opacity-90 transition-all shadow-sm text-center"
                  >
                    {loadingAbsen ? "Mengirim..." : "Kirim Absen"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          <Link to="/super-admin/employees" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between hover:border-primary/50 transition-all group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-primary transition-colors">Total Karyawan</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {stats.totalEmployees} <span className="text-xs font-normal text-slate-400">Orang</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Icon icon="solar:users-group-rounded-bold-duotone" width="28" />
            </div>
          </Link>

          <Link to="/super-admin/project" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between hover:border-indigo-500/50 transition-all group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Project Aktif</p>
              <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                {stats.activeProjects} <span className="text-xs font-normal text-slate-400">/ {stats.totalProjects} Total</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <Icon icon="solar:folder-with-files-bold-duotone" width="28" />
            </div>
          </Link>

          <Link to="/super-admin/attendances" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between hover:border-emerald-500/50 transition-all group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Hadir Hari Ini</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {stats.todayPresent} <span className="text-xs font-normal text-slate-400">Karyawan</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Icon icon="solar:user-check-bold-duotone" width="28" />
            </div>
          </Link>

          <Link to="/super-admin/attendances" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between hover:border-rose-500/50 transition-all group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-rose-500 transition-colors">Terlambat Hari Ini</p>
              <h3 className="text-3xl font-black text-rose-500 dark:text-rose-400 mt-2">
                {stats.todayLate} <span className="text-xs font-normal text-slate-400">Orang</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 group-hover:scale-105 transition-transform">
              <Icon icon="solar:clock-circle-bold-duotone" width="28" />
            </div>
          </Link>

          <Link to="/super-admin/branch" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between hover:border-purple-500/50 transition-all group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-purple-500 transition-colors">Cabang</p>
              <h3 className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                {stats.totalBranches} <span className="text-xs font-normal text-slate-400">Lokasi</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Icon icon="solar:shop-bold-duotone" width="28" />
            </div>
          </Link>

          <Link to="/super-admin/department" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between hover:border-cyan-500/50 transition-all group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-cyan-500 transition-colors">Departemen</p>
              <h3 className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-2">
                {stats.totalDepartments} <span className="text-xs font-normal text-slate-400">Divisi</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Icon icon="solar:buildings-bold-duotone" width="28" />
            </div>
          </Link>

          <Link to="/super-admin/cash-advances" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between hover:border-amber-500/50 transition-all group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-amber-500 transition-colors">Pending Approval</p>
              <h3 className="text-3xl font-black text-amber-500 dark:text-amber-400 mt-2">
                {stats.pendingCashAdvances + stats.pendingOvertimes} <span className="text-xs font-normal text-slate-400">Item</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Icon icon="solar:clipboard-text-bold-duotone" width="28" />
            </div>
          </Link>

          <Link to="/super-admin/payroll-periods" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between hover:border-emerald-500/50 transition-all group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Pusat Payroll</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
                Generate Gaji
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Icon icon="solar:bill-list-bold-duotone" width="28" />
            </div>
          </Link>
        </div>
      )}

      <div className="mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Icon icon="solar:calendar-bold-duotone" className="text-primary" width="22" />
            Kalender Kehadiran & Shift Bulanan Anda
          </h3>
          
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-sm">
            <button onClick={handlePrevMonth} className="text-slate-500 hover:text-primary transition-colors">
              <Icon icon="solar:alt-arrow-left-linear" width="18" />
            </button>
            <span className="font-bold text-xs text-slate-700 dark:text-slate-200 min-w-[110px] text-center">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="text-slate-500 hover:text-primary transition-colors">
              <Icon icon="solar:alt-arrow-right-linear" width="18" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 overflow-x-auto">
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">Hadir Tepat Waktu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">Terlambat (Late)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">Tidak Masuk / Alpha</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">Libur / Off / Belum Ada Jadwal</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center font-bold text-[11px] sm:text-xs text-slate-400 mb-3 min-w-[320px]">
            <span>Senin</span>
            <span>Selasa</span>
            <span>Rabu</span>
            <span>Kamis</span>
            <span>Jumat</span>
            <span>Sabtu</span>
            <span>Minggu</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 min-w-[320px]">
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-16 sm:h-20 rounded-xl bg-slate-50/30 dark:bg-slate-950/25 border border-transparent"></div>
            ))}

            {Array.from({ length: totalDays }).map((_, index) => {
              const dayNum = index + 1;
              const formattedDay = dayNum < 10 ? `0${dayNum}` : dayNum;
              const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : month + 1;
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const attRecord = myAttendancesMap[dateStr];
              const shiftRecord = myShiftsMap[dateStr];
              
              const todayFormatted = new Date().toISOString().split("T")[0];
              const isPastOrToday = dateStr <= todayFormatted;

              let statusColor = "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400";
              let badgeText = "Libur / Off";

              if (attRecord) {
                if (attRecord.status && attRecord.status.toLowerCase().includes("late")) {
                  statusColor = "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold";
                  badgeText = "Terlambat";
                } else {
                  statusColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold";
                  badgeText = "Hadir";
                }
              } else if (shiftRecord && shiftRecord.Shift) {
                if (isPastOrToday) {
                  statusColor = "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 font-semibold";
                  badgeText = "Tidak Masuk";
                } else {
                  statusColor = "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold";
                  badgeText = shiftRecord.Shift.name || "Terjadwal";
                }
              }

              return (
                <div 
                  key={dateStr}
                  onClick={() => attRecord && handlePreviewAttendance(attRecord)}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2.5 rounded-xl border flex flex-col justify-between transition-all overflow-hidden ${statusColor} ${attRecord ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : ''}`}
                  title={attRecord ? "Klik untuk melihat detail & foto absensi" : ""}
                >
                  <div className="flex justify-between items-center">
                    <span className="n-date text-[10px] sm:text-xs font-mono font-bold">{dayNum}</span>
                    {attRecord ? (
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${badgeText === "Hadir" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                    ) : shiftRecord && isPastOrToday ? (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 shrink-0"></span>
                    ) : null}
                  </div>
                  
                  <div className="overflow-hidden">
                    {attRecord ? (
                      <div className="text-[9px] sm:text-[10px] leading-tight">
                        <div className="font-mono font-bold truncate">{formatTimeDisplay(attRecord.clock_in)}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] truncate">{badgeText}</div>
                      </div>
                    ) : shiftRecord && shiftRecord.Shift ? (
                      <div className="text-[9px] sm:text-[10px] leading-tight">
                        <div className="font-semibold truncate">{shiftRecord.Shift.name}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] truncate">{badgeText}</div>
                      </div>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] text-slate-400 italic">Libur</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}