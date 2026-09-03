require('dotenv').config();
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
let RECIPIENT_PHONE = (process.env.RECIPIENT_PHONE || '01735698076').trim().replace(/[\s\-\(\)\+]/g, '');
if (RECIPIENT_PHONE.startsWith('01') && RECIPIENT_PHONE.length === 11) {
  RECIPIENT_PHONE = '88' + RECIPIENT_PHONE; // 01735698076 -> 8801735698076
}

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

// WhatsApp Baileys State
let sock = null;
let currentQrDataUrl = null;
let isConnected = false;
let connectedUser = null;

/**
 * Baileys WhatsApp Socket ইনিশিয়ালাইজ করা (কোনো API ছাড়াই সরাসরি WhatsApp Web QR কোড)
 */
async function connectToWhatsApp() {
  const authFolder = path.join(__dirname, 'auth_info');
  if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Study Motivation Bot', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQrDataUrl = await QRCode.toDataURL(qr);
      console.log('⚡ নতুন QR Code তৈরি হয়েছে! ব্রাউজারে গিয়ে স্ক্যান করুন।');
    }

    if (connection === 'close') {
      isConnected = false;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`⚠️ WhatsApp সংযোগ বিচ্ছিন্ন হয়েছে (Code: ${statusCode})। পুনঃসংযোগ: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log('❌ লগআউট হয়েছে। নতুন QR কোড স্ক্যান করতে হবে।');
        try { fs.rmSync(authFolder, { recursive: true, force: true }); } catch (e) {}
        setTimeout(connectToWhatsApp, 3000);
      }
    } else if (connection === 'open') {
      isConnected = true;
      currentQrDataUrl = null;
      connectedUser = sock.user?.id || 'Connected';
      console.log('✅ WhatsApp সফলভাবে সংযুক্ত হয়েছে! ইউজার:', connectedUser);
    }
  });
}

/**
 * সমৃদ্ধ বাংলা ব্যাকআপ ব্যাংক (যদি কখনো ইন্টারনেট বা কোটায় সমস্যা হয়)
 */
const FALLBACK_BANK = {
  ISLAMIC: `📌 নিয়তের বরকত ও ইলমের মর্যাদা\n\nপড়াশোনা করার সময় নিয়তকে পবিত্র রাখো—হালাল রিজিক ও মুসলিম উম্মাহর খেদমত। তোমার টেবিলে বসা প্রতিটি মুহূর্ত ইবাদত হিসেবে গণ্য হবে ইনশাআল্লাহ।\n\n💡 আজকের টিপ: পড়ার শুরুতে 'রাব্বি জিদনি ইলমা' পাঠ করে বরকত কামনা করো।\n💬 'যে ব্যক্তি জ্ঞান অর্জনের পথে চলে, আল্লাহ তার জান্নাতের পথ সহজ করে দেন।' (সহীহ মুসলিম)`,
  STUDY: `📌 অজুহাত নয়, লক্ষ্যই আসল\n\nআজ হয়তো পড়তে ভালো লাগছে না। কিন্তু মনে রেখো, চ্যাম্পিয়নরা মুডের অপেক্ষায় বসে থাকে না; তারা কাজ শুরু করে বলেই মুড ফিরে আসে। তোমার আজকের পরিশ্রমই আগামী দিনের বিজয়ের ভিত্তি।\n\n💡 ৫ মিনিটের নিয়ম: কেবল ৫ মিনিটের জন্য টেবিলে বসো, দেখবে পড়ার গতি চলে এসেছে।\n💬 'যত বেশি ঘাম ঝরাবে, ভাগ্য তত বেশি সহায় হবে।'`,
  STUDYTIPS: `📌 অ্যাক্টিভ রিকল (Active Recall) মেথড\n\nবারবার রিডিং পড়ার চেয়ে এক প্যারাগ্রাফ পড়ে বই বন্ধ করে নিজেকে প্রশ্ন করো: 'আমি কী শিখলাম?' নিজের ভাষায় খাতায় লেখো। এতে স্মৃতিশক্তি বহুগুণ শক্তিশালী হয়।\n\n💡 ট্রাই করো: পড়া শেষে চোখ বন্ধ করে মূল ৩টি পয়েন্ট মনে করার চেষ্টা করো।\n💬 'জ্ঞান তখন স্থায়ী হয় যখন তা মেমরি থেকে রিকল করা হয়।'`,
  FOCUS: `📌 ডোপামিন ডিটক্স ও মোবাইল বর্জন\n\nএকবার নোটিফিকেশন চেক করতে গিয়ে আধা ঘণ্টা হারিয়ে যায়। পড়ার টেবিলে ফোন রাখা মনোযোগ নষ্ট করার সবচেয়ে বড় ফাঁদ। তীব্র ফোকাসই সাধারণ শিক্ষার্থীকে অনন্য করে তোলে।\n\n💡 চ্যালেঞ্জ: আগামী ১ ঘণ্টার জন্য ফোন অন্য রুমে রেখে দরজা বন্ধ করে পড়ো।\n💬 'যেখানে গভীর মনোযোগ যায়, সেখানেই কাঙ্ক্ষিত সাফল্য আসে।'`,
  HEALTH: `📌 ব্রেইনের আসল জ্বালানি—পানি ও ঘুম\n\nমস্তিষ্কের ৮০% পানি দিয়ে গঠিত। সামান্য পানিশূন্যতা মনোযোগ ও মেমরি অনেক কমিয়ে দেয়। এছাড়া স্মৃতি স্থায়ী করতে ৭-৮ ঘণ্টার পরিমিত ঘুম অপরিহার্য।\n\n💡 এখনই করো: এক গ্লাস বিশুদ্ধ পানি পান করো এবং গভীর শ্বাস নাও।\n💬 'সুস্থ শরীরই হলো তীক্ষ্ণ মেধার নিরাপদ আশ্রয়।'`,
  SCHOLARS: `📌 ইমাম বুখারী (রহ.) এর সাধনা\n\nহাদিস বিশারদ ইমাম বুখারী (রহ.) এক রাতে প্রায় বিশ বার ঘুম থেকে উঠে প্রদীপ জ্বালিয়ে নোট ও হাদিস যাচাই করতেন। নির্ঘুম রাত ও একাগ্র সাধনার বিনিময়েই মানুষ ইতিহাসে স্মরণীয় হয়ে থাকে।\n\n💡 প্রেরণা: তোমার আজকের ত্যাগের প্রতিটি মুহূর্ত ভবিষ্যৎ সফলতার ভিত্তি।\n💬 'শরীরের আরামপ্রিয়তা দিয়ে জ্ঞান অর্জন সম্ভব নয়।' — ইয়াহিয়া ইবনে আবি কাসির`
};

/**
 * গুগল জেমিনাই (Gemini Pro / Flash) দিয়ে বাংলা স্টাডি মোটিভেশন তৈরি করা
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
3. Format nicely with emojis. Strictly DO NOT include MBBS or medical topics.
Reply ONLY with the formatted Bengali message, no introductory English text.`;

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
    try {
      console.log(`🤖 Asking Google Gemini (${model})...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 450 }
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || `Gemini HTTP ${res.status}`);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 20 && !text.includes('"error"')) {
        console.log(`✅ Gemini (${model}) generated motivation successfully!`);
        return text.trim();
      }
    } catch (err) {
      console.warn(`⚠️ Gemini ${model} failed (${err.message}), trying gemini-1.5-flash fallback...`);
      // Secondary fallback to gemini-1.5-flash if pro is rate-limited
      try {
        const flashUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY.trim()}`;
        const flashRes = await fetch(flashUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 450 }
          })
        });
        const flashData = await flashRes.json();
        const flashText = flashData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (flashText && flashText.trim().length > 20 && !flashText.includes('"error"')) {
          console.log(`✅ Gemini 1.5-flash generated motivation successfully!`);
          return flashText.trim();
        }
      } catch (e) {
        console.warn('⚠️ Gemini flash fallback also failed:', e.message);
      }
    }
  } else {
    console.warn('⚠️ GEMINI_API_KEY is not set in environment variables.');
  }

  // Pollinations সম্পূর্ণ বাদ! নির্ভরযোগ্য বাংলা ব্যাংক থেকে রিটার্ন করো:
  console.log(`📖 Using curated Bangla motivation from internal bank for: ${category.id}`);
  return FALLBACK_BANK[category.id] || FALLBACK_BANK.ISLAMIC;
}

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
 * Baileys দিয়ে সরাসরি WhatsApp এ পাঠানো (No API!)
 */
