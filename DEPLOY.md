# استقرار گندمک شاپ روی VPS

این پروژه دو بخش دارد:

1. **فرانت‌اند (React)** — این مخزن. خروجی استاتیک در `dist/client/` تولید می‌شود.
2. **بک‌اند (Node/Express + Zarinpal)** — پوشهٔ `server/` (پیش‌فرض پورت **8787**).

---

## ۱) ساخت فرانت‌اند

```bash
npm install
npm run build
# خروجی: dist/client/
```

سپس محتوای `dist/client/` را روی VPS در مسیر `/var/www/gandomakshop/dist/client/` قرار دهید.

> 📷 **عکس محصولات**: تصاویر هاردکدشده در `src/data/products.ts` به مسیر `/images/<file>.webp` اشاره می‌کنند. روی VPS، فایل‌ها را در `/var/www/gandomakshop/dist/client/images/` قرار دهید.
>
> آپلود سریع:
> ```bash
> scp public/images/*.webp user@gandomakshop.ir:/var/www/gandomakshop/dist/client/images/
> ```

---

## ۲) اجرای بک‌اند (Zarinpal)

پورت پیش‌فرض در `server/index.js` و `server/.env.example` برابر **8787** است. اگر تغییرش دادید، حتماً بلاک `proxy_pass` در Nginx (پایین) را هم به‌روز کنید.

```bash
cd server
npm install
cp .env.example .env
# .env را ویرایش کنید:
#   ZARINPAL_MERCHANT_ID=کد-مرچنت-شما
#   CALLBACK_URL=https://gandomakshop.ir/payment/callback
#   ZARINPAL_SANDBOX=false
#   PORT=8787
node index.js
# یا با pm2:
# pm2 start index.js --name gandomak-api
# pm2 save
# pm2 startup    # برای اجرا در بوت
```

بررسی سلامت بک‌اند:
```bash
curl http://127.0.0.1:8787/api/health
# {"ok":true,"sandbox":false}
```

---

## ۳) پیکربندی Nginx

```nginx
server {
    listen 80;
    server_name gandomakshop.ir www.gandomakshop.ir;
    return 301 https://gandomakshop.ir$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gandomakshop.ir www.gandomakshop.ir;

    # SSL (Let's Encrypt یا گواهی داخلی)
    # ssl_certificate     /etc/letsencrypt/live/gandomakshop.ir/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/gandomakshop.ir/privkey.pem;

    # ریشه = خروجی build فرانت
    root /var/www/gandomakshop/dist/client;
    index index.html;

    # پراکسی API → Express (PM2 روی پورت 8787)
    location /api/ {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # کش طولانی برای استاتیک‌ها (تصاویر، فونت، JS، CSS)
    location ~* \.(webp|jpg|jpeg|png|svg|ico|woff2?|ttf|js|css)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback (React Router deep-links)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # امنیت ساده
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
```

پس از تغییر `.env` در `server/`، فرایند را ری‌استارت کنید:
```bash
pm2 restart gandomak-api
```

پس از تغییر کانفیگ Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## ۴) درگاه پرداخت

- در پنل Zarinpal، **آدرس بازگشت** را همان `CALLBACK_URL` قرار دهید.
- محصولات با `price: 0` در فروشگاه به‌صورت **«تماس بگیرید»** نمایش داده می‌شوند و در سفارش پرداختی محاسبه نمی‌شوند.
- مبالغ به **تومان** ذخیره می‌شوند و در بک‌اند به **ریال** (×۱۰) تبدیل می‌شوند.

---

## ۵) مدیریت محصولات

تمام محصولات در `src/data/products.ts`. برای افزودن/ویرایش، فقط همان فایل را ویرایش کنید، سپس:

```bash
npm run build
```

و محتوای `dist/client/` را روی VPS جایگزین کنید. اگر قیمت تغییر کرد، **حتماً** `server/products.mirror.js` را هم به‌روزرسانی کنید (بک‌اند جمع را خودش از این فایل محاسبه می‌کند، نه از سبد کلاینت).

---

## ۶) ساختار نهایی روی VPS

```
/var/www/gandomakshop/
├── dist/
│   └── client/              ← root در Nginx
│       ├── index.html
│       ├── assets/          ← JS/CSS با هش
│       └── images/          ← فایل‌های .webp محصولات
└── server/                  ← اختیاری: کلون مخزن یا فقط پوشهٔ server/
    ├── index.js             ← PM2: gandomak-api روی :8787
    ├── .env
    └── orders.json
```

---

## ۵) اعلان تلگرام برای سفارش‌های پرداخت‌شده

ربات: **@Gandomakshopbot**

روی VPS، فایل `server/.env` را ویرایش کنید و این دو خط را اضافه/به‌روزرسانی کنید:

```bash
nano /var/www/gandomakshop/server/.env
```

```
TELEGRAM_BOT_TOKEN=8742586804:AAHty8lsdLHazwlm2nLOchNsNuaNGqtFP-g
TELEGRAM_CHAT_ID=2143781867
```

> ⚠️ این توکن در چت لاو‌ایبل به‌اشتراک گذاشته شده است. توصیه می‌شود از طریق
> @BotFather → `/mybots` → Gandomakshopbot → **API Token → Revoke current token**
> یک توکن جدید بگیرید و همان را داخل `.env` بگذارید.

سپس بک‌اند را ری‌استارت کنید:

```bash
pm2 restart gandomak-api
pm2 logs gandomak-api --lines 30
```

تست سریع ارسال (باید پیامی در تلگرام دریافت کنید):

```bash
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d chat_id=${TELEGRAM_CHAT_ID} \
  -d text="✅ Gandomak notifier connected"
```

اگر پاسخ `{"ok":true,...}` بود و پیام را گرفتید، از این پس با هر سفارش پرداخت‌شدهٔ زیبال، خلاصهٔ سفارش به‌صورت خودکار به این چت ارسال می‌شود (تابع `notifyPaidOrder` در `server/telegram.js`).
