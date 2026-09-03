# 📱 WhatsApp Study & Islamic Motivation Bot (Meta Cloud API + Render + GitHub Actions)

একটি অত্যন্ত দ্রুত, নির্ভরযোগ্য ও অফিসিয়াল হোয়াটসঅ্যাপ বট যা **GitHub Actions** এর ক্রন দিয়ে প্রতি ৫ মিনিটে Render কে পিং দিয়ে জাগিয়ে রাখে এবং প্রতি ১ ঘণ্টা পরপর সম্পূর্ণ **ফ্রি AI** দিয়ে আকর্ষণীয় নতুন বাংলা স্টাডি ও ইসলামিক মোটিভেশন তৈরি করে **Meta WhatsApp Cloud API** এর মাধ্যমে সরাসরি আপনার **WhatsApp (01735698076)** এ পাঠিয়ে দেয়।

---

## 🌟 মোটিভেশনের ৬টি বিভাগ (MBBS সম্পূর্ণ বাদ):
1. **ISLAMIC 🌙** — ইলম অন্বেষণ, নিয়তের বিশুদ্ধতা, সবর, তাওয়াক্কুল ও হাদিস-কুরআনের বাণী।
2. **STUDY 📚** — পড়াশোনায় একাগ্রতা, কঠোর পরিশ্রম, অধ্যবসায় ও লক্ষ্য অর্জন।
3. **STUDYTIPS 💡** — স্মার্ট স্টাডি টেকনিক (অ্যাক্টিভ রিকল, পোমোডোরো, নোট মেকিং)।
4. **FOCUS 🎯** — মোবাইল আসক্তি দূরীকরণ, সোশ্যাল মিডিয়া বর্জন ও গভীর মনোযোগ।
5. **HEALTH 🧘** — ব্রেইনের জ্বালানি পানি ও ঘুম, চোখের যত্ন ও মানসিক ক্লান্তি দূর করা।
6. **SCHOLARS 🏛️** — ইমাম বুখারী, ইমাম শাফেয়ী, ইমাম গাজ্জালী, ইবনে সিনা ও বিশিষ্ট মনীষীদের উপদেশ।

---

## ⚡ যেভাবে স্বয়ংক্রিয়ভাবে কাজ করে:

```
[GitHub Actions (Keepalive)] ➔ প্রতি ৫ মিনিটে Render /ping করে জাগিয়ে রাখে
[GitHub Actions (Hourly)]    ➔ প্রতি ১ ঘণ্টায় Render /send ট্রিগার করে
                │
                ▼
         [Render.com Web Service]
                │
                ▼ (ফ্রি AI থেকে সম্পূর্ণ নতুন বাংলা মোটিভেশন জেনারেট করে)
         [Free AI (Pollinations / Gemini)]
                │
                ▼ (অফিসিয়াল Meta WhatsApp Cloud API)
         [আপনার WhatsApp: 01735698076 📲]
```

---

## 🔑 মেটা ক্লাউড এপিআই (Meta WhatsApp Cloud API) সেটআপ (২ মিনিট):

1. [developers.facebook.com](https://developers.facebook.com) এ গিয়ে লগইন করে একটি নতুন অ্যাপ তৈরি করুন (App Type: **Other** বা **Business**)।
2. অ্যাপে **WhatsApp** প্রোডাক্টটি যুক্ত করুন।
3. **API Setup** পেজে যান:
   - **Temporary access token**: এখান থেকে টোকেনটি কপি করুন (বা পার্মানেন্ট সিস্টেম ইউজার টোকেন নিন)।
   - **Phone number ID**: এটি কপি করুন।
   - **To (Recipient)**: আপনার নম্বর `8801735698076` ভেরিফাই করে নিন (একটি ওটিপি আসবে)।

---

## 🚀 Render.com এ ডিপ্লয়মেন্ট:

1. [Render.com](https://render.com) এ আপনার `kdhbudakhilmadrasa-cloud/motivation` রিপোজিটরি যুক্ত করুন।
2. **Environment Variables** এ এই মানগুলো দিন:
   - `WHATSAPP_TOKEN` : মেটা থেকে পাওয়া অ্যাক্সেস টোকেন
   - `PHONE_NUMBER_ID` : মেটার ফোন নম্বর আইডি
   - `RECIPIENT_PHONE` : `01735698076`
   - *(ঐচ্ছিক)* `GEMINI_API_KEY` : গুগল জেমিনাই এর ফ্রি কি থাকলে দিতে পারেন, না দিলেও স্বয়ংক্রিয়ভাবে ফ্রি Pollinations AI কাজ করবে!
3. **Save Changes** চাপুন।

---

## 📂 ফাইলসমূহ:
- `.github/workflows/keepalive.yml` : প্রতি ৫ মিনিটে Render কে পিং দিয়ে ঘুমোতে দেয় না।
- `.github/workflows/hourly.yml` : প্রতি ১ ঘণ্টায় নতুন মোটিভেশন তৈরি করে পাঠায়।
- `server.js` : ফ্রি AI কল করা এবং Meta Cloud API দিয়ে সরাসরি WhatsApp এ পাঠানোর মূল নোড সার্ভার।