async function sendViaBaileys(messageText) {
  if (!sock || !isConnected) {
    throw new Error('WhatsApp is not connected yet! Please scan the QR code on the website homepage.');
  }

  // Target JID: e.g. 8801735698076@s.whatsapp.net
  const jid = `${RECIPIENT_PHONE}@s.whatsapp.net`;
  const result = await sock.sendMessage(jid, { text: messageText });
  return result;
}

// 1. Keepalive Ping Endpoint (GitHub Actions প্রতি ৫ মিনিটে কল করবে)
app.get('/ping', (req, res) => {
  res.send('Render is awake and ready! 🚀');
});

// 2. Status API
app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    recipient: RECIPIENT_PHONE,
    hasQr: Boolean(currentQrDataUrl)
  });
});

// 3. Hourly Motivation Trigger Endpoint
app.all('/send', async (req, res) => {
  console.log(`\n⏰ [${new Date().toISOString()}] Hourly motivation trigger received!`);

  if (!isConnected) {
    return res.status(400).json({
      success: false,
      error: 'WhatsApp is not connected! Please open the homepage and scan the QR code.'
    });
  }

  const category = CATEGORIES[categoryIndex % CATEGORIES.length];
  categoryIndex++;

  try {
    const rawAiText = await generateAIMotivation(category);
    const formattedMessage = formatWhatsAppText(category, rawAiText);

    const sendResult = await sendViaBaileys(formattedMessage);
    console.log(`✅ Message sent to WhatsApp (+${RECIPIENT_PHONE}) via Baileys!`);

    res.json({
      success: true,
      category: category.label,
      recipient: RECIPIENT_PHONE,
      sentAt: new Date().toISOString(),
      preview: rawAiText
    });
  } catch (err) {
    console.error('❌ Failed to send motivation:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Webpage displaying the QR code or Connected status
app.get('/', (req, res) => {
  if (isConnected) {
    res.send(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp Bot - Connected ✅</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #070b14; color: #f8fafc; padding: 2rem 1rem; text-align: center; }
          .card { background: #131d31; max-width: 500px; margin: 2rem auto; padding: 2.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .badge-ok { background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid #10b981; padding: 0.5rem 1.2rem; border-radius: 999px; font-weight: bold; display: inline-block; margin-bottom: 1.5rem; }
          .btn { display: inline-block; background: #10b981; color: white; padding: 0.9rem 1.8rem; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 1.5rem; }
          .phone-pill { background: #1e293b; padding: 0.4rem 0.8rem; border-radius: 8px; font-family: monospace; color: #38bdf8; font-size: 1.1rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge-ok">✅ WhatsApp সংযুক্ত আছে</div>
          <h2>স্টাডি মোটিভেশন বট সক্রিয়!</h2>
          <p style="color: #94a3b8; margin: 1rem 0;">প্রাপক নম্বর: <span class="phone-pill">+${RECIPIENT_PHONE}</span></p>
          <p style="color: #cbd5e1; font-size: 0.95rem;">GitHub Actions প্রতি ৫ মিনিটে সার্ভারকে ওয়েকআপ পিং পাঠাচ্ছে এবং প্রতি ১ ঘণ্টা পরপর ফ্রি AI দিয়ে তৈরি ইসলামিক ও স্টাডি মোটিভেশন আপনার হোয়াটসঅ্যাপে পাঠিয়ে দিচ্ছে।</p>
          <a href="/send" class="btn" target="_blank">🚀 এখনই টেস্ট মেসেজ পাঠান (/send)</a>
        </div>
      </body>
      </html>
    `);
  } else if (currentQrDataUrl) {
    res.send(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp Bot - QR Code Login 📱</title>
        <script>
          // অটো রিফ্রেশ: প্রতি ৫ সেকেন্ড পর পর চেক করবে স্ক্যান হয়েছে কিনা
          setInterval(async () => {
            try {
              const res = await fetch('/status');
              const data = await res.json();
              if (data.connected) location.reload();
            } catch (e) {}
          }, 4000);
        </script>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #070b14; color: #f8fafc; padding: 2rem 1rem; text-align: center; }
          .card { background: #131d31; max-width: 480px; margin: 1rem auto; padding: 2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .qr-box { background: white; padding: 1rem; border-radius: 16px; display: inline-block; margin: 1.5rem 0; }
          .qr-img { width: 250px; height: 250px; display: block; }
          .step { text-align: left; background: rgba(255,255,255,0.05); padding: 0.8rem 1rem; border-radius: 10px; margin: 0.5rem 0; font-size: 0.9rem; color: #cbd5e1; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>📱 WhatsApp QR Code লগইন</h2>
          <p style="color: #94a3b8; font-size: 0.9rem;">কোনো API বা ফেসবুক অ্যাকাউন্ট ছাড়াই সরাসরি WhatsApp Web দিয়ে কানেক্ট করুন</p>
          
          <div class="qr-box">
            <img src="${currentQrDataUrl}" class="qr-img" alt="WhatsApp QR Code">
          </div>

          <div style="margin-top: 1rem;">
            <div class="step">১. আপনার মোবাইলে <strong>WhatsApp</strong> খুলুন।</div>
            <div class="step">২. উপরে ৩টি ডট বা সেটিংসে যান ➔ <strong>Linked devices</strong> চাপুন।</div>
            <div class="step">৩. <strong>Link a device</strong> এ ক্লিক করে এই QR কোডটি স্ক্যান করুন।</div>
          </div>
          
          <p style="color: #64748b; font-size: 0.8rem; margin-top: 1rem;">স্ক্যান হওয়ার সাথে সাথেই পেজটি স্বয়ংক্রিয়ভাবে রিলোড হয়ে যাবে।</p>
        </div>
      </body>
      </html>
    `);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="3">
        <title>Loading WhatsApp QR...</title>
        <style>
          body { font-family: sans-serif; background: #070b14; color: white; display: flex; justify-content: center; align-items: center; height: 90vh; text-align: center; }
        </style>
      </head>
      <body>
        <div>
          <h2>⏳ WhatsApp সকেট প্রস্তুত হচ্ছে...</h2>
          <p>QR কোড তৈরি হচ্ছে, ৩ সেকেন্ড অপেক্ষা করুন (পেজ স্বয়ংক্রিয়ভাবে রিফ্রেশ হবে)...</p>
        </div>
      </body>
      </html>
    `);
  }
});

// সার্ভার চালু করা এবং হোয়াটসঅ্যাপ সকেট স্টার্ট করা
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📱 WhatsApp Web QR Code Mode Active (No API!)`);
  console.log(`👤 Target Phone: +${RECIPIENT_PHONE}`);
  console.log(`🌐 Open http://localhost:${PORT} to scan QR code`);
  console.log(`=========================================`);

  // WhatsApp ক্লায়েন্ট স্টার্ট করো
  connectToWhatsApp().catch(err => {
    console.error('Failed to start WhatsApp socket:', err);
  });
});
