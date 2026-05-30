/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { NetworkMetrics, Fault } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ChatBotProps {
  currentMetrics: NetworkMetrics | null;
  faults: Fault[];
  history?: NetworkMetrics[];
}

// Instantiate the GoogleGenAI client with standard proxy HTTP telemetry options
const apiKeyEnv = process.env.GEMINI_API_KEY || '';
const isApiKeyMissing = !apiKeyEnv || apiKeyEnv === 'MY_GEMINI_API_KEY' || apiKeyEnv.trim() === '';

const ai = new GoogleGenAI({
  apiKey: apiKeyEnv,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const ChatBot: React.FC<ChatBotProps> = ({ currentMetrics, faults, history = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: 'مرحباً بك! أنا مساعدك الذكي مسبار ATLAS Pro للتحليل العميق واستكشاف مشاكل الاتصال ومطابقة اتفاقية الخدمة (SLA). يمكنك مناقشتي في تذبذب الإشارة، مشاكل التوجيه، التنسيق، الـ Jitter، أو ضياع الحزم لمعرفة الأسباب الفنية الفورية وطرق علاجها.' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  // Suggestive smart quick action prompts (Bilingual)
  const quickActions = [
    {
      labelAr: "حلل لي تدهور الأداء التاريخي 📊",
      labelEn: "Analyze historical deviations 📊",
      promptAr: "قم بعمل تحليل عميق للتدهور التاريخي ومعدل السرعات وزمن الاستجابة على مدار الـ 24 ساعة الماضية للوصول للأسباب المحتملة.",
      promptEn: "Perform a deep analytical review of my past 24-hour historical performance, download velocities, and latency offsets."
    },
    {
      labelAr: "كيف أحسن الـ Jitter للألعاب؟ 🎮",
      labelEn: "Reduce gaming Jitter 🎮",
      promptAr: "لدي مشكلة في ثبات استجابة الألعاب والـ Jitter مرتفع، ما هي الإعدادات وخوارزميات موازنة الحمولة التي تنصحني بتفعيلها؟",
      promptEn: "I am experiencing high Jitter in competitive multiplayer gaming. What router buffer configuration or SQM algorithms (e.g. FQ_CoDel, CAKE) do you recommend?"
    },
    {
      labelAr: "لماذا تضيع الحزم بأوقات الذروة؟ 🛡️",
      labelEn: "What causes peak Packet Loss? 🛡️",
      promptAr: "لماذا تزيد نسبة الفقد وتذبذب زمن الاستجابة في ساعات الذروة المسائية؟ وهل السبب هو خنق السرعات من مزودي الخدمة؟",
      promptEn: "What causes packet loss during high neighbor-loop congestion hours (7 PM to 11 PM)? How can I isolate Local WiFi packet drop from core transport hub drops?"
    },
    {
      labelAr: "خطوات تسريع استجابة الـ DNS ⚡",
      labelEn: "Speed up DNS lookups ⚡",
      promptAr: "كيف أقوم بتجاوز بطء الاستعلام عن أسماء النطاقات؟ وما هو أفضل عنوان خادم DNS قريب جغرافياً؟",
      promptEn: "My DNS query resolution time feels high. What are the best regional public recursive resolvers and how can I flush local ARP/OS cache?"
    }
  ];

  const handleSend = async (customPrompt?: string) => {
    if (isTyping) return;
    const messageToSend = customPrompt ? customPrompt : input;
    if (!messageToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    if (!customPrompt) setInput('');
    setIsTyping(true);

    const userIsArabic = isArabic(messageToSend);

    // If API key is missing, fall back to instructive demo response.
    if (isApiKeyMissing) {
      setTimeout(() => {
        const instruction = userIsArabic
          ? `⚠️ **مفتاح واجهة برمجة التطبيقات (Gemini API Key) لم يتم إعداده بعد في هذا المشروع!**

لكي يعمل الشات بوت ويبدأ في الإجابة بشكل ذكي بناءً على نموذج الذكاء الاصطناعي (Gemini 3.5 Flash) أثناء التشغيل، يرجى القيام بضبط بيئة العمل لديك:

### ⚙️ خطوات التفعيل على منصة **Netlify**:
1. افتح لوحة تحكم موقعك على **Netlify**.
2. انتقل إلى **Site settings > Environment variables** (متغيرات البيئة).
3. أضف متغيراً جديداً باسم **GEMINI_API_KEY**.
4. ضع مفتاح الـ API الخاص بـ Gemini في حقل القيمة.
5. اذهب لتبويب **Deploys** واضغط **Trigger deploy > Clear cache and deploy site** لبناء وتوزيع الموقع من جديد وتفعيل المفتاح المضاف.

---

### 💻 للتشغيل محلياً (Local Development):
قم بإنشاء أو تعديل ملف \`.env\` في مجلد المشروع الرئيسي وأضف:
\`\`\`env
GEMINI_API_KEY=your_actual_api_key_here
\`\`\`
ثم أعد تشغيل السيرفر المحلي.`
          : `⚠️ **Gemini API Key is currently missing from your project configuration!**

To resolve this and activate the intelligent AI diagnostics pipeline:

### ⚙️ On **Netlify** Deployment:
1. Go to your **Netlify Dashboard > Site settings > Environment variables**.
2. Click **Add a variable** and set Key as: **GEMINI_API_KEY**.
3. Set the Value to your actual Gemini developer API key.
4. Navigate to the **Deploys** panel in Netlify, and select **Trigger deploy > Clear cache and deploy site** to rebuild your application and inject your secret variable safely.

---

### 💻 For Local Development:
Define the API key inside your root \`.env\` file:
\`\`\`env
GEMINI_API_KEY=your_actual_key
\`\`\`
Then restart your dev server.`;

        setMessages(prev => [...prev, { role: 'bot', content: instruction }]);
        setIsTyping(false);
      }, 700);
      return;
    }

    try {
      // Map historical trends for the model prompt
      const pastTrendsStr = history.length > 0 
        ? history.slice(0, 6).map((m, index) => {
            const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `[Hour: ${time} | Speed Down: ${m.downloadSpeed} Mbps | Upload: ${m.uploadSpeed} Mbps | Latency: ${m.latency}ms | Jitter: ${m.jitter}ms | Packet Loss: ${m.packetLoss}%]`;
          }).join('\n')
        : "No historical metrics found yet.";

      const systemPrompt = `You are ATLAS Pro, a highly intelligent Senior Telecom & Optical Network Engineer. 
      You are bilingual, technically robust, professional, and deeply analytical.
      
      You have access to the user's detailed Live Network Metric values and historical timelines.

      === CURRENT LIVE NETWORK METRICS ===
      - Download Throughput: ${currentMetrics?.downloadSpeed.toFixed(1) || '95'} Mbps (ISP Target SLA speed: 100 Mbps)
      - Upload Throughput: ${currentMetrics?.uploadSpeed.toFixed(1) || '20'} Mbps
      - Latency (Ping RTT): ${currentMetrics?.latency.toFixed(1) || '15'} ms
      - Jitter Spectrum: ${currentMetrics?.jitter.toFixed(2) || '1.8'} ms
      - Packet Drop Ratio: ${currentMetrics?.packetLoss.toFixed(2) || '0.00'}%
      - DNS Resolve Time: ${currentMetrics?.dnsTime.toFixed(1) || '18'} ms
      
      === HISTORICAL TREND DATALINE (LAST 6 SESSIONS) ===
      ${pastTrendsStr}

      === ACTIVE GATEWAY FAULTS ===
      ${faults.length > 0 ? faults.map(f => `- ${f.nameEn} (Severity: ${f.severity}/10, Category: ${f.category}, Status: ${f.status})`).join('\n') : 'No faults currently flagged.'}

      === CRITICAL CONSTRAINT: EXTREME BREVITY (قصر شديد وإجابة مباشرة جداً على قد السؤال في سطر أو سطرين فقط) ===
      - **VERY IMPORTANT**: You MUST keep your responses extraordinarily brief, short, and focused strictly on the user's specific question.
      - **DO NOT** write long generic introductory paragraphs, greetings, promotional support sentences, or deep academic network background theory.
      - Limit your reply to EXACTLY 1 to 2 short sentences, or a couple of direct, laser-focused bullet points maximum. Never exceed 40 words.
      - In Arabic: (أجب على قد السؤال تماماً وباختصار شديد جداً ومباشر، في سطر واحد أو سطرين فقط وبأقل عدد ممكن من العبارات! يمنع منعاً باتاً استعراض النظريات أو كتابة مقدمات وفقرات طويلة).
      - If the user asks a simple question, give a simple 1-sentence response. If they ask a complex question, provide a ultra-brief bulleted summary.

      === CAPABILITIES & QUICK REMEDIES ===
      1. Provide high-level, precise network telemetry analysis. Identify potential Carrier-Grade NAT (CGNAT) issues, GPON/DSLAM aggregation hub bottlenecks, Local WiFi attenuation, and Bufferbloat risks.
      2. If the user writes in Arabic, address them in fluent, professional, and extremely concise Arabic. If they write in English, reply in English.
      3. Focus strictly on direct structural remedies (e.g., active Smart Queue Management, Cat6 cables, MTU size tuning, DNS server swapping).`;

      // Map conversation history into Gemini SDK format
      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Include latest user message
      contents.push({
        role: 'user',
        parts: [{ text: messageToSend }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.15 // Maintain highly accurate technical outputs
        }
      });

      const reply = response.text || (userIsArabic ? "عذراً، واجهت مشكلة في التفكير." : "Sorry, I had trouble processing that.");
      setMessages(prev => [...prev, { role: 'bot', content: reply }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const fallback = userIsArabic 
        ? "أنا لست متأكدًا من دقة ذلك حاليًا، ولكن يمكنني مساعدتك في اختبارات السرعة وتحليل تذبذب الإشارة (Jitter)."
        : "I'm not fully sure about that right now, but I can help you with live speed tests, latency fluctuations and Jitter analysis.";
      setMessages(prev => [...prev, { role: 'bot', content: fallback }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center text-white z-50 overflow-hidden border border-white/20"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              <MessageSquare className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-28 right-8 w-[420px] h-[640px] bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center relative shadow-lg shadow-blue-600/20">
                  <Bot className="text-white w-6 h-6" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    ATLAS Pro
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-600/20 text-[8px] text-blue-400 border border-blue-400/20 font-mono font-bold">AI ENGINE</span>
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      {isArabic(messages[messages.length - 1]?.content || '') ? "خبير اتصالات وتحليل ذكي" : "Telecom & Routing Expert"}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* API Key Missing Alert Banner */}
            {isApiKeyMissing && (
              <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span className="text-[10px] font-bold uppercase leading-relaxed tracking-wide">
                  Simulation Active • Configure GEMINI_API_KEY in Netlify settings
                  <br />
                  وضع التشغيل المحاكي • لتمكين ردود الـ AI اربط مفتاح Gemini بالمتغير البيئي
                </span>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
              {messages.map((msg, i) => {
                const userMsgIsArabic = isArabic(msg.content);
                return (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl flex gap-3 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20' 
                        : 'bg-white/5 text-white/85 rounded-tl-none border border-white/5'
                    }`}>
                      {msg.role === 'bot' && <Bot className="w-4 h-4 mt-1 shrink-0 opacity-40 text-blue-400" />}
                      <div className={`text-xs font-semibold leading-relaxed whitespace-pre-wrap ${userMsgIsArabic ? 'text-right font-sans font-medium' : 'text-left font-sans'}`} dir={userMsgIsArabic ? 'rtl' : 'ltr'}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 text-white/40 p-4 rounded-3xl rounded-tl-none border border-white/5 flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">ATLAS is resolving network path...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions list overlay above input */}
            <div className="px-4 py-2 bg-[#080808] border-t border-white/5 overflow-x-auto custom-scrollbar flex gap-2 shrink-0 select-none">
              {quickActions.map((action, index) => {
                const hasArabicMessage = isArabic(messages[messages.length - 1]?.content || '');
                return (
                  <button
                    key={index}
                    onClick={() => handleSend(hasArabicMessage ? action.promptAr : action.promptEn)}
                    disabled={isTyping}
                    className="px-3.5 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer disabled:opacity-40"
                  >
                    {hasArabicMessage ? action.labelAr : action.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 bg-[#0a0a0a] border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isArabic(messages[messages.length - 1]?.content || '') ? "اسألني عن قفزات التوجيه، الـ MTU، أو ثبات Jitter..." : "Ask me about MTU size, DNS, CGNAT gateways..."}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-5 pr-14 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-600/40 focus:bg-white/10 transition-all font-medium"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[8px] text-center text-white/20 mt-3 uppercase font-extrabold tracking-widest select-none">
                ATLAS Core: ML Engine Online • 24h Baseline Analyser Enabled
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

