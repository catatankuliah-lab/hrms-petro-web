import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper hitung pergerakan posisi armada
function checkIsMoving(p1, p2) {
  if (!p1 || !p2) return false;
  const latDiff = Math.abs(parseFloat(p1.latitude) - parseFloat(p2.latitude));
  const lngDiff = Math.abs(parseFloat(p1.longitude) - parseFloat(p2.longitude));
  return latDiff > 0.0001 || lngDiff > 0.0001;
}

// 🎯 PALET WARNA TINGGI KONTRAS (SPEKTRUM BEDA JAUH)
const PROJECT_COLORS = [
  "#dc2626", // Merah terang
  "#2563eb", // Biru elektrik
  "#16a34a", // Hijau pekat
  "#ea580c", // Oranye tajam
  "#9333ea", // Ungu violet
  "#0891b2", // Cyan gelap
  "#db2777", // Pink magenta
  "#ca8a04", // Kuning amber tua
  "#4f46e5", // Indigo
  "#059669", // Zamrud emerald
];

// Helper untuk menghasilkan warna konsisten berdasarkan ID / nama project
function getProjectColor(identifier) {
  if (!identifier) return "#475569";
  let hash = 0;
  const str = String(identifier);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PROJECT_COLORS.length;
  return PROJECT_COLORS[index];
}

