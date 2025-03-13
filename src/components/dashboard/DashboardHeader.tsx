import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

interface UserProfile {
  student_id: string;
  department: string;
  academic_year: string;
  module_group: string;
  full_name?: string;
  avatar_url?: string;
}

const DashboardHeader = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
  }, []);

  return (
    <header className="bg-indigo-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        {/* Left: Course Connect logo */}
        <div>
          <Link to="/" className="text-white text-2xl font-bold">
            Course Connect
          </Link>
        </div>
        {/* Right: Dashboard header and profile details */}
        <div className="flex flex-col items-end">
          <span className="text-white text-sm font-medium mb-1">Dashboard</span>
          <div className="flex items-center space-x-4">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <span className="text-indigo-800 font-bold">
                  {profile?.student_id?.substring(0, 2).toUpperCase() || 'TU'}
                </span>
              </div>
            )}
            <div className="text-right">
              <h2 className="text-xl font-semibold text-white">
                Welcome, {profile?.full_name || profile?.student_id || 'Student'}
              </h2>
              <p className="text-sm text-white/90">
                {profile?.department} &bull; Year {profile?.academic_year} &bull; Group {profile?.module_group}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[1px] bg-white/20"></div>
    </header>
  );
};

export default DashboardHeader;
