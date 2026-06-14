import { getGemini } from '../config/gemini.js';

// Crisis analysis keywords list
const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'self-harm', 'end my life', 'want to die', 
  'cutting myself', 'oversleeping until end', 'no reason to live', 'hang myself'
];

// Empathetic, supportive pools of phrases for non-repetitive conversational simulation
const FALLBACK_VALIDATIONS = [
  "I hear you, and it is completely natural to feel that way when navigating these thoughts.",
  "Thank you for sharing this with me. Putting what is on your mind into words is a brave step.",
  "That sounds like a lot to hold inside. I am here with you, listening in complete confidentiality.",
  "It is completely valid to feel overwhelmed by these events. Your experiences matter.",
  "Thank you for opening up today. Expressing these thoughts is an important part of wellness.",
  "I am reading your words closely. It is completely okay to feel vulnerable or uncertain."
];

const FALLBACK_QUESTIONS = [
  "Can you tell me a little bit more about what triggered these thoughts or feelings today?",
  "What is one small thing—even something tiny—that might help you feel a bit more comfortable right now?",
  "How have you been carrying this over the last few days? Have you had any chance to rest?",
  "Would you like to try a quick breathing pattern together, or would you prefer to just talk through it?",
  "Have you been able to share these thoughts with any of our matched supportive peers in the chat rooms?",
  "Is this feeling something that has been building up for a while, or is it a reaction to a recent event?"
];

const FALLBACK_CLOSINGS = [
  "Please remember to be extremely kind and gentle with yourself today.",
  "We can take things one small step, one slow breath at a time.",
  "I'm here in this safe space whenever you need to unpack what is in your mind.",
  "You don't have to navigate all of this at once. Give yourself permission to go slowly.",
  "Your peace of mind is important. Take a gentle breath and rest when you can."
];

