import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generateAnonName } from '../utils/generateAnonName.js';
import { generateToken } from '../utils/generateToken.js';

// Pre-seed a default administrator role for testing if not exists on start
const seedAdminUser = async () => {
  const existingAdmin = db.findOne('users', { email: 'admin@forum.com' });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    db.create('users', {
      email: 'admin@forum.com',
      password: hashedPassword,
      username: 'MentalHealthGuardian',
      avatarSeed: 'MentalHealthGuardian',
      joinDate: new Date().toISOString(),
      moodStreak: 0,
      badges: [],
      postsCount: 0,
      commentsCount: 0,
      savedPosts: [],
      points: 0,
      isAdmin: true,
      verified: true
    });
  }
};
seedAdminUser();

export async function register(req, res) {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = db.findOne('users', { email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let chosenUsername = username ? username.trim() : '';
    if (chosenUsername) {
      if (chosenUsername.length < 3 || chosenUsername.length > 25) {
        return res.status(400).json({ message: 'Anonymous handle must be between 3 and 25 characters.' });
      }
      const usernameExists = db.findOne('users', { username: chosenUsername });
      if (usernameExists) {
        return res.status(400).json({ message: 'This anonymous handle is already claimed. Try choosing a recommended variant!' });
      }
    } else {
      chosenUsername = generateAnonName();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Verification token simulation
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = db.create('users', {
      email: email.toLowerCase(),
      password: hashedPassword,
      username: chosenUsername,
      avatarSeed: chosenUsername, // Used for random avatars
      joinDate: new Date().toISOString(),
      moodStreak: 0,
      badges: [],
      postsCount: 0,
      commentsCount: 0,
      savedPosts: [],
      points: 0, // No starting points
      isAdmin: false,
      verified: true, // Auto-verified
      verificationCode: null
    });

    res.status(201).json({
      message: 'Registration successful! Welcome to Nakama.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        joinDate: user.joinDate,
        points: user.points,
        verified: true
      },
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    const user = db.findById('users', userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    const updatedUser = db.findByIdAndUpdate('users', userId, {
      verified: true,
      verificationCode: null,
      points: user.points // keep points as is
    });

    res.status(200).json({
      message: 'Email successfully verified! Welcome to Nakama.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        verified: updatedUser.verified,
        points: updatedUser.points,
        badges: updatedUser.badges
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const user = db.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        joinDate: user.joinDate,
        points: user.points,
        verified: user.verified,
        badges: user.badges || [],
        moodStreak: user.moodStreak || 0,
        isAdmin: user.isAdmin,
        savedPosts: user.savedPosts || []
      },
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = db.findOne('users', { email: email.toLowerCase() });

    if (!user) {
      // For security, don't leak user existence directly, but let's be descriptive for simulation
      return res.status(400).json({ message: 'No registered user matches this email address' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    db.findByIdAndUpdate('users', user.id, {
      resetToken,
      resetTokenExpiry: Date.now() + 3600000 // 1 hour validity
    });

    console.log(`[AI-STUDIO SIMULATION] Password reset email sent to ${email}. Token/Code: ${resetToken}`);

    res.status(200).json({
      message: 'Reset instructions have been sent to your email address.',
      resetTokenSimulation: resetToken // Expose for mock simulator testing
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    const user = db.findOne('users', { resetToken: token });
    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.findByIdAndUpdate('users', user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    res.status(200).json({
      message: 'Password successfully reset! You can now log in.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function getProfile(req, res) {
  try {
    const user = db.findById('users', req.user.id);
    if (!user) {
      return res.status(444).json({ message: 'Invalid session' });
    }

    const postsCount = db.count('posts', { user: user.id });
    const commentsCount = db.count('comments', { user: user.id });

    // Update real counts dynamically
    db.findByIdAndUpdate('users', user.id, { postsCount, commentsCount });

    const userSavedPostIds = user.savedPosts || [];
    const populatedSavedPosts = userSavedPostIds.map(id => {
      const p = db.findById('posts', id);
      return p ? { id: p.id, title: p.title, category: p.category } : null;
    }).filter(Boolean);

    const allPosts = user.isAdmin ? db.find('posts', {}) : [];
    const allComments = user.isAdmin ? db.find('comments', {}).map(c => {
      const commenter = db.findById('users', c.user);
      return {
        ...c,
        username: commenter ? commenter.username : 'Unknown'
      };
    }) : [];

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      joinDate: user.joinDate,
      moodStreak: user.moodStreak || 0,
      badges: user.badges || [],
      postsCount,
      commentsCount,
      savedPosts: populatedSavedPosts,
      points: user.points || 0,
      isAdmin: user.isAdmin,
      verified: user.verified,
      allPosts,
      allComments
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function getPublicStats(req, res) {
  try {
    const totalStories = db.count('posts', {});
    const totalWellnessJournals = db.count('moodEntries', {});
    const totalSupportReplies = db.count('comments', {});
    const activeMembers = db.count('users', {});
    const completedChallenges = db.count('userChallenges', { status: 'completed' });

    res.status(200).json({
      totalStories,
      totalWellnessJournals,
      totalSupportReplies,
      activeMembers,
      completedChallenges
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({ message: 'Failed to aggregate credentials' });
  }
}
