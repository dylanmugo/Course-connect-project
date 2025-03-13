import { useState, useEffect } from "react";
import { ChevronLeft, Bell, User, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const MobileHeader = ({ title, showBackButton = false }: MobileHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Hide or show header based on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0 || currentScrollY < lastScrollY) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Fetch user profile from Supabase
  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);

          if (profileData.avatar_url) {
            const { data: avatarData } = await supabase.storage
              .from("avatars")
              .getPublicUrl(profileData.avatar_url);
            setAvatarUrl(avatarData.publicUrl);
          }
        }
      }
    };

    getProfile();
  }, [user]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Header with a sleek dark background */}
      <div className="flex flex-col bg-gray-800 shadow-lg">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-2">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className="text-white text-xl font-bold"
            >
              Course Connect
            </button>
          </div>

          {/* Right: Icons only */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        {!showBackButton && (
          <div className="px-4 pb-6">
            <div className="flex items-center space-x-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 cursor-pointer"
                  onClick={() => navigate("/profile")}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer"
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-6 h-6 text-gray-300" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Welcome, {profile?.full_name || profile?.student_id || "Student"}
                </h2>
                <p className="text-sm text-gray-400">
                  {profile?.department
                    ? `${profile.department} • Year ${profile?.academic_year || "1"} • Group ${profile?.module_group || "A"}`
                    : "Your academic companion"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-[1px] bg-gray-700" />
      </div>

      {/* Popup Menu */}
      {menuOpen && (
        <>
          <div className="absolute right-3 top-16 z-50 w-48 py-2 bg-white rounded-md shadow-xl border border-gray-200">
            <button
              onClick={() => {
                navigate("/settings");
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Settings
            </button>
            <button
              onClick={() => {
                navigate("/favorites");
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Favorites
            </button>
            <button
              onClick={() => {
                handleSignOut();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
          {/* Overlay to close menu when clicking outside */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setMenuOpen(false)}
          ></div>
        </>
      )}
    </header>
  );
};

export default MobileHeader;
