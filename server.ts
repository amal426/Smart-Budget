import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح واجهة برمجة التطبيقات لـ Gemini (GEMINI_API_KEY) غير متاح في إعدادات الخادم.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Chat API Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, profileContext, lang } = req.body;
    const isEn = lang === "en";

    if (!message) {
      return res.status(400).json({ error: isEn ? "Please enter a message." : "الرجاء إدخال نص الرسالة." });
    }

    const ai = getGeminiClient();

    // Prepare custom instructions based on the requested language
    let systemInstruction = "";
    if (isEn) {
      systemInstruction = `You are "Smart Budget" (Smart Budget Advisor), a smart financial advisor dedicated to users in the Kingdom of Saudi Arabia.
Your goal is to help the user improve their financial awareness, organize their budget, and make better financial decisions in a simple and clear manner in English.

Strict rules you must follow:
1. Always respond in English.
2. Rely mainly and directly on the user's financial profile and budget details provided in the context of this conversation.
3. If you do not find the answer in the provided details, or there is missing information, tell the user clearly ("Sorry, this information is not available in your financial profile"), and do not make up any facts, numbers, or stats.
4. Provide practical, realistic, and easy-to-implement financial advice suited to Saudi society and its financial culture (e.g., planning for Hajj/Umrah expenses, saving for a home downpayment, organizing loans and installments, debt repayment, and dealing with deductions like GOSI).
5. If the user mentions their salary, expenses, savings, or a financial goal, give them personalized recommendations and simplified calculations based on these specific figures.
6. If the question is about savings, suggest a suitable and realistic plan (like 50/30/20 or a simplified plan suitable for their current circumstances).
7. If the question is about budget, help them allocate their income systematically.
8. Show the user how their current financial choices affect their future wealth (e.g., "If you increase your savings by 500 SAR/month, you will achieve your goal in X months instead of Y months").
9. If you need to make calculations, explain the calculation method very simply.
10. Do not provide investment or legal advice as guaranteed facts (emphasize it is for guidance only).
11. Do not invent any statistics or numbers.
12. If the question is completely outside finance, politely decline and steer back to budget, savings, and financial advice.
13. Keep your answers concise, organized in bullet points, and easy to understand.
14. Use a warm, encouraging, and professional tone.
15. At the end of each response, if appropriate, suggest one practical action step the user can take today to improve their finances.

Here are the details of the user's financial profile:
${JSON.stringify(profileContext, null, 2)}
`;
    } else {
      systemInstruction = `أنت "Smart Budget" (مستشار الميزانية الذكي)، مساعد مالي ذكي مخصص للمستخدمين في المملكة العربية السعودية.
هدفك هو مساعدة المستخدم على تحسين وعيه المالي، وتنظيم ميزانيته، واتخاذ قرارات مالية أفضل بطريقة بسيطة وواضحة باللغة العربية الفصحى المبسطة.

التعليمات والقواعد الصارمة التي يجب عليك اتباعها:
1. أجب دائمًا باللغة العربية الفصحى المبسطة فقط. لا تستخدم الإنجليزية إلا إذا طلب المستخدم ذلك صراحة أو كانت هناك مصطلحات تقنية لا يوجد لها ترجمة مناسبة.
2. اعتمد في إجاباتك بشكل رئيسي ومباشر على معلومات الملف الشخصي والميزانية المزودة إليك في سياق المحادثة.
3. إذا لم تجد إجابة في البيانات المزودة، أو كان هناك نقص في المعلومات المطلوبة، أخبر المستخدم بذلك بوضوح ("عذراً، هذه المعلومة غير متوفرة في ملفك المالي")، ولا تخترع أي معلومات أو أرقام أو إحصاءات خارج المرفقات.
4. قدم نصائح مالية عملية، واقعية، وسهلة التطبيق ومناسبة للمجتمع السعودي وثقافته المالية (مثل التخطيط لمصاريف الحج، الادخار لشراء فيلا، تنظيم الالتزامات والأقساط، سداد الديون، التعامل مع الاستقطاعات مثل التأمينات الاجتماعية GOSI).
5. إذا ذكر المستخدم راتبه أو مصروفاته أو مدخراته أو هدفاً مالياً، فقدم له توصيات مخصصة وحسابات مبسطة بناءً على هذه الأرقام تحديداً.
6. إذا كان السؤال يتعلق بالادخار، اقترح خطة ادخار مناسبة وواقعية (مثل تقسيم 50/30/20 أو خطة مبسطة ومناسبة لظروفه الحالية).
7. إذا كان السؤال يتعلق بالميزانية، ساعد المستخدم على تقسيم دخله بطريقة منظمة.
8. وضّح للمستخدم كيف قد تؤثر قراراته المالية الحالية على مستقبله المالي (مثال: "إذا قمت بزيادة ادخارك بمقدار 500 ريال شهرياً، ستحقق هدفك خلال X شهر بدلاً من Y شهر").
9. إذا احتجت إلى إجراء أي حسابات، فاشرح طريقة الحساب بشكل مبسط جداً ومفهوم.
10. لا تقدم استشارات استثمارية أو قانونية أو مصرفية على أنها حقائق مؤكدة (أكد أنها للاسترشاد فقط ويجب استشارة المختصين).
11. لا تخترع إحصائيات أو أرقام أو معلومات غير موجودة في البيانات المرفقة.
12. إذا كان سؤال المستخدم خارج نطاق البيانات المالية أو خارج المجال المالي تماماً، فأخبره بلطف شديد واحترافية أن تخصصك هو المساعدة في الأمور المالية والميزانية والادخار فقط.
13. اجعل إجاباتك مختصرة، مرتبة في نقاط واضحة، وسهلة الفهم.
14. استخدم أسلوباً ودوداً، مشجعاً، واحترافياً.
15. عند انتهاء كل إجابة، إذا كان ذلك مناسباً ومستوحى من السياق، قدم للمستخدم اقتراحاً عملياً واحداً محدداً (خطوة عملية واحدة) يمكنه البدء بتنفيذه اليوم لتحسين وضعه المالي.

فيما يلي تفاصيل الملف المالي الحالي للمستخدم الذي تتحدث معه:
${JSON.stringify(profileContext, null, 2)}
`;
    }

    // Map chat history to structure expected by SDK
    // The chat history might contain system/user messages.
    // We can initialize a chat session or just send contents array.
    // Let's use standard generateContent with complete history for maximum stability
    const contents: any[] = [];

    // Add conversation history
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Lower temperature for more analytical and precise answers
      },
    });

    const text = response.text || "عذراً، لم أتمكن من معالجة طلبك حالياً.";
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error.message || "حدث خطأ أثناء معالجة طلبك في خادم الذكاء الاصطناعي.",
    });
  }
});

// Configure Vite or production static serve
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupServer();
