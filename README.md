# وَصْل.ai — Landing Pages (Investor + Partner)

صفحتا هبوط احترافيتان مرتبطتان بقاعدة Supabase جديدة لاستقبال طلبات المستثمرين والمسوّقين.

## 📁 محتوى المجلد

```
whats_app/
├── investor.html            ← صفحة المستثمر (100K SAR / 16.7%)
├── partner.html             ← صفحة الـ 15 مسوّق (CRM + فيديوهات + 30%)
├── css/
│   ├── styles.css          ← الأنماط الأساسية (مشتركة)
│   └── pages.css           ← أنماط الصفحتين الجديدتين
├── js/
│   ├── config.js           ← ⚠️ ضع هنا بيانات Supabase الجديدة
│   ├── supabase-client.js  ← مكتبة استدعاء Supabase
│   ├── investor.js         ← منطق نموذج المستثمر
│   ├── partner.js          ← الحاسبة + نموذج المسوّق
│   └── main.js             ← scrolling, hamburger menu, animations
├── images/
│   ├── favicon.svg
│   └── og-cover.svg
└── supabase/
    └── 01_schema.sql       ← ⚠️ نفّذ هذا في Supabase الجديد
```

---

## 🚀 خطوات التشغيل (3 دقائق)

### 1. إنشاء مشروع Supabase جديد

1. روح [supabase.com/dashboard](https://supabase.com/dashboard)
2. اضغط **New Project**
3. اختر اسم (مثل `wasl-landing`) + كلمة مرور قاعدة بيانات
4. اختر منطقة قريبة (recommended: **Frankfurt** للسعودية)
5. انتظر دقيقة حتى يجهز المشروع

### 2. تشغيل Schema

1. في لوحة التحكم → **SQL Editor** → **New Query**
2. افتح ملف `supabase/01_schema.sql` والصق محتواه كاملاً
3. اضغط **Run** (أو Ctrl+Enter)
4. تحقق من ظهور: `Success. No rows returned` (أو رسالة نجاح)

### 3. الحصول على المفاتيح

1. **Settings** → **API**
2. انسخ:
   - **Project URL** (مثل: `https://abcdefgh.supabase.co`)
   - **anon / public key** (مفتاح طويل يبدأ بـ `eyJ...`)

### 4. تعديل config.js

افتح `js/config.js` والصق المفاتيح:

```js
window.WASL_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',           // ← هنا
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...',    // ← هنا
  WHATSAPP_NUMBER: '966500000000',                            // ← رقمك
  INVESTOR_EMAIL: 'invest@smartsapp.net'
};
```

### 5. تجربة محلياً

```bash
cd "C:\Users\basem\OneDrive\Desktop\whats_app"
python -m http.server 8080
```

ثم افتح:
- `http://localhost:8080/investor.html`
- `http://localhost:8080/partner.html`

عبّئ نموذجاً وأرسله — يجب أن يظهر سجل جديد في Supabase.

---

## 📊 متابعة الطلبات

### عبر لوحة Supabase
**Table Editor** → اختر:
- `partner_applications` لطلبات المسوقين
- `investor_inquiries` لطلبات المستثمرين

### عبر SQL سريع
```sql
-- عدد الطلبات الجديدة
SELECT * FROM v_partner_pipeline;
SELECT * FROM v_investor_pipeline;

-- آخر 10 طلبات شراكة
SELECT full_name, phone, city, network_size, submitted_at, status
FROM partner_applications
ORDER BY submitted_at DESC LIMIT 10;

-- تحديث حالة طلب
UPDATE partner_applications
SET status = 'shortlisted', notes = 'مكالمة جيدة جداً'
WHERE id = '<UUID>';
```

---

## 🛡️ الأمان (RLS)

- **anon key آمن للنشر** في الكود — لا يقدر يعمل غير `INSERT` فقط
- **Rate Limit مدمج**: 3 طلبات/24 ساعة لكل (إيميل + جوال)
- **CHECK constraints** تتحقق من صحة البيانات على مستوى DB
- **agreed_terms**: لازم `true` للقبول
- المالك يصل للبيانات من Supabase Dashboard فقط

---

## 🌐 النشر (Deployment)

### الخيار 1: Vercel (مجاني، الأسرع)
```bash
cd whats_app
npx vercel
```

### الخيار 2: Netlify Drop
اسحب المجلد كاملاً إلى [app.netlify.com/drop](https://app.netlify.com/drop)

### الخيار 3: GitHub Pages
1. أنشئ repo → ارفع المجلد
2. **Settings** → **Pages** → branch `main` → `/`

### الخيار 4: نفس Smartsapp.net
ارفع `investor.html` + `partner.html` + `css/` + `js/` + `images/` إلى:
- `smartsapp.net/investor.html`
- `smartsapp.net/partner.html`

---

## 🎬 ربط فيديو TikTok

في الـ Bio:
```
🎯 للمستثمرين: smartsapp.net/investor
💼 كن شريكاً (15 مقعد): smartsapp.net/partner
```

أو استخدم Linktree / Bio.link لإضافة الرابطين معاً.

---

## 📝 خلاصة الأرقام في الصفحتين

### للمستثمر:
- استثمار: **100,000 ر.س**
- الحصة: **16.7%**
- التقييم Pre-Money: **500,000 ر.س**
- العائد المتوقع: **5–7×** خلال **18 شهر**
- ARR متوقع نهاية السنة: **~1.9 مليون ر.س**

### للمسوّق (5 وسطاء/شهر، باقة Pro):
- دخل الشهر الأول: **449 ر.س**
- دخل الشهر الـ12: **5,382 ر.س**
- إجمالي السنة: **34,983 ر.س** نقداً
- + قيمة CRM والفيديوهات: **~636,000 ر.س**
- **القيمة الإجمالية: ~671,000 ر.س** للسنة الأولى

---

## ❓ مشاكل شائعة

| المشكلة | الحل |
|---|---|
| النموذج يفتح واتساب فقط | تحقق أن `config.js` فيه URL + key صحيحة (مو `YOUR_PROJECT_REF`) |
| يرسل لكن لا يظهر في Supabase | تحقق من تنفيذ `01_schema.sql` كاملاً + RLS مفعّل |
| رسالة "تجاوزت الحد المسموح" | Rate limit نشط — انتظر 24 ساعة أو احذف السجل من `submission_rate_limit` |
| الأرقام لا تتحدث في الحاسبة | تحقق من تحميل `partner.js` — افتح Console (F12) |

---

## 🤝 رابط دعم
- WhatsApp: `+966 5XX XXX XXX` (حدّثه في `config.js`)
- Email: `invest@smartsapp.net`

© 2025 وَصْل.ai
