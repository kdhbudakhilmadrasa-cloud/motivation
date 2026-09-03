# 📱 WhatsApp Study & Islamic Motivation Bot (GitHub Actions + Render)

একটি সম্পূর্ণ আধুনিক ও স্বয়ংক্রিয় হোয়াটসঅ্যাপ বট যা **GitHub Actions** এর ক্রন দিয়ে প্রতি ১ ঘণ্টা পরপর Render কে ওয়েকআপ পিং দিয়ে জাগিয়ে তোলে, সম্পূর্ণ **ফ্রি AI** দিয়ে আকর্ষণীয় নতুন বাংলা স্টাডি ও ইসলামিক মোটিভেশন তৈরি করে এবং সরাসরি আপনার **WhatsApp** এ পাঠিয়ে দেয়।

---

## 🌟 মোটিভেশনের ৬টি বিভাগ (MBBS সম্পূর্ণ বাদ):
1. **ISLAMIC 🌙** — ইলম অন্বেষণ, নিয়তের বিশুদ্ধতা, সবর, তাওয়াক্কুল ও হাদিস-কুরআনের বাণী।
2. **STUDY 📚** — পড়াশোনায় একাগ্রতা, কঠোর পরিশ্রম, অধ্যবসায় ও লক্ষ্য অর্জন।
3. **STUDYTIPS 💡** — স্মার্ট স্টাডি টেকনিক (অ্যাক্টিভ রিকল, পোমোডোরো, নোট মেকিং)।
4. **FOCUS 🎯** — মোবাইল আসক্তি দূরীকরণ, সোশ্যাল মিডিয়া ডিটক্স ও গভীর মনোযোগ।
5. **HEALTH 🧘** — ব্রেইনের জ্বালানি পানি ও ঘুম, চোখের যত্ন ও মানসিক ক্লান্তি দূর করা।
6. **SCHOLARS 🏛️** — ইমাম বুখারী, ইমাম শাফেয়ী, ইমাম গাজ্জালী, ইবনে সিনা ও বিশিষ্ট মনীষীদের উপদেশ।

---

## ⚡ যেভাবে স্বয়ংক্রিয়ভাবে কাজ করে (Architecture):

```
[GitHub Actions (প্রতি ১ ঘণ্টার ক্রন ট্রিগার)]
                │
                ▼ (১. /ping পাঠিয়ে Render কে ঘুম থেকে জাগায়)
         [Render.com Server]
                │
                ▼ (২. ফ্রি AI কল করে আনলিমিটেড নতুন মোটিভেশন বানায়)
         [Free AI (Pollinations / Gemini)]
                │
                ▼ (৩. WhatsApp API হয়ে মেসেজ ডেলিভারি)
          [আপনার WhatsApp 📲]
```

---

## 🚀 সেটআপ করার সহজ ৩টি ধাপ:

### ধাপ ১: GitHub রিপোজিটরিতে কোড পুশ করা
আপনার রিপোজিটরি: `https://github.com/kdhbudakhilmadrasa-cloud/motivation`

আপনার টার্মিনালে এই কমান্ডগুলো চালিয়ে দিন:
```bash
git init
git add .
git commit -m "WhatsApp Hourly Motivation with Free AI and GitHub Actions"
git branch -M main
git remote add origin https://github.com/kdhbudakhilmadrasa-cloud/motivation.git
git push -u origin main --force
```

---

### ধাপ ২: Render.com এ ডিপ্লয় করা
1. [Render.com](https://render.com) এ লগইন করুন।
2. **New +** ➔ **Web Service** সিলেক্ট করে আপনার `kdhbudakhilmadrasa-cloud/motivation` রিপোজিটরিটি যুক্ত করুন।
3. সেটিংস দিন:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
4. নিচে **Environment Variables** এ গিয়ে ২টি মান যুক্ত করুন:
   - `WHATSAPP_PHONE` : আপনার ফোন নম্বর (যেমন: `88017XXXXXXXX`)
   - `CALLMEBOT_APIKEY` : আপনার CallMeBot থেকে পাওয়া API Key (WhatsApp এ `+34 644 44 49 64` নম্বরে `I allow callmebot to send me messages` লিখলে বিনামূল্যে পাওয়া যায়)।
   - *(ঐচ্ছিক)* `GEMINI_API_KEY`: আপনার গুগল জেমিনাই কি থাকলে দিতে পারেন, না দিলেও স্বয়ংক্রিয় ফ্রি Pollinations AI কাজ করবে!
5. **Create Web Service** এ ক্লিক করুন। ডিপ্লয় শেষে আপনি একটি URL পাবেন (যেমন: `https://motivation-042y.onrender.com`)।

---

### ধাপ ৩: GitHub Actions অন করা
১. আপনার GitHub রিপোজিটরির **Actions** ট্যাবে যান।
২. ওয়ার্কফ্লো দেখতে পাবেন: **`Hourly WhatsApp Motivation Trigger`**।
৩. সেখানে **Run workflow** বাটনে চাপ দিয়ে তাৎক্ষণিক একটি মেসেজ টেস্ট করতে পারবেন!
৪. এরপর এটি প্রতি ১ ঘণ্টা পরপর স্বয়ংক্রিয়ভাবে চলবে।

> 💡 **নোট:** আপনার Render URL যদি আলাদা হয়, তবে GitHub রিপোর **Settings ➔ Secrets and variables ➔ Actions** এ গিয়ে `RENDER_URL` নামের একটি ভ্যারিয়েবল বানিয়ে আপনার রেন্ডার লিঙ্কটি দিয়ে দিতে পারেন।

---

## 📂 প্রজেক্টের ফাইল পরিচিতি:
- `.github/workflows/hourly.yml` : প্রতি ১ ঘণ্টার ক্রন ও ওয়েকআপ পিং ট্রিগার।
- `server.js` : ফ্রি AI কল করা এবং WhatsApp এ মেসেজ পাঠানোর মূল নোড সার্ভার।
- `package.json` : ডিপেন্ডেন্সি তালিকা (Express & Dotenv)।
- `render.yaml` : রেন্ডার কনফিগারেশন।
