require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PHONE = process.env.WHATSAPP_PHONE;
const APIKEY = process.env.CALLMEBOT_APIKEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// ৬টি ক্যাটাগরি (MBBS সম্পূর্ণ বাদ দেওয়া হয়েছে)
const CATEGORIES = [
  { id: 'ISLAMIC', label: 'ইসলামিক ও ইলম 🌙', desc: 'ইলম অন্বেষণ, নিয়তের বিশুদ্ধতা, সবর ও হাদিস-কুরআনের বাণী' },
  { id: 'STUDY', label: 'পড়াশোনা ও অধ্যবসায় 📚', desc: 'অধ্যবসায়, অলসতা দূরীকরণ ও লক্ষ্য অর্জন' },
  { id: 'STUDYTIPS', label: 'স্মার্ট স্টাডি টিপস 💡', desc: 'অ্যাক্টিভ রিকল, পোমোডোরো, নোট মেকিং' },
  { id: 'FOCUS', label: 'ডিপ ফোকাস ও ডিটক্স 🎯', desc: 'মোবাইল আসক্তি দূরীকরণ, সোশ্যাল মিডিয়া বর্জন ও গভীর মনোযোগ' },
  { id: 'HEALTH', label: 'স্বাস্থ্য ও ঘুম 🧘', desc: 'ব্রেইনের জ্বালানি পানি ও ঘুম, চোখের যত্ন ও স্ট্রেচিং' },
  { id: 'SCHOLARS', label: 'মনীষীদের উক্তি 🏛️', desc: 'ইমাম বুখারী, ইমাম শাফেয়ী, ইমাম গাজ্জালী, ইবনে সিনা ও স্কলারদের উপদেশ' }
];

let categoryIndex = 0;

/**
 * ১. ফ্রি AI (Gemini বা Pollinations) দিয়ে বাংলা স্টাডি মোটিভেশন জেনারেট করা
 */
async function generateAIMotivation(category) {
  const prompt = 
    `You are an empathetic Bengali academic mentor and Islamic scholar.
Write a powerful, short study motivation in pure Bangla for students focusing on: ${category.label} (${category.desc}).
Requirements:
1. Readable in 30-50 seconds (around 60-90 words).
2. Structure:
   📌 শিরোনাম
   মূল বক্তব্য (সহজ, সাবলীল ও গভীর অনুপ্রেরণামূলক বাংলা)
   💡 আজকের ছোট অ্যাকশন টিপ (১টি বাস্তবসম্মত কাজ)
   💬 অনুপ্রেরণাদায়ী উক্তি বা হাদিস
3. Format nicely with emojis. DO NOT include MBBS or medical topics.
Reply ONLY with the formatted Bengali message, no introductory English text.`;

  // ক. যদি Gemini API Key থাকে, তবে Gemini 1.5 Flash ব্যবহার করো
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
    try {
      console.log('🤖 Asking Google Gemini AI...');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 450 }
        })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 20) {
        return text.trim();
      }
    } catch (err) {
      console.warn('⚠️ Gemini AI failed, falling back to Pollinations:', err.message);
    }
  }

  // খ. বিকল্প ১০০% ফ্রি AI (Pollinations AI - কোনো সাইনআপ বা কি ছাড়াই কাজ করে)
  try {
    console.log('🤖 Asking Free Pollinations AI...');
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`;
    const res = await fetch(url, { headers: { 'User-Agent': 'MotivationBot/1.0' } });
    const text = await res.text();
    if (text && text.trim().length > 20) {
      return text.trim();
    }
  } catch (err) {
    console.warn('⚠️ Pollinations AI failed:', err.message);
  }

  // গ. ব্যাকআপ মোটিভেশন (যদি ইন্টারনেট বা AI সার্ভারে সমস্যা হয়)
  return `📌 অধ্যবসায় ও নিয়তের বরকত\n\nপড়াশোনার প্রতিটি মুহূর্তকে আল্লাহর সন্তুষ্টির নিয়তে ব্যয় করো। অলসতাকে প্রশ্রয় দিও না; আজকের পরিশ্রমই আগামী দিনের বিজয়ের ভিত্তি।\n\n💡 আজকের টিপ: আগামী ১ ঘণ্টার জন্য ফোন 'ডু নট ডিস্টার্ব' মুডে রেখে পড়তে বসো।\n💬 'সময়ের মূল্যায়ন করো, কারণ অতীত সময় কখনো ফিরে আসে না।'`;
}

/**
 * হোয়াটসঅ্যাপের জন্য সুন্দর করে মেসেজ ফরম্যাট করা
 */
function formatWhatsAppText(category, aiContent) {
  const timeStr = new Date().toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka'
  });

  return [
    `🌟 *প্রতি ঘণ্টার স্টাডি মোটিভেশন* 🌟`,
    `━━━━━━━━━━━━━━━━━━`,
    `🏷️ *বিভাগ:* ${category.label}`,
    ``,
    aiContent,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `⏰ সময়: ${timeStr} | 🎯 ফোকাস ধরে রাখো!`
  ].join('\n');
}

/**
 * CallMeBot API এর মাধ্যমে WhatsApp এ পাঠানো
 */
async function sendToWhatsApp(messageText) {
  if (!PHONE || !APIKEY) {
    throw new Error('WHATSAPP_PHONE or CALLMEBOT_APIKEY is missing in Render environment variables.');
  }

  // Sanitize phone (e.g. +88017... -> 88017...)
  let cleanPhone = PHONE.trim().replace(/[\s\-\(\)\+]/g, '');
  const encodedText = encodeURIComponent(messageText);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${APIKEY.trim()}`;

  const res = await fetch(url);
  const text = await res.text();
  return text;
}

