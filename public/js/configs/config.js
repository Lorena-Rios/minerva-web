import { createClient } from "https://esm.sh/@supabase/supabase-js";

export const SUPABASE_URL = "https://yytadiafdpeikxrgpkix.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dGFkaWFmZHBlaWt4cmdwa2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjU5MzIsImV4cCI6MjA3Njc0MTkzMn0.mbye2eIZuKyJgeADilM3T8THpjPbN07ifP_KtMel6S4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
