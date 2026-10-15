import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { AuthContext } from "../../../context/AuthContext";

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  // Menutup dropdown jika user klik di luar area komponen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative group/menu" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer bg-lightprimary">
        <img
          src="/images/profile/user-1.jpg"
          alt="Profile"
          height={35}
          width={35}
          className="rounded-full"
          onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + (user?.nama || 'User') }}
        />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-card rounded-xl shadow-lg border border-gray-100 dark:border-defaultBorder p-2 z-50">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-defaultBorder mb-2">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.nama || 'Pengguna'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>

          <div className="p-3 pt-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/50 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;