// 1. Health & Ping endpoints (GitHub Actions pings /ping to wake Render up if asleep)
app.get('/ping', (req, res) => {
  res.send('Render is awake and ready! 🚀');
});

// 2. Trigger endpoint (GitHub Actions calls this every 1 hour)
app.all('/send', async (req, res) => {
  console.log(`\n⏰ [${new Date().toISOString()}] Trigger received from GitHub Actions / cron!`);

  // বর্তমান ক্যাটাগরি নির্বাচন ও পরবর্তী ক্যাটাগরির জন্য ইনক্রিমেন্ট
  const category = CATEGORIES[categoryIndex % CATEGORIES.length];
  categoryIndex++;

  try {
    // ফ্রি AI দিয়ে আনলিমিটেড নতুন মোটিভেশন তৈরি
    const rawAiText = await generateAIMotivation(category);
    const formattedMessage = formatWhatsAppText(category, rawAiText);

    // WhatsApp এ পাঠানো
    const providerResult = await sendToWhatsApp(formattedMessage);
    console.log(`✅ Sent to WhatsApp successfully. Provider response: ${providerResult}`);

    res.json({
      success: true,
      category: category.label,
      sentAt: new Date().toISOString(),
      providerResponse: providerResult,
      preview: rawAiText
    });
  } catch (err) {
    console.error('❌ Failed to process motivation:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 3. Root status dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>WhatsApp Study Motivation Bot</title>
      <style>
        body { font-family: sans-serif; background: #0b0f19; color: #f1f5f9; padding: 2rem; text-align: center; }
        .card { background: #1e293b; max-width: 550px; margin: 2rem auto; padding: 2rem; border-radius: 16px; border: 1px solid #334155; }
        .btn { display: inline-block; background: #10b981; color: white; padding: 0.8rem 1.5rem; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 1rem; }
        .badge { background: rgba(16,185,129,0.2); color: #34d399; padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.85rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>🩺 WhatsApp Study Motivation Bot</h2>
        <p><span class="badge">Render Webhook Active</span></p>
        <p>GitHub Actions প্রতি ১ ঘণ্টা পরপর Render কে ওয়েকআপ পিং দিয়ে স্বয়ংক্রিয়ভাবে ফ্রি AI থেকে নতুন বাংলা মোটিভেশন তৈরি করে হোয়াটসঅ্যাপে পাঠাবে।</p>
        <p><strong>বিভাগসমূহ:</strong> ইসলামিক 🌙, পড়াশোনা 📚, স্টাডি টিপস 💡, ফোকাস 🎯, স্বাস্থ্য 🧘, মনীষী 🏛️ (MBBS বাদ দেওয়া হয়েছে)</p>
        <a href="/send" class="btn" target="_blank">🚀 এখনই টেস্ট মেসেজ পাঠান (/send)</a>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`🩺 Ping endpoint: http://localhost:${PORT}/ping`);
  console.log(`📤 Trigger endpoint: http://localhost:${PORT}/send`);
  console.log(`=========================================`);
});