// High quality therapeutic fallback dialog engine
export async function askCompanion(req, res) {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Input text message is required' });
    }

    const gemini = getGemini();

    if (gemini) {
      try {
        let formattedHistory = [];
        if (Array.isArray(history) && history.length > 0) {
          // If the first message in history is from model, skip it to ensure history starts with 'user'
          const startIdx = history[0].role === 'model' ? 1 : 0;
          formattedHistory = history.slice(startIdx).map(item => ({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.parts?.[0]?.text || item.text || '' }]
          })).filter(item => item.parts?.[0]?.text || item.text);
        }

        const chatSession = gemini.chats.create({
          model: 'gemini-2.5-flash',
          history: formattedHistory,
          config: {
            systemInstruction: `You are an understanding, professional, and warm AI Mental Health Companion named "Nakama". 
Your goal is to offer emotional validation, positive encouragement, and practical, actionable coping techniques, breathing sequences, stress reduction exercises, and journaling prompts.

STRICT MEDICAL & ETHICAL RULES:
1. NEVER diagnose any mental, psychiatric, or physical illnesses.
2. If the user mentions crisis flags (self-harm, suicide, severe symptoms), ALWAYS recommend professional help instantly and present emergency helplines.
3. Be humble, kind, and safe. Do no harm.
4. Keep answers clean, digestible, and well-structured with Markdown headings.`
          }
        });

        // Set conversation history if provided
        // We can just query with context or chat mapping
        const response = await chatSession.sendMessage({ message: message });
        
        return res.status(200).json({
          response: response.text,
          aiProvider: 'gemini'
        });
      } catch (geminiError) {
        console.error('Gemini companion session error, moving to fallback counseling:', geminiError);
      }
    }

    // High quality therapeutic fallback dialog engine
    console.log('[AI-STUDIO] Generating companion fallback response');
    const msgLower = message.toLowerCase();
    let responseText = '';

    // Check crisis keywords first
    if (CRISIS_KEYWORDS.some(kw => msgLower.includes(kw))) {
      responseText = `### 🚨 Safe Space Alert: We Are Here for You

If you are experiencing severe distress or thoughts of self-harm, please know you are not alone and there is support available right now. 

You can connect with compassionate, trained people who will listen without judgment:
- **Call or Text 988**: National Suicide & Crisis Lifeline (Available 24/7, Free & Confidential)
- **Text HOME to 741741**: Crisis Text Line

Please consider reaching out to them or a trusted professional. You matter.`;
    } else if (msgLower.includes('anxiety') || msgLower.includes('anxious') || msgLower.includes('panic') || msgLower.includes('scared') || msgLower.includes('fear') || msgLower.includes('worry')) {
      responseText = `### Acknowledging Your Anxiety

I hear you, and it is completely understandable to feel anxious or worried right now. Let's take a slow breath together.

Anxiety often feels like an internal alarm that won't turn off. Let's try a **Square Breathing Exercise** to calm your nervous system.

#### 🧘‍♀️ The 4-4-4-4 Grounding Loop:
1. **Inhale** slowly through your nose for **4 seconds**.
2. **Hold** that gentle breath for **4 seconds**.
3. **Exhale** smoothly through your mouth for **4 seconds**.
4. **Pause** on empty for **4 seconds** before the next cycle.

*Try repeating this 3 times.*

#### 📝 Reflection Journaling Prompt:
*What is one small thing in your immediate control that we can focus on together right now?*

---
^ **Safe space guard**: If these feelings become overwhelming, remember our community chat rooms are active, and seeking advice from a professional counselor is a brave and healthy step.`;
    } else if (msgLower.includes('sad') || msgLower.includes('depression') || msgLower.includes('depressed') || msgLower.includes('lonely') || msgLower.includes('cry') || msgLower.includes('grief') || msgLower.includes('hurt')) {
      responseText = `### Supporting You in the Dark

I'm so sorry you're carrying this heavy weight today, but I am glad you are sharing here. Your feelings are entirely valid, and you don't have to navigate them alone.

When depression makes everything feel gray, energy levels drop, and self-criticism rises. Let's focus on a very tiny gentleness habit.

#### 🌻 A Simple Self-Care Activity:
- **Warmth Ritual**: Get a glass of warm tea or water, wrap yourself in a comfortable blanket, and take five slow, deliberate breaths.
- **Micro-move**: Stretch your hands towards the ceiling, look out the window for 30 seconds, and let your shoulders drop.

#### 📝 Today's Writing Prompt:
*Write down three small things you appreciate having around you (e.g., a warm blanket, a working keyboard, a supportive anonymous space).*

---
^ **Caring advisory**: Please remember: You are important. If you feel at risk, please reach out to professional lines: text **HOME** to **741741** or call **988**. Help is always ready.`;
    } else if (msgLower.includes('stress') || msgLower.includes('burnout') || msgLower.includes('work') || msgLower.includes('exam') || msgLower.includes('study') || msgLower.includes('test') || msgLower.includes('pressure') || msgLower.includes('exhausted') || msgLower.includes('tired')) {
      responseText = `### Easing Your Daily Pressure

You have a lot on your plate, and the feeling of stress or burnout is real. Thank you for slowing down to check in with yourself.

Let's release some muscle tension right now.

#### 🌊 Progressive Muscle Release (PMR):
1. **Shoulders**: Lift your shoulders up towards your ears. Hold tightly for 5 seconds... then drop them completely. Feel the blood flow back in.
2. **Hands**: Clench your fists for 5 seconds... then relax and wiggle your fingers.
3. **Breathing**: Breathe out with a deep sigh, letting all the stale air go.

#### 📝 Journal Outline:
*If you could take one task off your list today without feeling guilty, what would it be? Give yourself permission to let it wait.*`;
    } else if (msgLower.includes('thank') || msgLower.includes('thanks') || msgLower.includes('appreciate') || msgLower.includes('grateful')) {
      responseText = `### You are Very Welcome! 😊

I'm glad I could offer a supportive space for you. Expressing gratitude is a wonderful way to foster positivity and emotional recovery.

If you have a moment, consider sharing this gratitude on our **Positivity Wall** so other anonymous peers can share in your light. 

Is there anything else you'd like to talk about or work through today?`;
    } else if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey') || msgLower.includes('yo') || msgLower.includes('greetings')) {
      responseText = `### Hello there! 👋

Welcome to Nakama, your safe anonymous wellness space. I'm glad you reached out today. 

How are you doing? What is occupying your thoughts or feelings right now? You can share anything with me in complete confidence, or ask me for a guided coping exercise.`;
    } else if (msgLower.includes('how to use') || msgLower.includes('what is this') || msgLower.includes('feature') || msgLower.includes('guide') || msgLower.includes('help') || msgLower.includes('what can i do') || msgLower.includes('features')) {
      responseText = `### Getting Started with Nakama 🗺️

Nakama is a private, credential-free haven designed to support your wellness journey. Here is what you can do here:

1. 📰 **Forums**: Share your story anonymously and read/reply to support other peers.
2. 📈 **Mood Tracker**: Check in daily to track your feelings and log private journal thoughts.
3. 🌸 **Positivity Wall**: Write down highlights of gratitude to spread warmth.
4. 🛡️ **habit Path**: Join structured challenges (like meditation or hydration) to build healthy routines.
5. 💬 **Peer Matching**: Open private chat rooms with compatible companions or matching peers based on selected concern topics.

What area would you like to explore or discuss today?`;
    } else {
      // Dynamic conversational fallback using history context seeds to prevent repetition
      const seed = (message.length + (history?.length || 0)) % 100;
      
      const validation = FALLBACK_VALIDATIONS[seed % FALLBACK_VALIDATIONS.length];
      const question = FALLBACK_QUESTIONS[(seed + 3) % FALLBACK_QUESTIONS.length];
      const closing = FALLBACK_CLOSINGS[(seed + 7) % FALLBACK_CLOSINGS.length];
      
      // Attempt to extract dynamic context to reflect back
      let topicRef = '';
      if (msgLower.includes('feel') || msgLower.includes('feeling')) {
        topicRef = "navigating these types of feelings can be exhausting, and it is completely normal to seek clarity.";
      } else if (msgLower.includes('don\'t know') || msgLower.includes('confused') || msgLower.includes('help')) {
        topicRef = "being unsure or feeling stuck is part of the process. You don't have to have all the answers right now.";
      } else if (msgLower.includes('always') || msgLower.includes('never')) {
        topicRef = "when things feel absolute, it can seem like they will never change, but they do shift in time.";
      } else {
        const cleanMsg = message.replace(/[.#?]/g, '').trim();
        const words = cleanMsg.split(/\s+/);
        const snippet = words.length > 5 ? words.slice(-5).join(' ') : cleanMsg;
        topicRef = `it makes absolute sense that thinking about "${snippet}" is occupying your focus today.`;
      }

      responseText = `### Reflecting with You

${validation}

Since ${topicRef}

${question}

---
*Note: Running in local offline companion mode. To enable full generative AI counseling, please configure your actual GEMINI_API_KEY in backend/.env file.*

*${closing}*`;
    }

    res.status(200).json({
      response: responseText,
      aiProvider: 'fallback_sim'
    });
  } catch (error) {
    console.error('AI Companion query fails:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
