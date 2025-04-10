
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize the Supabase client with provided credentials
const supabaseUrl = 'https://xxzwzbwoimtreqihqqxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4end6YndvaW10cmVxaWhxcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNjI2MzksImV4cCI6MjA1OTgzODYzOX0.06bIVMXEmbNXz_mJi1iChTkHv6XS6H1UXnh_wVnpe1I';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