// 🎯 HELPER PEMBUAT IKON TRUK DENGAN WARNA PROJECT & INDIKATOR BERJALAN
const createTruckIcon = (bgColor, isMoving) => {
  return L.divIcon({
    className: "custom-fleet-marker",
    html: `
      <div style="
        background-color: ${bgColor};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        border: 2.5px solid #ffffff;
        cursor: pointer;
        transition: transform 0.2s ease;
        position: relative;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>

        ${
          isMoving
            ? `<span style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 12px;
                height: 12px;
                background-color: #22c55e;
                border-radius: 50%;
                border: 2px solid #ffffff;
                box-shadow: 0 0 5px rgba(34, 197, 94, 0.9);
              "></span>`
            : `<span style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 12px;
                height: 12px;
                background-color: #94a3b8;
                border-radius: 50%;
                border: 2px solid #ffffff;
              "></span>`
        }
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
};

// Sub-komponen Alamat Terkini
function PopupAddress({ lat, lng }) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAddress = async () => {
      if (!lat || !lng) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: {
              "Accept-Language": "id-ID,id;q=0.9",
            },
          }
        );
        if (!res.ok) throw new Error("Gagal fetching alamat");
        const data = await res.json();

        if (isMounted) {
          setAddress(data.display_name || "Alamat tidak ditemukan");
        }
      } catch (err) {
        console.error("Gagal reverse geocode:", err);
        if (isMounted) {
          setAddress("Gagal memuat alamat");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAddress();

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  return (
    <div className="mt-2 pt-2 border-t text-[11px] text-gray-500">
      <strong className="block text-gray-700 mb-0.5">Alamat Terkini:</strong>
      {loading ? (
        <span className="text-gray-400 italic">Mengambil lokasi alamat...</span>
      ) : (
        <span>{address}</span>
      )}
    </div>
  );
}

// Sub-komponen Marker & Popup
function MarkerWithAddress({ woItem }) {
  const gpsList = woItem.tracking_gps || [];
  const currentGps = gpsList[0];
  const previousGps = gpsList[1];

  const lat = parseFloat(currentGps?.latitude);
  const lng = parseFloat(currentGps?.longitude);

  const isMoving = checkIsMoving(currentGps, previousGps);

  // Ambil ID / Nama Project untuk penentuan warna yang kontras
  const projectKey =
    woItem.sub_pekerjaan?.pekerjaan?.id ||
    woItem.sub_pekerjaan?.pekerjaan?.nama_pekerjaan ||
    "default";
  const projectColor = getProjectColor(projectKey);

  const truckIcon = useMemo(
    () => createTruckIcon(projectColor, isMoving),
    [projectColor, isMoving]
  );

  if (!lat || !lng) return null;

  const namaPekerjaan = woItem.sub_pekerjaan?.pekerjaan?.nama_pekerjaan || "-";
  const tonaseMuat = woItem.total_tonase_muat
    ? `${parseFloat(woItem.total_tonase_muat).toLocaleString("id-ID")} Kg`
    : "0 Kg";
  const tonaseBongkar = woItem.total_tonase_bongkar
    ? `${parseFloat(woItem.total_tonase_bongkar).toLocaleString("id-ID")} Kg`
    : "0 Kg";

  const waktuWIB = currentGps?.recorded_at
    ? new Date(currentGps.recorded_at).toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + " WIB"
    : "-";

  const handleOpenDokumen = () => {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const currentRolePath = pathSegments[0] || "itsupport";
    const fileUrl = woItem.bukti_sjt_url || woItem.file_dokumen_url;

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      window.open(`/${currentRolePath}/sjtbast/detail/${woItem.id}`, "_blank");
    }
  };

  return (
    <Marker position={[lat, lng]} icon={truckIcon}>
      <Popup>
        <div className="p-1 max-w-[280px] text-xs font-sans">
          {/* Header Nopol & Status Pergerakan */}
          <div className="flex items-center justify-between gap-2 border-b pb-2 mb-2">
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
              {woItem.armada_details?.plat_nomor || "Nopol -"}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                isMoving
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {isMoving ? "🚚 BERGERAK" : "🅿️ BERHENTI"}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-gray-600 dark:text-gray-300">
            <div>
              <strong className="text-gray-800 block">Pekerjaan:</strong>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: projectColor }}
                ></span>
                <span className="text-gray-700 font-medium leading-tight">
                  {namaPekerjaan}
                </span>
              </div>
            </div>

            <p>
              <strong className="text-gray-800">Sub Pekerjaan:</strong>{" "}
              {woItem.sub_pekerjaan?.nama_sub_pekerjaan || "-"}
            </p>

            <p>
              <strong className="text-gray-800">Driver:</strong>{" "}
              {woItem.driver_details?.nama_lengkap || "-"}
            </p>

            <p>
              <strong className="text-gray-800">
                Tonase (Muat / Bongkar):
              </strong>{" "}
              <span className="font-semibold text-gray-900">
                {tonaseMuat} / {tonaseBongkar}
              </span>
            </p>

            <p>
              <strong className="text-gray-800">Status WO:</strong>{" "}
              <span className="text-primary font-semibold">
                {woItem.status}
              </span>
            </p>

            <p>
              <strong className="text-gray-800">Waktu GPS:</strong>{" "}
              <span className="font-medium text-gray-900">{waktuWIB}</span>
            </p>
          </div>

          <PopupAddress lat={lat} lng={lng} />

          <div className="mt-3 pt-2 border-t">
            <button
              type="button"
              onClick={handleOpenDokumen}
              className="w-full py-1.5 px-3 bg-[#101838] hover:bg-[#1a2550] text-white font-medium text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>📄</span>
              <span>Lihat Dokumen SJT-BAST</span>
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Helper Kamera Otomatis Zoom Memuat Semua Marker
function AutoFitBounds({ data }) {
  const map = useMap();

  useEffect(() => {
    const validCoords = data
      .filter((item) => item.tracking_gps && item.tracking_gps.length > 0)
      .map((item) => [
        parseFloat(item.tracking_gps[0].latitude),
        parseFloat(item.tracking_gps[0].longitude),
      ])
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [data, map]);

  return null;
}

export default function FleetMap({ data = [] }) {
  const defaultCenter = [-6.9175, 107.6191];

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((woItem) => (
          <MarkerWithAddress key={woItem.id} woItem={woItem} />
        ))}

        <AutoFitBounds data={data} />
      </MapContainer>
    </div>
  );
}