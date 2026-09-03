# 📱 WhatsApp Study & Islamic Motivation Bot (Direct WhatsApp Web QR Login)

কোনো **API**, **ফেসবুক ডেভেলপার অ্যাকাউন্ট**, **টোকেন** বা **CallMeBot** ছাড়াই — কম্পিউটারে যেভাবে WhatsApp Web লগইন করেন, ঠিক সেভাবেই **QR Code স্ক্যান করে সরাসরি WhatsApp কানেক্ট করুন**!

---

## 🌟 মোটিভেশনের ৬টি বিভাগ (MBBS সম্পূর্ণ বাদ):
1. **ISLAMIC 🌙** — ইলম অন্বেষণ, নিয়তের বিশুদ্ধতা, সবর, তাওয়াক্কুল ও হাদিস-কুরআনের বাণী।
2. **STUDY 📚** — পড়াশোনায় একাগ্রতা, কঠোর পরিশ্রম, অধ্যবসায় ও লক্ষ্য অর্জন।
3. **STUDYTIPS 💡** — স্মার্ট স্টাডি টেকনিক (অ্যাক্টিভ রিকল, পোমোডোরো, নোট মেকিং)।
4. **FOCUS 🎯** — মোবাইল আসক্তি দূরীকরণ, সোশ্যাল মিডিয়া বর্জন ও গভীর মনোযোগ।
5. **HEALTH 🧘** — ব্রেইনের জ্বালানি পানি ও ঘুম, চোখের যত্ন ও মানসিক ক্লান্তি দূর করা।
6. **SCHOLARS 🏛️** — ইমাম বুখারী, ইমাম শাফেয়ী, ইমাম গাজ্জালী, ইবনে সিনা ও বিশিষ্ট মনীষীদের উপদেশ।

---

## ⚡ যেভাবে কাজ করে:

```
[GitHub Actions (Keepalive)] ➔ প্রতি ৫ মিনিটে Render /ping করে জাগিয়ে রাখবে
[GitHub Actions (Hourly)]    ➔ প্রতি ১ ঘণ্টায় Render /send ট্রিগার করবে
                │
                ▼
         [Render.com Web Server]
                │
                ▼ (ফ্রি AI থেকে সম্পূর্ণ নতুন বাংলা মোটিভেশন জেনারেট করে)
         [Free AI (Pollinations / Gemini)]
                │
                ▼ (সরাসরি সকেট দিয়ে WhatsApp Web ডেলিভারি)
         [আপনার WhatsApp: 01735698076 📲]
```

---

## 📱 কীভাবে লগইন করবেন (কোনো API নেই!):

1. আপনার Render অ্যাপের লিঙ্কে যান (যেমন: `https://motivation-042y.onrender.com`) বা লোকালহোস্টে `http://localhost:3000`।
2. স্ক্রিনে একটি **WhatsApp QR Code** ভেসে উঠবে।
3. আপনার মোবাইলে **WhatsApp** খুলুন ➔ **Linked devices** ➔ **Link a device** চাপুন।
4. স্ক্রিনের QR কোডটি স্ক্যান করে নিন!
5. স্ক্যান হওয়ার সাথে সাথেই স্ক্রিনে ভেসে উঠবে: **"✅ WhatsApp সংযুক্ত আছে (+8801735698076)"**।

---

## 🚀 Render.com এ ডিপ্লয়মেন্ট:

1. [Render.com](https://render.com) এ আপনার `kdhbudakhilmadrasa-cloud/motivation` রিপোজিটরি যুক্ত করুন।
2. সেটিংস দিন:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
3. **Environment Variables**:
   - `RECIPIENT_PHONE` : `01735698076`
   - *(ঐচ্ছিক)* `GEMINI_API_KEY` : গুগল জেমিনাই এর ফ্রি কি থাকলে দিতে পারেন, না দিলেও স্বয়ংক্রিয়ভাবে ফ্রি Pollinations AI কাজ করবে!
4. **Create Web Service** চাপুন।

---

## 📂 ফাইলসমূহ:
- `.github/workflows/keepalive.yml` : প্রতি ৫ মিনিটে Render কে পিং দিয়ে ঘুমোতে দেয় না।
- `.github/workflows/hourly.yml` : প্রতি ১ ঘণ্টায় নতুন মোটিভেশন তৈরি করে পাঠায়।
- `server.js` : Baileys দিয়ে সরাসরি WhatsApp Web QR কোড লগইন ও ফ্রি AI মোটিভেশন ডিসপ্যাচ।
