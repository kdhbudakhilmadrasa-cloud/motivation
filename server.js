require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Meta WhatsApp Cloud API Settings
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
let RECIPIENT_PHONE = (process.env.RECIPIENT_PHONE || '01735698076').trim().replace(/[\s\-\(\)\+]/g, '');
if (RECIPIENT_PHONE.startsWith('01') && RECIPIENT_PHONE.length === 11) {
  RECIPIENT_PHONE = '88' + RECIPIENT_PHONE; // 01735698076 -> 8801735698076
}

// Optional Google Gemini API Key (if blank, uses free Pollinations AI)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// ৬টি ক্যাটাগরি (MBBS সম্পূর্ণ বাদ)
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
 * ১. সম্পূর্ণ ফ্রি AI দিয়ে বাংলা স্টাডি মোটিভেশন জেনারেট করা
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

  // ক. Gemini API Key থাকলে Gemini ব্যবহার করো
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
      if (text && text.trim().length > 20) return text.trim();
    } catch (err) {
      console.warn('⚠️ Gemini AI failed, falling back to Pollinations:', err.message);
    }
  }

  // খ. বিকল্প ১০০% ফ্রি AI (Pollinations AI - কোনো কি ছাড়া সরাসরি কাজ করে)
  try {
    console.log('🤖 Asking Free Pollinations AI...');
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`;
    const res = await fetch(url, { headers: { 'User-Agent': 'MotivationBot/1.0' } });
    const text = await res.text();
    if (text && text.trim().length > 20) return text.trim();
  } catch (err) {
    console.warn('⚠️ Pollinations AI failed:', err.message);
  }

  // গ. ব্যাকআপ মোটিভেশন
  return `📌 অধ্যবসায় ও নিয়তের বরকত\n\nপড়াশোনার প্রতিটি মুহূর্তকে আল্লাহর সন্তুষ্টির নিয়তে ব্যয় করো। অলসতাকে প্রশ্রয় দিও না; আজকের পরিশ্রমই আগামী দিনের সাফল্যের মূল ভিত্তি।\n\n💡 আজকের টিপ: আগামী ১ ঘণ্টার জন্য মোবাইল দূরে রেখে পড়তে বসো।\n💬 'সময়ের মূল্যায়ন করো, কারণ অতীত সময় কখনো ফিরে আসে না।'`;
}

/**
 * হোয়াটসঅ্যাপের জন্য সুন্দর করে মেসেজ সাজানো
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
 * ২. অফিসিয়াল Meta WhatsApp Cloud API দিয়ে সরাসরি হোয়াটসঅ্যাপে পাঠানো
 */
async function sendToMetaWhatsApp(messageText) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_TOKEN or PHONE_NUMBER_ID is missing in Render environment variables.');
  }

  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: RECIPIENT_PHONE,
    type: 'text',
    text: { body: messageText }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || JSON.stringify(result));
  }

  return result;
}

// ১. ওয়েকআপ এন্ডপয়েন্ট (GitHub Actions প্রতি ৫ মিনিটে কল করে Render কে জাগিয়ে রাখবে)
app.get('/ping', (req, res) => {
  res.send('Render is awake and ready! 🚀');
});

// ২. মূল ট্রিগার এন্ডপয়েন্ট (GitHub Actions প্রতি ১ ঘণ্টায় কল করবে)
app.all('/send', async (req, res) => {
  console.log(`\n⏰ [${new Date().toISOString()}] Hourly motivation trigger received!`);

  const category = CATEGORIES[categoryIndex % CATEGORIES.length];
  categoryIndex++;

  try {
    // ফ্রি AI দিয়ে নতুন মোটিভেশন তৈরি
    const rawAiText = await generateAIMotivation(category);
    const formattedMessage = formatWhatsAppText(category, rawAiText);

    // মেটা ক্লাউড এপিআই দিয়ে হোয়াটসঅ্যাপে পাঠানো
    const metaResponse = await sendToMetaWhatsApp(formattedMessage);
    console.log(`✅ Message sent to WhatsApp successfully via Meta Cloud API!`, metaResponse);

    res.json({
      success: true,
      category: category.label,
      recipient: RECIPIENT_PHONE,
      sentAt: new Date().toISOString(),
      metaResponse,
      preview: rawAiText
    });
  } catch (err) {
    console.error('❌ Failed to send WhatsApp motivation:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ৩. হোম স্ট্যাটাস পেজ
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>WhatsApp Motivation Bot (Meta Cloud API)</title>
      <style>
        body { font-family: sans-serif; background: #0b0f19; color: #f1f5f9; padding: 2rem; text-align: center; }
        .card { background: #1e293b; max-width: 550px; margin: 2rem auto; padding: 2rem; border-radius: 16px; border: 1px solid #334155; }
        .btn { display: inline-block; background: #25d366; color: white; padding: 0.8rem 1.5rem; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 1rem; }
        .badge { background: rgba(37, 211, 102, 0.2); color: #25d366; padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.85rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>📱 WhatsApp Study Motivation Bot</h2>
        <p><span class="badge">Official Meta Cloud API Active</span></p>
        <p><strong>প্রাপক নম্বর:</strong> ${RECIPIENT_PHONE}</p>
        <p>GitHub Actions প্রতি ৫ মিনিটে Render কে পিং দিয়ে জাগিয়ে রাখবে এবং প্রতি ১ ঘণ্টায় ফ্রি AI দিয়ে তৈরি ইসলামিক ও স্টাডি মোটিভেশন হোয়াটসঅ্যাপে পাঠাবে।</p>
        <a href="/send" class="btn" target="_blank">🚀 এখনই টেস্ট মেসেজ পাঠান (/send)</a>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Official Meta WhatsApp Cloud API Mode`);
  console.log(`👤 Recipient: ${RECIPIENT_PHONE}`);
  console.log(`=========================================`);
});
