import { uniqueId } from "lodash";

const SidebarContent = [
  {
    heading: "Utama",
    roles: ["Super Admin"],
    children: [
      {
        name: "Dashboard",
        icon: "solar:home-angle-linear",
        id: uniqueId(),
        url: "/dashboard",
        roles: ["Super Admin"],
      },
    ],
  },
  {
    heading: "Organisasi & Perusahaan",
    roles: ["Super Admin"],
    children: [
      {
        name: "Perusahaan",
        icon: "solar:buildings-linear",
        id: uniqueId(),
        url: "/company",
        roles: ["Super Admin"],
      },
      {
        name: "Cabang",
        icon: "solar:shop-linear",
        id: uniqueId(),
        url: "/branch",
        roles: ["Super Admin"],
      },
      {
        name: "Departemen",
        icon: "solar:users-group-rounded-linear",
        id: uniqueId(),
        url: "/department",
        roles: ["Super Admin"],
      },
      {
        name: "Jabatan",
        icon: "solar:user-id-linear",
        id: uniqueId(),
        url: "/job-position",
        roles: ["Super Admin"],
      },
      {
        name: "Project",
        icon: "solar:folder-with-files-linear",
        id: uniqueId(),
        url: "/project",
        roles: ["Super Admin"],
      },
    ],
  },
  {
    heading: "Manajemen Karyawan",
    roles: ["Super Admin"],
    children: [
      {
        name: "Data Karyawan",
        icon: "solar:user-hands-linear",
        id: uniqueId(),
        url: "/employee",
        roles: ["Super Admin"],
      },
    ],
  },
  {
    heading: "Absensi & Operasional",
    roles: ["Super Admin"],
    children: [
      {
        name: "Master Shift",
        icon: "solar:clock-circle-linear",
        id: uniqueId(),
        url: "/shift",
        roles: ["Super Admin"],
      },
      {
        name: "Jadwal Shift Karyawan",
        icon: "solar:calendar-mark-linear",
        id: uniqueId(),
        url: "/emp-shift",
        roles: ["Super Admin"],
      },
      {
        name: "Kehadiran (Attendance)",
        icon: "solar:user-check-linear",
        id: uniqueId(),
        url: "/attendances",
        roles: ["Super Admin"],
      },
      {
        name: "Lembur (Overtime)",
        icon: "solar:alarm-linear",
        id: uniqueId(),
        url: "/overtimes",
        roles: ["Super Admin"],
      },
    ],
  },
  {
    heading: "Keuangan & Payroll",
    roles: ["Super Admin"],
    children: [
      {
        name: "Kasbon (Cash Advance)",
        icon: "solar:wallet-money-linear",
        id: uniqueId(),
        url: "/cash-advances",
        roles: ["Super Admin"],
      },
      {
        name: "Komponen Gaji",
        icon: "solar:tag-price-linear",
        id: uniqueId(),
        url: "/salary-components",
        roles: ["Super Admin"],
      },
      {
        name: "Gaji & Tunjangan",
        icon: "solar:card-send-linear",
        id: uniqueId(),
        url: "/esalaries",
        roles: ["Super Admin"],
      },
      {
        name: "Periode & Slip Gaji",
        icon: "solar:bill-list-linear",
        id: uniqueId(),
        url: "/payroll-periods",
        roles: ["Super Admin"],
      },
    ],
  },
  {
    heading: "Utama",
    roles: ["HR"],
    children: [
      {
        name: "Dashboard",
        icon: "solar:home-angle-linear",
        id: uniqueId(),
        url: "/dashboard",
        roles: ["HR"],
      },
    ],
  },
  {
    heading: "Organisasi & Perusahaan",
    roles: ["HR"],
    children: [
      {
        name: "Perusahaan",
        icon: "solar:buildings-linear",
        id: uniqueId(),
        url: "/company",
        roles: ["HR"],
      },
      {
        name: "Cabang",
        icon: "solar:shop-linear",
        id: uniqueId(),
        url: "/branch",
        roles: ["HR"],
      },
      {
        name: "Departemen",
        icon: "solar:users-group-rounded-linear",
        id: uniqueId(),
        url: "/department",
        roles: ["HR"],
      },
      {
        name: "Jabatan",
        icon: "solar:user-id-linear",
        id: uniqueId(),
        url: "/job-position",
        roles: ["HR"],
      },
      {
        name: "Project",
        icon: "solar:folder-with-files-linear",
        id: uniqueId(),
        url: "/project",
        roles: ["HR"],
      },
    ],
  },
  {
    heading: "Manajemen Karyawan",
    roles: ["HR"],
    children: [
      {
        name: "Data Karyawan",
        icon: "solar:user-hands-linear",
        id: uniqueId(),
        url: "/employee",
        roles: ["HR"],
      },
    ],
  },
  {
    heading: "Absensi & Operasional",
    roles: ["HR"],
    children: [
      {
        name: "Master Shift",
        icon: "solar:clock-circle-linear",
        id: uniqueId(),
        url: "/shift",
        roles: ["HR"],
      },
      {
        name: "Jadwal Shift Karyawan",
        icon: "solar:calendar-mark-linear",
        id: uniqueId(),
        url: "/emp-shift",
        roles: ["HR"],
      },
      {
        name: "Kehadiran (Attendance)",
        icon: "solar:user-check-linear",
        id: uniqueId(),
        url: "/attendances",
        roles: ["HR"],
      },
      {
        name: "Lembur (Overtime)",
        icon: "solar:alarm-linear",
        id: uniqueId(),
        url: "/overtimes",
        roles: ["HR"],
      },
    ],
  },
  {
    heading: "Keuangan & Payroll",
    roles: ["HR"],
    children: [
      {
        name: "Kasbon (Cash Advance)",
        icon: "solar:wallet-money-linear",
        id: uniqueId(),
        url: "/cash-advances",
        roles: ["HR"],
      },
      {
        name: "Komponen Gaji",
        icon: "solar:tag-price-linear",
        id: uniqueId(),
        url: "/salary-components",
        roles: ["HR"],
      },
      {
        name: "Gaji & Tunjangan",
        icon: "solar:card-send-linear",
        id: uniqueId(),
        url: "/esalaries",
        roles: ["HR"],
      },
      {
        name: "Periode & Slip Gaji",
        icon: "solar:bill-list-linear",
        id: uniqueId(),
        url: "/payroll-periods",
        roles: ["HR"],
      },
    ],
  },
  {
    heading: "Utama",
    roles: ["Project Manager"],
    children: [
      {
        name: "Dashboard",
        icon: "solar:home-angle-linear",
        id: uniqueId(),
        url: "/dashboard",
        roles: ["Project Manager"],
      },
    ],
  },
  {
    heading: "Kehadiran Karyawan",
    roles: ["Project Manager"],
    children: [
      {
        name: "Kehadiran Karyawan",
        icon: "solar:user-check-linear",
        id: uniqueId(),
        url: "/attendances",
        roles: ["Project Manager"],
      },
    ],
  },
  {
    heading: "Shift Karyawan",
    roles: ["Project Manager"],
    children: [
      {
        name: "Atur Shift Karyawan",
        icon: "solar:calendar-mark-linear",
        id: uniqueId(),
        url: "/emp-shift",
        roles: ["Project Manager"],
      },
    ],
  },
  {
    heading: "Utama",
    roles: ["Employee"],
    children: [
      {
        name: "Dashboard",
        icon: "solar:home-angle-linear",
        id: uniqueId(),
        url: "/dashboard",
        roles: ["Employee"],
      },
    ],
  },
];

export default SidebarContent;