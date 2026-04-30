/* ==========================================================================
   Investor Page — Inquiry Form (Supabase)
   ========================================================================== */
(function () {
  'use strict';

  const form = document.getElementById('investor-inquiry');
  const successPanel = document.getElementById('inv-form-success');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const waBtn = document.getElementById('inv-wa-btn');

  // Wire WhatsApp link to use config (so user can change number in one place)
  if (waBtn && window.WASL_CONFIG && window.WASL_CONFIG.WHATSAPP_NUMBER) {
    const num = window.WASL_CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '');
    const txt = encodeURIComponent('مرحباً، أرغب في معرفة تفاصيل أكثر عن فرصة الاستثمار في وَصْل.ai');
    waBtn.href = `https://wa.me/${num}?text=${txt}`;
  }

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
      `مرحباً، أرغب بمعرفة تفاصيل فرصة الاستثمار في وَصْل.ai\n\n` +
      `الاسم: ${data.fullName || ''}\n` +
      `الجوال: ${data.phone || ''}\n` +
      `الإيميل: ${data.email || ''}\n` +
      `الشركة: ${data.company || ''}\n` +
      `الطاقة الاستثمارية: ${data.capacity || ''}\n` +
      `الوقت المفضل: ${data.preferredTime || ''}\n\n` +
      `الرسالة: ${data.message || ''}`
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
          supabaseResult = await window.WaslSupabase.submitInvestorInquiry(data);
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
            'wasl-investor-' + (supabaseResult.id || Date.now()),
            JSON.stringify({ ...data, submittedAt: new Date().toISOString() })
          );
        } catch (_) { /* ignore */ }
        setTimeout(() => whatsappFallback(data), 1200);
        return;
      }

      if (supabaseResult.error === 'config_missing' || supabaseResult.error === 'unconfigured') {
        try {
          localStorage.setItem(
            'wasl-investor-' + Date.now(),
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
