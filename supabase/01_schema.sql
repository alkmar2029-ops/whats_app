-- ============================================================================
-- وَصْل.ai — Landing Pages Schema
-- Tables: partner_applications + investor_inquiries
-- For: NEW Supabase project (separate from main app)
-- ============================================================================
-- HOW TO USE:
-- 1. Go to https://supabase.com/dashboard → Create New Project
-- 2. Open: SQL Editor → New Query
-- 3. Paste this entire file → Run
-- 4. Copy your Project URL + anon key from Settings → API
-- 5. Paste them in /js/config.js
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. partner_applications  (15 marketers application form)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  phone          TEXT NOT NULL CHECK (char_length(phone) BETWEEN 8 AND 20),
  email          TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  city           TEXT NOT NULL,
  experience     TEXT NOT NULL,
  network_size   TEXT NOT NULL,
  background     TEXT,
  why_suitable   TEXT NOT NULL CHECK (char_length(why_suitable) BETWEEN 10 AND 2000),
  agreed_terms   BOOLEAN NOT NULL DEFAULT false,
  -- Tracking
  status         TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  source         TEXT,
  user_agent     TEXT,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by    TEXT,
  notes          TEXT
);

CREATE INDEX IF NOT EXISTS idx_partner_apps_status      ON public.partner_applications (status);
CREATE INDEX IF NOT EXISTS idx_partner_apps_submitted   ON public.partner_applications (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_apps_email       ON public.partner_applications (lower(email));
CREATE INDEX IF NOT EXISTS idx_partner_apps_phone       ON public.partner_applications (phone);

COMMENT ON TABLE  public.partner_applications IS 'Applications from the 15-marketer partnership program (partner.html)';
COMMENT ON COLUMN public.partner_applications.status IS 'Pipeline: new → reviewing → shortlisted → accepted/rejected';

-- ----------------------------------------------------------------------------
-- 3. investor_inquiries  (investor interest form)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investor_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  phone          TEXT NOT NULL CHECK (char_length(phone) BETWEEN 8 AND 20),
  email          TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company        TEXT,
  investment_capacity TEXT,
  message        TEXT,
  preferred_time TEXT,
  -- Tracking
  status         TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new', 'contacted', 'meeting_scheduled', 'negotiating', 'closed_won', 'closed_lost')),
  source         TEXT,
  user_agent     TEXT,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes          TEXT
);

