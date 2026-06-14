import db from '../config/db.js';

export function getAdminStats(req, res) {
  try {
    const users = db.find('users', {});
    const posts = db.find('posts', {});
    const comments = db.find('comments', {});
    const reports = db.find('reports', {});
    const moodEntries = db.find('moodEntries', {});
    const userChallenges = db.find('userChallenges', {});

    const totalUsers = users.length;
    const totalPosts = posts.length;
    const totalComments = comments.length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;

    // Calculate active users: logged in or modified in the last 7 days
    const activeUsers = users.filter(u => u.moodStreak > 0 || u.points > 0).length;

    // Calculate mood distribution aggregates
    const moodCounts = {
      Happy: 0, Calm: 0, Neutral: 0, Stressed: 0, Anxious: 0, Sad: 0, Angry: 0, Lonely: 0
    };
    moodEntries.forEach(entry => {
      if (moodCounts[entry.mood] !== undefined) {
        moodCounts[entry.mood] += 1;
      }
    });

    const moodDistribution = Object.keys(moodCounts).map(mood => ({
      name: mood,
      value: moodCounts[mood]
    })).filter(m => m.value > 0);

    // Calculate challenge statistics
    const challengeStats = {
      joined: userChallenges.filter(u => u.status === 'joined').length,
      completed: userChallenges.filter(u => u.status === 'completed').length,
    };

    // Crisis cues (any posts with high risk keyword count)
    const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'self-harm', 'want to die', 'cutting myself'];
    const crisisAlerts = posts.filter(post => {
      const text = (post.title + ' ' + post.content).toLowerCase();
      return CRISIS_KEYWORDS.some(kw => text.includes(kw)) || post.reportCount >= 3;
    }).map(post => ({
      id: post.id,
      title: post.title,
      author: post.username,
      reports: post.reportCount,
      createdAt: post.createdAt,
      dangerScore: CRISIS_KEYWORDS.some(kw => (post.title + ' ' + post.content).toLowerCase().includes(kw)) ? 'CRITICAL' : 'HIGH'
    }));

    res.status(200).json({
      summaryStats: {
        totalUsers,
        totalPosts,
        totalComments,
        pendingReports,
        activeUsers
      },
      moodDistribution,
      challengeStats,
      crisisAlerts,
      engagementRate: Math.round(((totalPosts + totalComments) / Math.max(1, totalUsers)) * 10) / 10
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function getAllUsersAdmin(req, res) {
  try {
    const users = db.find('users', {});
    // Hide passwords
    const sanitized = users.map(u => ({
      id: u.id,
      email: u.email,
      username: u.username,
      points: u.points,
      moodStreak: u.moodStreak || 0,
      joinDate: u.joinDate,
      isAdmin: !!u.isAdmin,
      isBanned: !!u.isBanned,
      isSuspended: !!u.isSuspended,
      verified: !!u.verified
    }));
    res.status(200).json(sanitized);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'ban', 'unban', 'suspend', 'unsuspend', 'promote'

    const user = db.findById('users', id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin && action !== 'suspend') {
      return res.status(400).json({ message: 'Cannot apply moderation logic on global administrator accounts' });
    }

    let updates = {};
    if (action === 'ban') updates.isBanned = true;
    if (action === 'unban') updates.isBanned = false;
    if (action === 'suspend') updates.isSuspended = true;
    if (action === 'unsuspend') updates.isSuspended = false;
    if (action === 'promote') updates.isAdmin = true;

    const updatedUser = db.findByIdAndUpdate('users', id, updates);

    res.status(200).json({
      message: `User status successfully updated for ${user.username}`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        isBanned: !!updatedUser.isBanned,
        isSuspended: !!updatedUser.isSuspended,
        isAdmin: !!updatedUser.isAdmin
      }
    });
  } catch (error) {
    console.error('Update user mod action error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function getFlaggedReports(req, res) {
  try {
    const list = db.find('reports', {});
    // Sort oldest or pending first
    list.sort((a, b) => b.status === 'pending' ? 1 : -1);
    res.status(200).json(list);
  } catch (error) {
    console.error('Get reports list error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function handleReportModeration(req, res) {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'dismiss', 'delete'

    const report = db.findById('reports', id);
    if (!report) {
      return res.status(404).json({ message: 'Report ticket not found' });
    }

    if (decision === 'delete') {
      if (report.targetType === 'post') {
        db.findByIdAndRemove('posts', report.targetId);
        // Clean up linked comments
        const comments = db.find('comments', { post: report.targetId });
        comments.forEach(c => db.findByIdAndRemove('comments', c.id));
      } else if (report.targetType === 'comment') {
        db.findByIdAndRemove('comments', report.targetId);
      }
      db.findByIdAndUpdate('reports', id, { status: 'resolved_deleted' });
    } else {
      // dismiss
      db.findByIdAndUpdate('reports', id, { status: 'resolved_dismissed' });
    }

    res.status(200).json({ message: `Report successfully resolved with decision: ${decision}` });
  } catch (error) {
    console.error('Moderation resolution error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
