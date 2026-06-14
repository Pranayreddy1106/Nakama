import db from '../config/db.js';
import { getGemini } from '../config/gemini.js';

const MOOD_SCORES = {
  'Happy': 100,
  'Calm': 90,
  'Neutral': 70,
  'Stressed': 45,
  'Anxious': 40,
  'Sad': 30,
  'Angry': 30,
  'Lonely': 25
};

export function getMoodEntries(req, res) {
  try {
    const userId = req.user.id;
    const entries = db.find('moodEntries', { user: userId });
    
    // Sort chronologically
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    res.status(200).json(entries);
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function createOrUpdateMood(req, res) {
  try {
    const { mood, note, date } = req.body;
    const userId = req.user.id;

    if (!mood) {
      return res.status(400).json({ message: 'Mood value is required' });
    }

    const checkInDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const wellnessScore = MOOD_SCORES[mood] || 70;

    // Check if an entry already exists for this date
    const existing = db.findOne('moodEntries', { user: userId, date: checkInDate });
    
    let result;
    if (existing) {
      result = db.findByIdAndUpdate('moodEntries', existing.id, {
        mood,
        note: note || '',
        wellnessScore
      });
    } else {
      result = db.create('moodEntries', {
        user: userId,
        mood,
        note: note || '',
        date: checkInDate,
        wellnessScore
      });

      // Update check-in streak
      const user = db.findById('users', userId);
      let streak = user.moodStreak || 0;
      
      // Calculate streak logic based on dates
      const moodEntries = db.find('moodEntries', { user: userId })
        .map(m => m.date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending order

      if (moodEntries.length >= 2) {
        const lastDate = new Date(moodEntries[1]);
        const todayDate = new Date(checkInDate);
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1; // broken and restarted
        }
      } else {
        streak = 1; // first log
      }

      // Gamification: Earn Points on log
      let points = (user.points || 0) + 10; // +10 points for daily log
      let badges = [...(user.badges || [])];

      // Check for Streak Badges
      if (streak >= 3 && !badges.includes('3-Day Streak')) {
        badges.push('3-Day Streak');
      }
      if (streak >= 7 && !badges.includes('7-Day Streak')) {
        badges.push('7-Day Streak');
      }
      if (streak >= 14 && !badges.includes('14-Day Streak')) {
        badges.push('14-Day Streak');
      }
      if (streak >= 30 && !badges.includes('30-Day Streak')) {
        badges.push('30-Day Streak');
      }

      db.findByIdAndUpdate('users', userId, {
        moodStreak: streak,
        points,
        badges
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Post mood check-in error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function editMoodEntry(req, res) {
  try {
    const { id } = req.params;
    const { mood, note } = req.body;

    const entry = db.findById('moodEntries', id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const wellnessScore = MOOD_SCORES[mood] || entry.wellnessScore;

    const updated = db.findByIdAndUpdate('moodEntries', id, {
      mood: mood || entry.mood,
      note: note !== undefined ? note : entry.note,
      wellnessScore
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Edit mood entry error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getMoodInsights(req, res) {
  try {
    const userId = req.user.id;
    const entries = db.find('moodEntries', { user: userId });

    if (entries.length === 0) {
      return res.status(200).json({
        summary: 'No mood logs recorded yet. Complete a daily check-in above to start your analytical journey!',
        recommendations: ['Check in with your feelings daily', 'Try writing brief notes in your journal to reveal emotional patterns']
      });
    }

    // Sort descending to get recent
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    const moodLogText = sorted.map(e => `- Date ${e.date}: Feeling ${e.mood} . Note: "${e.note || 'No description'}"`).join('\n');

    const gemini = getGemini();

    if (gemini) {
      try {
        const prompt = `You are an understanding, compassionate mental health companion. 
We have a set of daily mood tracking sheets from a user over the past few days.
Analyze this mood history, provide a beautiful positive emotional summary, evaluate potential sleep/work triggers mentioned in notes, and propose 3 customized self-care guidelines.

User Mood Sheets:
${moodLogText}

Important safety guidelines:
1. NEVER diagnose any medical or psychological illnesses (e.g. Clinical Depression, GAD).
2. If mood logs indicate heavy anxiety/sadness, gently recommend professional listener support inside resources.
3. Write your response in a supportive, kind tone.
Your response must be in standard Markdown. Keep it brief and visual (up to 3 paragraphs total).`;

        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        return res.status(200).json({
          summary: response.text,
          aiInsightEnabled: true
        });
      } catch (geminiError) {
        console.error('Gemini insights failed, running fallback analyzer:', geminiError);
      }
    }

    // Simple algorithmic fallback summary
    const moodCounts = {};
    let totalScore = 0;
    entries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      totalScore += e.wellnessScore;
    });
    
    const avgScore = Math.round(totalScore / entries.length);
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);

    let markdownResponse = `### Algorithmic emotional baseline summary

Based on your last **${entries.length} check-ins**, your primary emotional state has been **${mostCommonMood}** with an emotional wellness index of **${avgScore}/100**.

#### Coping wellness activities suggested:
1. **Focus on stability**: Your journal entries show a core value of community connection. Dedicate 10 minutes to write in the Gratitude board today.
2. **Breathing focus**: When feeling low or stressed, try the **Simulated 4-7-8 Breathing Loop** on our dashboard to oxygenate your vascular stream.
3. **Gentle dialogue**: Sharing emotions is therapeutic. Reach out to matched peers or visit our Anxiety support chat rooms to discuss notes anonymously.`;

    res.status(200).json({
      summary: markdownResponse,
      aiInsightEnabled: false
    });
  } catch (error) {
    console.error('Calculate mood analytics error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
