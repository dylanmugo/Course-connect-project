
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
    <header className="bg-white">
      <div className="container-pad py-6">
        <div className="flex items-center space-x-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">
                {profile?.student_id?.substring(0, 2) || 'TU'}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome, {profile?.full_name || profile?.student_id || 'Student'}
            </h2>
            <p className="text-sm text-gray-600">
              {profile?.department} • Year {profile?.academic_year} • Group {profile?.module_group}
            </p>
          </div>
        </div>
      </div>
      {/* Very subtle divider */}
      <div className="h-[1px] bg-gray-100"></div>
    </header>
  );
};

export default DashboardHeader;
