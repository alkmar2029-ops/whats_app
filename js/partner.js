/* ==========================================================================
   Partner Page — Earnings Calculator + Application Form (Supabase)
   ========================================================================== */
(function () {
  'use strict';

  // ---------- Helpers ----------
  const arabicDigit = (n) => {
    const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(n).replace(/\d/g, (d) => map[parseInt(d, 10)]);
  };

  const formatSAR = (n) => {
    const rounded = Math.round(n);
    const withCommas = rounded.toLocaleString('en-US');
    return arabicDigit(withCommas) + ' ر.س';
  };

  // ============== DASHBOARD TOUR TABS ==============
  const dashTabs = document.querySelectorAll('.dash-tab');
  const dashPanels = document.querySelectorAll('.dash-panel');

  dashTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.dashTab;
      dashTabs.forEach((t) => t.classList.remove('active'));
      dashPanels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.querySelector(`.dash-panel[data-dash-panel="${target}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  // ============== EARNINGS CALCULATOR ==============
  const slider = document.getElementById('brokers-per-month');
  const sliderValue = document.getElementById('brokers-value');
  const planButtons = document.querySelectorAll('.calc-option');
  const result1 = document.getElementById('result-month1');
  const result6 = document.getElementById('result-month6');
  const result12 = document.getElementById('result-month12');
  const resultYearly = document.getElementById('result-yearly');
  const videosValueEl = document.getElementById('videos-value');
  const totalValueEl = document.getElementById('total-value');

  let brokersPerMonth = 5;
  let avgPlan = 299;
  const COMMISSION_RATE = 0.30;
  const VIDEOS_PER_BROKER_PER_MONTH = 4;
  const VIDEO_MARKET_VALUE = 400;
  const CRM_VALUE_YEARLY = 12000;

  function calculate() {
    const month1Active = brokersPerMonth * 1;
    const month6Active = brokersPerMonth * 6;
    const month12Active = brokersPerMonth * 12;

    const month1Income = month1Active * avgPlan * COMMISSION_RATE;
    const month6Income = month6Active * avgPlan * COMMISSION_RATE;
    const month12Income = month12Active * avgPlan * COMMISSION_RATE;
    const yearlyTotal = brokersPerMonth * avgPlan * COMMISSION_RATE * 78;

    const totalVideos = brokersPerMonth * 78 * 4;
    const totalVideosValue = totalVideos * VIDEO_MARKET_VALUE;
    const totalPartnershipValue = yearlyTotal + CRM_VALUE_YEARLY + totalVideosValue;

    if (sliderValue)   sliderValue.textContent = arabicDigit(brokersPerMonth);
    if (result1)       result1.textContent = formatSAR(month1Income);
    if (result6)       result6.textContent = formatSAR(month6Income);
    if (result12)      result12.textContent = formatSAR(month12Income);
    if (resultYearly)  resultYearly.textContent = formatSAR(yearlyTotal);
    if (videosValueEl) videosValueEl.textContent = arabicDigit(Math.round(totalVideosValue / 1000));
    if (totalValueEl)  totalValueEl.textContent = '~ ' + formatSAR(totalPartnershipValue).replace(' ر.س', '') + ' ر.س';
  }

  if (slider) {
    slider.addEventListener('input', (e) => {
      brokersPerMonth = parseInt(e.target.value, 10);
      calculate();
    });
  }

  planButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      planButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      avgPlan = parseInt(btn.dataset.plan, 10);
      calculate();
    });
  });

  calculate();

  // ============== APPLICATION FORM (Supabase) ==============
  const form = document.getElementById('partner-application');
  const successPanel = document.getElementById('form-success');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  function showError(msg) {
    let banner = form.querySelector('.form-error-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'form-error-banner';
      banner.style.cssText = 'background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;padding:14px 18px;border-radius:10px;font-size:14px;margin-bottom:16px;text-align:center;';
      form.insertBefore(banner, form.firstChild);
    }
    banner.textContent = msg;
    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearError() {
    const banner = form?.querySelector('.form-error-banner');
    if (banner) banner.remove();
  }

  function whatsappFallback(data) {
    const cfg = window.WASL_CONFIG || {};
    const number = (cfg.WHATSAPP_NUMBER || '966500000000').replace(/\D/g, '');
    const text = encodeURIComponent(
      `مرحباً، أرغب في التقديم على شراكة وَصْل.ai\n\n` +
      `الاسم: ${data.fullName || ''}\n` +
      `الجوال: ${data.phone || ''}\n` +
      `المدينة: ${data.city || ''}\n` +
      `الخبرة: ${data.experience || ''}\n` +
      `حجم الشبكة: ${data.networkSize || ''}\n\n` +
      `الخلفية: ${data.background || ''}\n\n` +
      `لماذا أنا مناسب: ${data.why || ''}`
    );
    window.open(`https://wa.me/${number}?text=${text}`, '_blank', 'noopener');
  }

  if (form && successPanel) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError();

      const data = Object.fromEntries(new FormData(form).entries());

      const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="wasl-spinner"></span> جارٍ الإرسال...';
      }

      let supabaseResult = { ok: false, error: 'unconfigured' };
      if (window.WaslSupabase && window.WaslSupabase.isConfigured()) {
        try {
          supabaseResult = await window.WaslSupabase.submitPartnerApplication(data);
        } catch (err) {
          supabaseResult = { ok: false, error: err.message };
        }
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }

      if (supabaseResult.ok) {
        successPanel.hidden = false;
        successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try {
          localStorage.setItem(
            'wasl-partner-' + (supabaseResult.id || Date.now()),
            JSON.stringify({ ...data, submittedAt: new Date().toISOString() })
          );
        } catch (_) { /* ignore */ }
        setTimeout(() => whatsappFallback(data), 1200);
        return;
      }

      if (supabaseResult.error === 'config_missing' || supabaseResult.error === 'unconfigured') {
        try {
          localStorage.setItem(
            'wasl-partner-' + Date.now(),
            JSON.stringify({ ...data, submittedAt: new Date().toISOString(), via: 'localStorage' })
          );
        } catch (_) { /* ignore */ }
        successPanel.hidden = false;
        successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => whatsappFallback(data), 1200);
      } else {
        showError(supabaseResult.error || 'تعذر إرسال الطلب. حاول مرة أخرى أو تواصل عبر واتساب.');
      }
    });
  }

  if (!document.getElementById('wasl-spin-style')) {
    const s = document.createElement('style');
    s.id = 'wasl-spin-style';
    s.textContent = '.wasl-spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:wasl-spin 0.8s linear infinite;vertical-align:middle;margin-left:6px}@keyframes wasl-spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
})();
