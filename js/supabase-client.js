/* ==========================================================================
   وَصْل.ai — Lightweight Supabase REST client
   No external dependencies. Calls the auto-generated PostgREST endpoints.
   ========================================================================== */

(function () {
  'use strict';

  const cfg = window.WASL_CONFIG || {};

  const isConfigured = () => {
    return cfg.SUPABASE_URL
      && cfg.SUPABASE_ANON_KEY
      && !cfg.SUPABASE_URL.includes('YOUR_PROJECT_REF')
      && !cfg.SUPABASE_ANON_KEY.includes('YOUR_ANON_PUBLIC_KEY');
  };

  /**
   * Call a Postgres RPC function.
   * @param {string} fnName - Function name registered in Supabase (public schema).
   * @param {object} params - Function arguments.
   * @returns {Promise<{ok: boolean, data?: any, error?: string}>}
   */
  async function rpc(fnName, params) {
    if (!isConfigured()) {
      return { ok: false, error: 'config_missing' };
    }

    try {
      const res = await fetch(
        `${cfg.SUPABASE_URL}/rest/v1/rpc/${fnName}`,
        {
          method: 'POST',
          headers: {
            'apikey': cfg.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${cfg.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(params)
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { ok: false, error: json.message || `HTTP ${res.status}` };
      }

      // RPC returned { ok, id?, error? } JSON object
      if (json && typeof json === 'object' && 'ok' in json) {
        return json;
      }

      return { ok: true, data: json };
    } catch (err) {
      return { ok: false, error: err.message || 'network_error' };
    }
  }

  // Public helpers
  window.WaslSupabase = {
    isConfigured,

    submitPartnerApplication(data) {
      return rpc('submit_partner_application', {
        p_full_name:    data.fullName    || '',
        p_phone:        data.phone       || '',
        p_email:        data.email       || '',
        p_city:         data.city        || '',
        p_experience:   data.experience  || '',
        p_network_size: data.networkSize || '',
        p_background:   data.background  || '',
        p_why_suitable: data.why         || '',
        p_agreed_terms: data.commit === 'on' || data.commit === true,
        p_user_agent:   navigator.userAgent || ''
      });
    },

    submitInvestorInquiry(data) {
      return rpc('submit_investor_inquiry', {
        p_full_name:           data.fullName    || '',
        p_phone:               data.phone       || '',
        p_email:               data.email       || '',
        p_company:             data.company     || '',
        p_investment_capacity: data.capacity    || '',
        p_message:             data.message     || '',
        p_preferred_time:      data.preferredTime || '',
        p_user_agent:          navigator.userAgent || ''
      });
    }
  };
})();
