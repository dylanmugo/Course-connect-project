import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './use-toast';

interface StudySession {
  id: string;
  user_id: string;
  module_id: string | null;
  duration: number; // in minutes
  date: string;
  notes?: string;
  created_at?: string;
  earned_coins?: number;
}

interface Module {
  id: string;
  module_code: string;
  module_title: string;
}

export const useStudySessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch study sessions and modules
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No active session');

        const { data: modulesData } = await supabase
          .from('modules')
          .select('id, module_code, module_title');
        setModules(modulesData || []);

        const { data: sessionsData } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        setSessions(sessionsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load study sessions. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Calculate total study time
  const getTotalStudyTime = () => {
    return sessions.reduce((total, session) => total + session.duration, 0);
  };

  // Get most studied modules
  const getMostStudiedModules = () => {
    const moduleStats: { [key: string]: number } = {};
    sessions.forEach((session) => {
      if (session.module_id) {
        moduleStats[session.module_id] = (moduleStats[session.module_id] || 0) + session.duration;
      }
    });
    return Object.entries(moduleStats)
      .sort((a, b) => b[1] - a[1])
      .map(([moduleId, duration]) => ({
        moduleId,
        duration,
        moduleName: modules.find((m) => m.id === moduleId)?.module_title || 'Unknown Module',
      }));
  };

  // Create study session
  const createStudySession = async (moduleId: string | null, duration: number, date: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No active session');

      const earnedCoins = Math.max(1, Math.floor(duration / 10)); // Ensure at least 1 coin is earned
      const newSession = { user_id: user.id, module_id: moduleId, duration, date, notes, earned_coins: earnedCoins };
      const { data, error } = await supabase.from('study_sessions').insert([newSession]).select();
      if (error) throw error;

      if (data) {
        setSessions(prev => [data[0], ...prev]);
        toast({ title: 'Success', description: `Study session logged successfully! You earned ${earnedCoins} coins.` });
        return data[0];
      }
    } catch (error) {
      console.error('Error creating study session:', error);
      toast({ title: 'Error', description: 'Failed to log study session.', variant: 'destructive' });
      return null;
    }
  };

  // Log timer session automatically
  const logTimerSession = async (duration: number, moduleId?: string | null) => {
    const today = new Date().toISOString().split('T')[0];
    return await createStudySession(moduleId || null, duration, today, 'Logged from Focus Timer');
  };

  return {
    sessions,
    modules,
    isLoading,
    createStudySession,
    updateStudySession: async () => {}, // Placeholder to prevent errors
    deleteStudySession: async () => {}, // Placeholder to prevent errors
    logTimerSession,
    getTotalStudyTime,
    getMostStudiedModules
  };
};