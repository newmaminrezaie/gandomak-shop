# استقرار گندمک شاپ روی VPS

این پروژه دو بخش دارد:

1. **فرانت‌اند (React)** — این مخزن. خروجی استاتیک در `dist/` تولید می‌شود.
2. **بک‌اند (Node/Express + Zarinpal)** — پوشهٔ `server/`.

---

## ۱) ساخت فرانت‌اند

```bash
npm install
npm run build
# خروجی: dist/
```

سپس محتوای `dist/` را روی VPS در مسیری مانند `/var/www/gandomak` کپی کنید.

> 📷 **عکس محصولات**: تصاویر هاردکدشده در `src/data/products.ts` به مسیر `/images/<file>.webp` اشاره می‌کنند. روی VPS، فایل‌ها را در `/var/www/gandomak/images/` قرار دهید.

---

## ۲) اجرای بک‌اند (Zarinpal)

```bash
cd server
npm install
cp .env.example .env
# .env را ویرایش کنید:
#   ZARINPAL_MERCHANT_ID=کد-مرچنت-شما
#   CALLBACK_URL=https://gandomakshop.ir/payment/callback
#   ZARINPAL_SANDBOX=false
node index.js
# یا با pm2:
# pm2 start index.js --name gandomak-api
# pm2 save
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
    server_name gandomakshop.ir;

    # SSL ...
    # ssl_certificate     /etc/letsencrypt/live/gandomakshop.ir/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/gandomakshop.ir/privkey.pem;

    root /var/www/gandomak;
    index index.html;

    # API → Express
    location /api/ {
        proxy_pass http://127.0.0.1:8787;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # تصاویر و استاتیک‌ها
    location /images/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

پس از تغییر فایل‌های `.env` در `server/`، فرایند را با `pm2 restart gandomak-api` ری‌استارت کنید.

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

و `dist/` را روی VPS جایگزین کنید. اگر قیمت تغییر کرد، **حتماً** `server/products.mirror.js` را هم به‌روزرسانی کنید (بک‌اند جمع را خودش از این فایل محاسبه می‌کند).
