
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header if scrolling up or at the top
      if (currentScrollY <= 0) {
        setVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          
          if (profileData.avatar_url) {
            const { data: avatarData } = await supabase.storage
              .from('avatars')
              .getPublicUrl(profileData.avatar_url);
            
            setAvatarUrl(avatarData.publicUrl);
          }
        }
      }
    };

    getProfile();
  }, [user]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 bg-white transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex flex-col bg-white">
        {/* Top navigation area */}
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center">
            {showBackButton ? (
              <button
                onClick={handleGoBack}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
            ) : (
              <h1 className="text-lg font-semibold">{title || "StudyBuddy"}</h1>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* User profile hero section */}
        {!showBackButton && (
          <div className="px-4 pb-6">
            <div className="flex items-center space-x-4">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/10"
                  onClick={() => navigate('/profile')}
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome, {profile?.full_name || profile?.student_id || 'Student'}
                </h2>
                <p className="text-sm text-gray-600">
                  {profile?.department ? `${profile.department} • Year ${profile?.academic_year || '1'} • Group ${profile?.module_group || 'A'}` : 'Your academic companion'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Very subtle divider */}
        <div className="h-[1px] bg-gray-100"></div>
      </div>

      {/* Simple popup menu instead of full sidebar */}
      {menuOpen && (
        <div className="absolute right-3 top-16 z-50 w-48 py-2 bg-white rounded-md shadow-lg border border-gray-100">
          <button 
            onClick={() => {
              navigate('/settings');
              setMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Settings
          </button>
          <button 
            onClick={() => {
              navigate('/favorites');
              setMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Favorites
          </button>
          <button 
            onClick={() => {
              handleSignOut();
              setMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default MobileHeader;