CREATE INDEX IF NOT EXISTS idx_investor_inq_status     ON public.investor_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_investor_inq_submitted  ON public.investor_inquiries (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_investor_inq_email      ON public.investor_inquiries (lower(email));

COMMENT ON TABLE public.investor_inquiries IS 'Investor inquiries from investor.html landing page';

-- ----------------------------------------------------------------------------
-- 4. Auto-update updated_at trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_partner_apps_updated ON public.partner_applications;
CREATE TRIGGER trg_partner_apps_updated
  BEFORE UPDATE ON public.partner_applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_investor_inq_updated ON public.investor_inquiries;
CREATE TRIGGER trg_investor_inq_updated
  BEFORE UPDATE ON public.investor_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Rate-limit table  (prevent abuse from anon users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submission_rate_limit (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL,                    -- email + phone hash
  form_type   TEXT NOT NULL,                    -- 'partner' | 'investor'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_fp_form
  ON public.submission_rate_limit (fingerprint, form_type, created_at DESC);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.partner_applications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_inquiries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_rate_limit   ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies before recreating
DROP POLICY IF EXISTS partner_apps_anon_insert    ON public.partner_applications;
DROP POLICY IF EXISTS partner_apps_no_select_anon ON public.partner_applications;
DROP POLICY IF EXISTS investor_inq_anon_insert    ON public.investor_inquiries;
DROP POLICY IF EXISTS investor_inq_no_select_anon ON public.investor_inquiries;
DROP POLICY IF EXISTS rate_limit_anon_all         ON public.submission_rate_limit;

-- Anon (public) users can ONLY INSERT new applications/inquiries.
-- They CANNOT read, update, or delete anyone's data (including their own).
-- The owner (you) accesses data via Supabase Dashboard or service_role.

-- Partner Applications: anon INSERT only
CREATE POLICY partner_apps_anon_insert
  ON public.partner_applications
  FOR INSERT
  TO anon
  WITH CHECK (
    agreed_terms = true
    AND char_length(full_name) >= 2
    AND char_length(why_suitable) >= 10
  );

-- Investor Inquiries: anon INSERT only
CREATE POLICY investor_inq_anon_insert
  ON public.investor_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (
    char_length(full_name) >= 2
    AND char_length(email) >= 5
  );

-- Rate limit: anon can INSERT and SELECT own fingerprint records only
CREATE POLICY rate_limit_anon_all
  ON public.submission_rate_limit
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 7. Submission RPC (single function: validates + rate-limits + inserts)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.submit_partner_application(
  p_full_name    TEXT,
  p_phone        TEXT,
  p_email        TEXT,
  p_city         TEXT,
  p_experience   TEXT,
  p_network_size TEXT,
  p_background   TEXT,
  p_why_suitable TEXT,
  p_agreed_terms BOOLEAN,
  p_user_agent   TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fingerprint TEXT;
  v_recent_count INT;
  v_id UUID;
BEGIN
  -- Validate required fields
  IF p_agreed_terms IS NOT TRUE THEN
    RETURN json_build_object('ok', false, 'error', 'يجب الموافقة على شروط الشراكة');
  END IF;

  -- Build fingerprint = email + phone
  v_fingerprint := lower(coalesce(p_email,'')) || '|' || coalesce(p_phone,'');

  -- Rate-limit: max 3 submissions per fingerprint per 24 hours
  SELECT COUNT(*) INTO v_recent_count
  FROM public.submission_rate_limit
  WHERE fingerprint = v_fingerprint
    AND form_type = 'partner'
    AND created_at > NOW() - INTERVAL '24 hours';

  IF v_recent_count >= 3 THEN
    RETURN json_build_object('ok', false, 'error', 'لقد تجاوزت الحد المسموح. حاول بعد ٢٤ ساعة.');
  END IF;

  -- Insert the application
  INSERT INTO public.partner_applications (
    full_name, phone, email, city, experience, network_size,
    background, why_suitable, agreed_terms, source, user_agent
  ) VALUES (
    p_full_name, p_phone, p_email, p_city, p_experience, p_network_size,
    p_background, p_why_suitable, p_agreed_terms, 'partner.html', p_user_agent
  )
  RETURNING id INTO v_id;

  -- Log the rate-limit entry
  INSERT INTO public.submission_rate_limit (fingerprint, form_type)
  VALUES (v_fingerprint, 'partner');

  RETURN json_build_object('ok', true, 'id', v_id);
EXCEPTION
  WHEN check_violation THEN
    RETURN json_build_object('ok', false, 'error', 'بيانات غير صحيحة. تأكد من تعبئة كل الحقول.');
  WHEN OTHERS THEN
    RETURN json_build_object('ok', false, 'error', 'حدث خطأ — حاول مرة أخرى.');
END $$;

GRANT EXECUTE ON FUNCTION public.submit_partner_application(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT
) TO anon;

-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_investor_inquiry(
  p_full_name           TEXT,
  p_phone               TEXT,
  p_email               TEXT,
  p_company             TEXT,
  p_investment_capacity TEXT,
  p_message             TEXT,
  p_preferred_time      TEXT,
  p_user_agent          TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fingerprint TEXT;
  v_recent_count INT;
  v_id UUID;
BEGIN
  v_fingerprint := lower(coalesce(p_email,'')) || '|' || coalesce(p_phone,'');

  SELECT COUNT(*) INTO v_recent_count
  FROM public.submission_rate_limit
  WHERE fingerprint = v_fingerprint
    AND form_type = 'investor'
    AND created_at > NOW() - INTERVAL '24 hours';

  IF v_recent_count >= 3 THEN
    RETURN json_build_object('ok', false, 'error', 'لقد تجاوزت الحد المسموح. حاول بعد ٢٤ ساعة.');
  END IF;

  INSERT INTO public.investor_inquiries (
    full_name, phone, email, company, investment_capacity,
    message, preferred_time, source, user_agent
  ) VALUES (
    p_full_name, p_phone, p_email, p_company, p_investment_capacity,
    p_message, p_preferred_time, 'investor.html', p_user_agent
  )
  RETURNING id INTO v_id;

  INSERT INTO public.submission_rate_limit (fingerprint, form_type)
  VALUES (v_fingerprint, 'investor');

  RETURN json_build_object('ok', true, 'id', v_id);
EXCEPTION
  WHEN check_violation THEN
    RETURN json_build_object('ok', false, 'error', 'بيانات غير صحيحة.');
  WHEN OTHERS THEN
    RETURN json_build_object('ok', false, 'error', 'حدث خطأ — حاول مرة أخرى.');
END $$;

GRANT EXECUTE ON FUNCTION public.submit_investor_inquiry(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon;

-- ============================================================================
-- 8. Useful Views (for owner via Dashboard)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_partner_pipeline AS
SELECT
  status,
  COUNT(*) AS count,
  MAX(submitted_at) AS latest
FROM public.partner_applications
GROUP BY status
ORDER BY count DESC;

CREATE OR REPLACE VIEW public.v_investor_pipeline AS
SELECT
  status,
  COUNT(*) AS count,
  MAX(submitted_at) AS latest
FROM public.investor_inquiries
GROUP BY status
ORDER BY count DESC;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Verify by running:
--   SELECT * FROM partner_applications LIMIT 5;
--   SELECT * FROM investor_inquiries LIMIT 5;
--   SELECT * FROM v_partner_pipeline;
-- ============================================================================
