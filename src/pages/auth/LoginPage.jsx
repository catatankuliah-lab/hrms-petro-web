import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import api from "../../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const resData = response.data;
      console.log("Login Response Data:", resData);

      // 1. Ambil token, user data, DAN id dari resData.data[cite: 13]
      const token = resData.token;
      const user = resData.data;
      const { id, role, first_name, last_name } = user; // <-- ID berhasil diambil di sini!

      // Gabungkan first_name dan last_name menjadi nama lengkap[cite: 13]
      const fullName = `${first_name || ""} ${last_name || ""}`.trim();

      // 2. Bersihkan spasi pada role[cite: 13]
      const cleanRole = role ? String(role).trim() : "";

      // 3. Simpan ke LocalStorage[cite: 13]
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("user_role", cleanRole);
      localStorage.setItem("user_name", fullName);
      localStorage.setItem("user_id", id); // <-- Simpan ID ke LocalStorage

      // 4. Update Context Global (Sertakan id di sini!)[cite: 13]
      setUser({ id, role: cleanRole, token, nama: fullName });

      // 5. Navigasi berdasarkan role baru[cite: 13]
      switch (cleanRole) {
        case "Super Admin":
          navigate("/super-admin/dashboard", { replace: true });
          break;
        case "HR":
          navigate("/hr/dashboard", { replace: true });
          break;
        case "Finance":
          navigate("/finance/dashboard", { replace: true });
          break;
        case "Project Manager":
        case "A Project Manager":
          navigate("/manager/dashboard", { replace: true });
          break;
        case "Employee":
          navigate("/employee/dashboard", { replace: true });
          break;
        default:
          navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal terhubung ke server.",
      );
      console.error("Error login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full flex justify-center items-center bg-cover bg-center bg-no-repeat relative before:absolute before:inset-0 before:bg-black/10 dark:before:bg-black/60"
      style={{ backgroundImage: "url('/images/backgrounds/loginbg.png')" }}
    >
      <div className="md:min-w-[450px] min-w-max relative z-10">
        <Card className="p-8 border-none shadow-md">
          <div className="flex justify-center mb-5">
            <img
              src="/images/logos/logopetropacific.png"
              alt="Logo"
              className="h-15 md:h-17"
            />
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-6 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="mb-2 block">
                <label
                  htmlFor="username1"
                  className="font-medium text-sm text-gray-700 dark:text-gray-300"
                >
                  Emaill
                </label>
              </div>
              <Input
                id="username1"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            <div>
              <div className="mb-4 block">
                <label
                  htmlFor="password1"
                  className="font-medium text-sm text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
              </div>
              <Input
                id="password1"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-5">
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}