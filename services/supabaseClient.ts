
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gybowcyvmmgimcllryub.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5Ym93Y3l2bW1naW1jbGxyeXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODEyNjEsImV4cCI6MjA3ODU1NzI2MX0.0_7ypaWI7BITdrAcuRdsuDZtJt2aPhDj5NzQEFLAh_s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);