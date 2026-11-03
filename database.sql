-- Supabase SQL Schema & Tamil Nadu, India Seed Script
-- Execute this script in the Supabase SQL Editor to initialize tables

-- 1. Create Profiles Table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('hospital', 'donor', 'blood_bank', 'admin')) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  contact TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Create Blood Requests Table
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  units_required INTEGER NOT NULL CHECK (units_required > 0),
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  location JSONB NOT NULL, -- {address, lat, lng}
  status TEXT CHECK (status IN ('pending', 'checking_inventory', 'inventory_reserved', 'contacting_donors', 'donor_accepted', 'screening_failed', 'fulfilled', 'cancelled')) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  failed_donors UUID[] DEFAULT '{}',
  current_donor_index INTEGER DEFAULT 0,
  matched_donors JSONB DEFAULT '[]'::jsonb,
  active_donor_coordination JSONB DEFAULT NULL, -- {donorId, donorName, contactedAt, timeoutAt, responseStatus}
  inventory_reservation JSONB DEFAULT NULL, -- {bloodBankId, bloodBankName, unitsReserved, bloodGroupUsed}
  screening_details JSONB DEFAULT NULL -- {verifiedBy, verifiedAt, status, comments}
);

-- Enable RLS
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read blood requests" ON public.blood_requests
  FOR SELECT USING (true);

CREATE POLICY "Hospitals can insert blood requests" ON public.blood_requests
  FOR INSERT WITH CHECK (auth.uid() = hospital_id);

CREATE POLICY "Hospitals can update their own requests" ON public.blood_requests
  FOR UPDATE USING (auth.uid() = hospital_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'donor')
  ));

-- 3. Create AI Reasoning Logs Table
CREATE TABLE IF NOT EXISTS public.ai_reasoning_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  level TEXT CHECK (level IN ('info', 'warning', 'success', 'action')) NOT NULL,
  message TEXT NOT NULL,
  reasoning TEXT
);

-- Enable RLS
ALTER TABLE public.ai_reasoning_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reasoning logs viewable by all users" ON public.ai_reasoning_logs
  FOR SELECT USING (true);

-- 4. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audits viewable by everyone" ON public.audit_logs
  FOR SELECT USING (true);

-- 5. Create Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Single row table
  escalation_timeout_seconds INTEGER DEFAULT 30 NOT NULL,
  weights JSONB DEFAULT '{"distance": 40, "reliability": 30, "lastDonationRecency": 30}'::jsonb NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by everyone" ON public.system_settings
  FOR SELECT USING (true);

-- Seed System Settings
INSERT INTO public.system_settings (id, escalation_timeout_seconds, weights)
VALUES (1, 30, '{"distance": 40, "reliability": 30, "lastDonationRecency": 30}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Hospitals, Blood Banks, and Donors in public.profiles (Using mock IDs)
-- In production, these records are inserted when users sign up via Supabase Auth
-- Note: Replace placeholders with real auth UUIDs once users sign up.
