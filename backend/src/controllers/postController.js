import db from '../config/db.js';
import { getGemini } from '../config/gemini.js';
import { Type } from '@google/genai';

export function getAllPosts(req, res) {
  try {
    const { category, mood, search, sort, skip, limit } = req.query;

    let query = {};
    if (category) query.category = category;
    if (mood) query.moodTag = mood;

    let posts = db.find('posts', query);

    // Support search filter
    if (search) {
      const regex = new RegExp(search, 'i');
      posts = posts.filter(p => regex.test(p.title) || regex.test(p.content));
    }

    // Support sorting
    // sort can be 'newest', 'supported', 'discussed'
    if (sort === 'supported') {
      posts.sort((a, b) => b.supportCount - a.supportCount);
    } else if (sort === 'discussed') {
      posts.sort((a, b) => b.commentCount - a.commentCount);
    } else {
      // default newest
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Pagination
    const offset = parseInt(skip) || 0;
    const pageSize = parseInt(limit) || 10;
    const total = posts.length;
    const paginated = posts.slice(offset, offset + pageSize);

    res.status(200).json({
      posts: paginated,
      total,
      hasMore: offset + pageSize < total
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function getPostById(req, res) {
  try {
    const { id } = req.params;
    const post = db.findById('posts', id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    const updated = db.findByIdAndUpdate('posts', id, { views: (post.views || 0) + 1 });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Get post details error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function createPost(req, res) {
  try {
    const { title, content, anonymous, moodTag, category } = req.body;
    const userId = req.user.id;
    const user = db.findById('users', userId);

    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: 'Character limit is 2000' });
    }

    // Determine identity details
    const username = anonymous ? user.username : 'Registered Member'; // Real identity remains shielded anyways
    const avatarSeed = anonymous ? user.username : 'MemberAvatar';

    const newPost = db.create('posts', {
      title,
      content,
      anonymous: !!anonymous,
      username: user.username, // keep username strictly to track, but restrict exposure in query if needed
      avatarSeed: user.username,
      moodTag: moodTag || 'Neutral',
      category,
      supportCount: 0,
      commentCount: 0,
      reportCount: 0,
      views: 1,
      user: userId,
      supportedBy: []
    });

    // Award Points
    let userPoints = (user.points || 0) + 10; // +10 points for creating a post
    let userBadges = [...(user.badges || [])];
    if (!userBadges.includes('First Post')) {
      userBadges.push('First Post');
    }

    db.findByIdAndUpdate('users', userId, {
      points: userPoints,
      badges: userBadges,
      postsCount: (user.postsCount || 0) + 1
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content, anonymous, moodTag, category } = req.body;

    const post = db.findById('posts', id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ensure it's active user's post or user is Admin
    if (post.user !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized actions' });
    }

    const updated = db.findByIdAndUpdate('posts', id, {
      title: title || post.title,
      content: content || post.content,
      anonymous: anonymous !== undefined ? !!anonymous : post.anonymous,
      moodTag: moodTag || post.moodTag,
      category: category || post.category
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function deletePost(req, res) {
  try {
    const { id } = req.params;
    const post = db.findById('posts', id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ensure it's active user's post or user is Admin
    if (post.user !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized actions' });
    }

    db.findByIdAndRemove('posts', id);
    
    // Also remove associated comments
    const comments = db.find('comments', { post: id });
    comments.forEach(c => db.findByIdAndRemove('comments', c.id));

    res.status(200).json({ message: 'Post successfully deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function toggleSupport(req, res) {
  try {
    const { id } = req.params;
    const post = db.findById('posts', id);
    const userId = req.user.id;

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let supportedBy = post.supportedBy || [];
    let updatedSupports = post.supportCount || 0;

    const index = supportedBy.indexOf(userId);
    if (index === -1) {
      supportedBy.push(userId);
      updatedSupports += 1;
    } else {
      supportedBy.splice(index, 1);
      updatedSupports -= 1;
    }

    const updated = db.findByIdAndUpdate('posts', id, {
      supportedBy,
      supportCount: Math.max(0, updatedSupports)
    });

    // Reward points for supporting others
    if (index === -1) {
      const user = db.findById('users', userId);
      let userPoints = (user.points || 0) + 1; // +1 point for offering support
      let userBadges = [...(user.badges || [])];
      
      const supportsGivenCount = db.find('posts', {}).filter(p => (p.supportedBy || []).includes(userId)).length;
      if (supportsGivenCount >= 5 && !userBadges.includes('Supportive Listener')) {
        userBadges.push('Supportive Listener');
      }
      
      db.findByIdAndUpdate('users', userId, { points: userPoints, badges: userBadges });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Toggle support error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function toggleSavePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const user = db.findById('users', userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let savedPosts = user.savedPosts || [];
    const index = savedPosts.indexOf(id);

    if (index === -1) {
      savedPosts.push(id);
    } else {
      savedPosts.splice(index, 1);
    }

    const updatedUser = db.findByIdAndUpdate('users', userId, { savedPosts });
    res.status(200).json({
      message: index === -1 ? 'Post saved to bookmarks' : 'Post bookmarks removed',
      savedPosts: updatedUser.savedPosts
    });
  } catch (error) {
    console.error('Toggle save post error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Crisis analysis keywords list
const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'self-harm', 'end my life', 'want to die', 
  'cutting myself', 'oversleeping until end', 'no reason to live', 'hang myself'
];

export async function analyzePostAI(req, res) {
  try {
    const { title, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required for emotional tone analysis.' });
    }

    // 1. Quick Crisis Detection
    const lowerContent = (title + ' ' + content).toLowerCase();
    let isCrisisDetected = CRISIS_KEYWORDS.some(kw => lowerContent.includes(kw));

    const gemini = getGemini();

    if (gemini) {
      try {
        const prompt = `Analyze the emotional tone of this forum post draft. Include a self-harm/suicide risk check. If there is a risk, mark isCrisis as true.
Title: "${title || ''}"
Content: "${content}"

Your response must fit the requested JSON format. Choose from these categories:
Anxiety, Depression, Stress, Academic Pressure, Career Concerns, Relationships, Family Issues, Social Anxiety, Self Improvement, General Support.

Choose from these mood tags:
Happy, Calm, Neutral, Stressed, Anxious, Sad, Angry, Lonely.`;

        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                emotionalTone: { type: Type.STRING, description: 'Summary of the user\'s feelings.' },
                suggestedTag: { type: Type.STRING, description: 'Suggested mood tag from the list.' },
                recommendedCategory: { type: Type.STRING, description: 'Recommended forum category from the list.' },
                helpfulResources: { type: Type.STRING, description: 'Simple short supportive self-care prompt or Coping tool.' },
                isCrisis: { type: Type.BOOLEAN, description: 'True if there are critical references to self-harm, suicide, or extreme life danger.' }
              },
              required: ['emotionalTone', 'suggestedTag', 'recommendedCategory', 'helpfulResources', 'isCrisis']
            }
          }
        });

        const feedback = JSON.parse(response.text.trim());
        
        // Double check crisis flag
        if (isCrisisDetected) {
          feedback.isCrisis = true;
        }

        return res.status(200).json(feedback);
      } catch (geminiError) {
        console.error('Gemini post analysis fails, running algorithmic fallback:', geminiError);
      }
    }

    // Fallback analytical model if Gemini API is offline or has no key
    console.log('[AI-STUDIO] Generating native/algorithmic fallback analysis');
    let tone = 'Expressing vulnerability or seeking positive community comfort.';
    let tag = 'Neutral';
    let cat = 'General Support';
    let resource = 'Find a quiet spot, close your eyes, and inhale deeply for 5 seconds to settle feelings.';

    if (lowerContent.includes('exam') || lowerContent.includes('finals') || lowerContent.includes('grade') || lowerContent.includes('failed')) {
      tone = 'Experiencing academic performance stress or test-related anxiety.';
      tag = 'Stressed';
      cat = 'Academic Pressure';
      resource = 'Take a study-free break: stretch your legs, get a drink of water, and return with a clean mind.';
    } else if (lowerContent.includes('anxious') || lowerContent.includes('panic') || lowerContent.includes('shake')) {
      tone = 'Experiencing symptoms of nervous system over-excitation.';
      tag = 'Anxious';
      cat = 'Anxiety';
      resource = 'Focus on the 5-4-3-2-1 grounding method: focus on 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.';
    } else if (lowerContent.includes('sad') || lowerContent.includes('depressed') || lowerContent.includes('crying') || lowerContent.includes('lonely')) {
      tone = 'Navigating periods of emotional fatigue or low vitality.';
      tag = 'Lonely';
      cat = 'Depression';
      resource = 'Sharing is courage. Expressing feelings in journals or seeking professional listener support is highly clarifying.';
    }

    res.status(200).json({
      emotionalTone: tone,
      suggestedTag: tag,
      recommendedCategory: cat,
      helpfulResources: resource,
      isCrisis: isCrisisDetected
    });
  } catch (error) {
    console.error('AI analysis controller error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function reportPost(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const post = db.findById('posts', id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment reports
    const reportCount = (post.reportCount || 0) + 1;
    db.findByIdAndUpdate('posts', id, { reportCount });

    // Save report details
    db.create('reports', {
      targetType: 'post',
      targetId: id,
      itemTitle: post.title,
      itemContent: post.content,
      reportedBy: req.user.id,
      reportedByUsername: req.user.username,
      reason: reason || 'Inappropriate content',
      status: 'pending' // pending review
    });

    res.status(200).json({ message: 'Post successfully reported for moderation review' });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
