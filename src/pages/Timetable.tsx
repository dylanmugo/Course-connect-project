import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import NavigationHeader from "../components/shared/NavigationHeader";
import TimetableDayCard from "../components/timetable/TimetableDayCard";
import AddClassForm from "../components/timetable/AddClassForm";
import { ClassSchedule, Module, UserProfile, colorOptions } from "../types/timetable";

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Timetable = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ClassSchedule>({
    class_name: "",
    teacher: "",
    location: "",
    day: "Monday",
    start_time: "09:00",
    end_time: "10:00",
    color: "#3b82f6",
    module_id: "",
  });

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        await fetchUserProfile();
        await fetchClassSchedules();
        setIsLoading(false);
      };
      
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      if (!user) {
        console.log("No user found, skipping profile fetch");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("course_id, academic_year, semester")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        setUserProfile(data);
        console.log("User profile:", data);
        
        if (data.course_id) {
          await fetchAvailableModules(data);
        } else {
          console.log("No course_id in profile, skipping module fetch");
          createDummyModules();
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      createDummyModules();
    }
  };

  const createDummyModules = () => {
    const dummyModules: Module[] = [
      { 
        id: "1", 
        module_code: "CS101", 
        module_title: "Introduction to Computer Science" 
      },
      { 
        id: "2", 
        module_code: "MATH202", 
        module_title: "Advanced Mathematics" 
      },
      { 
        id: "3", 
        module_code: "ENG103", 
        module_title: "Academic Writing" 
      },
      { 
        id: "4", 
        module_code: "PHYS101", 
        module_title: "Physics Fundamentals" 
      }
    ];
    
    setAvailableModules(dummyModules);
    console.log("Using dummy modules:", dummyModules);
  };

  const fetchAvailableModules = async (profile: UserProfile) => {
    try {
      if (!profile.course_id) {
        console.warn("No course_id available to fetch modules");
        createDummyModules();
        return;
      }
      
      console.log(`Fetching modules for course ${profile.course_id} and semester ${profile.semester}`);
      
      let query = supabase
        .from("modules")
        .select("id, module_code, module_title")
        .eq("course_id", profile.course_id);
      
      if (profile.semester) {
        query = query.eq("semester", profile.semester);
      }
        
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching modules:", error);
        createDummyModules();
        return;
      }
      
      console.log(`Found ${data?.length} modules for semester ${profile.semester}`);
      
      if (data && data.length === 0) {
        console.warn("No modules found for course and semester");
        createDummyModules();
        return;
      }
      
      setAvailableModules(data || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
      createDummyModules();
    }
  };

  const fetchClassSchedules = async () => {
    try {
      if (!user) {
        console.log("No user found, skipping class schedules fetch");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_class_schedules")
        .select("*")
        .eq("user_id", user?.id)
        .order("start_time");

      if (error) {
        console.error("Error fetching class schedules:", error);
        setIsLoading(false);
        return;
      }
      
      console.log("Fetched class schedules:", data);
      
      setClassSchedules(data || []);
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("timetable_setup")
        .eq("id", user?.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile timetable_setup status:", profileError);
        setIsNewUser(data?.length === 0);
        return;
      }
      
      setIsNewUser(data?.length === 0 && !profileData.timetable_setup);
    } catch (error) {
      console.error("Error fetching class schedules:", error);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.class_name) {
      toast.error("Please enter a class name");
      return;
    }

    if (!formData.day || !formData.start_time || !formData.end_time) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const tempId = Math.random().toString(36).substring(2, 9);
      
      const newClass: ClassSchedule = {
        id: tempId,
        class_name: formData.class_name,
        teacher: formData.teacher || "TBD",
        location: formData.location || "TBD",
        day: formData.day,
        start_time: formData.start_time,
        end_time: formData.end_time,
        color: formData.color,
        module_id: formData.module_id || undefined
      };
      
      setClassSchedules(prev => [...prev, newClass]);
      
      if (user) {
        const { data, error } = await supabase
          .from("user_class_schedules")
          .insert({
            user_id: user.id,
            class_name: formData.class_name,
            module_id: formData.module_id || null,
            teacher: formData.teacher || "TBD",
            location: formData.location || "TBD",
            day: formData.day,
            start_time: formData.start_time,
            end_time: formData.end_time,
            color: formData.color,
          })
          .select();

        if (error) {
          console.error("Error saving to database:", error);
          toast.error("Class added locally but couldn't save to database");
        } else if (data && data.length > 0) {
          setClassSchedules(prev => 
            prev.map(cls => cls.id === tempId ? data[0] : cls)
          );
        }
      }

      toast.success("Class added to your timetable");
      setShowAddForm(false);
      resetForm();
      
      if (isNewUser && user) {
        setIsNewUser(false);
        try {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ timetable_setup: true })
            .eq("id", user.id);
            
          if (updateError) {
            console.error("Error updating profile timetable_setup flag:", updateError);
          }
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    } catch (error) {
      console.error("Error adding class:", error);
      toast.error("Failed to add class");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      class_name: "",
      teacher: "",
      location: "",
      day: "Monday",
      start_time: "09:00",
      end_time: "10:00",
      color: "#3b82f6",
      module_id: "",
    });
    setSearchQuery("");
  };

  const handleDelete = async (id: string) => {
    try {
      setClassSchedules((prev) => prev.filter((cls) => cls.id !== id));
      
      if (user) {
        const { error } = await supabase
          .from("user_class_schedules")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting from database:", error);
          toast.error("Removed from view but couldn't delete from database");
          return;
        }
      }
      
      toast.success("Class removed from timetable");
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
    }
  };

  const proceedToDashboard = () => {
    navigate("/dashboard");
  };

  const getClassesByDay = (day: string) => {
    return classSchedules.filter((cls) => cls.day === day);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModuleSelect = (moduleId: string) => {
    const selectedModule = availableModules.find(module => module.id === moduleId);
    
    if (selectedModule) {
      setFormData(prev => ({
        ...prev,
        class_name: `${selectedModule.module_code}: ${selectedModule.module_title}`,
        module_id: moduleId
      }));
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const handleClassNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      class_name: e.target.value
    }));
  };

  const filteredModules = availableModules.filter(module => 
    `${module.module_code}: ${module.module_title}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <TimetableLoading />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavigationHeader 
        title={isNewUser ? "Setup Your Timetable" : "Your Timetable"} 
        showBackButton={!isNewUser}
        showCancelButton={isNewUser}
      />

      <div className="flex-1 flex flex-col px-4 py-4">
        <h2 className="text-xl font-semibold mb-2">Weekly Schedule</h2>
        <p className="text-gray-600 mb-4">
          {isNewUser 
            ? "Add your classes to create your weekly timetable" 
            : "Manage your weekly class schedule"}
        </p>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {dayOptions.map((day) => (
            <TimetableDayCard
              key={day}
              day={day}
              classes={getClassesByDay(day)}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg z-30"
          type="button"
        >
          <Plus className="w-6 h-6" />
        </button>

        <DashboardNavigation 
          classCount={classSchedules.length} 
          isNewUser={isNewUser} 
          onProceed={proceedToDashboard} 
        />
      </div>

      {showAddForm && (
        <AddClassForm
          formData={formData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredModules={filteredModules}
          isSubmitting={isSubmitting}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleFormSubmit}
          onInputChange={handleInputChange}
          onModuleSelect={handleModuleSelect}
          onColorSelect={handleColorSelect}
          onClassNameInput={handleClassNameInput}
        />
      )}
    </div>
  );
};

const TimetableLoading = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <p className="mt-4 text-gray-600">Loading your timetable...</p>
  </div>
);

const DashboardNavigation = ({ 
  classCount, 
  isNewUser, 
  onProceed 
}: { 
  classCount: number; 
  isNewUser: boolean; 
  onProceed: () => void;
}) => (
  <div className="mt-6 mb-4">
    {classCount > 0 ? (
      <button
        onClick={onProceed}
        className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium"
        type="button"
      >
        {isNewUser ? "Proceed to Dashboard" : "Return to Dashboard"}
      </button>
    ) : (
      <div>
        <button
          disabled
          className="w-full py-3 px-4 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
          type="button"
        >
          Proceed to Dashboard
        </button>
        <p className="text-sm text-center text-gray-500 mt-2">
          You must create at least one class in your timetable before proceeding to the Dashboard.
        </p>
      </div>
    )}
  </div>
);

export default Timetable;
