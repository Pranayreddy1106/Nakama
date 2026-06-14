import db from '../config/db.js';

export function getChallenges(req, res) {
  try {
    const list = db.find('challenges', {});
    const userId = req.user.id;
    
    // Fetch user progress for each challenge
    const userProgresses = db.find('userChallenges', { user: userId });

    const results = list.map(challenge => {
      const prog = userProgresses.find(p => p.challenge === challenge.id);
      return {
        ...challenge,
        joined: !!prog,
        progress: prog ? prog.progress : 0,
        status: prog ? prog.status : 'not_started',
        userChallengeId: prog ? prog.id : null
      };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function joinChallenge(req, res) {
  try {
    const { challengeId } = req.body;
    const userId = req.user.id;

    if (!challengeId) {
      return res.status(400).json({ message: 'Challenge ID is required' });
    }

    const challenge = db.findById('challenges', challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if already joined
    const existing = db.findOne('userChallenges', { user: userId, challenge: challengeId });
    if (existing) {
      return res.status(400).json({ message: 'You have already joined this wellness challenge', data: existing });
    }

    const joined = db.create('userChallenges', {
      user: userId,
      challenge: challengeId,
      progress: 0,
      status: 'joined',
      lastCompletedDate: null
    });

    res.status(201).json({
      message: `You successfully joined the ${challenge.title}! Focus and track your daily habits.`,
      userChallenge: joined
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function updateChallengeProgress(req, res) {
  try {
    const { id } = req.params; // userChallenge id
    const userId = req.user.id;

    const userChallenge = db.findById('userChallenges', id);
    if (!userChallenge) {
      return res.status(404).json({ message: 'Challenge record not found' });
    }

    if (userChallenge.user !== userId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (userChallenge.status === 'completed') {
      return res.status(400).json({ message: 'You have already completed this challenge!' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    if (userChallenge.lastCompletedDate === todayDate) {
      return res.status(400).json({ message: 'You have already updated this habits challenge today. Come back tomorrow!' });
    }

    const challenge = db.findById('challenges', userChallenge.challenge);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge definition missing' });
    }

    const newProgress = userChallenge.progress + 1;
    let newStatus = 'joined';
    let rewardPoints = 0;
    let earnedBadge = null;

    if (newProgress >= challenge.days) {
      newStatus = 'completed';
      rewardPoints = challenge.points || 50; // exact challenge completion reward
      earnedBadge = challenge.badge;
    } else {
      rewardPoints = 5; // standard +5 points for check-in
    }

    // Update user challenge record
    const updatedUserChallenge = db.findByIdAndUpdate('userChallenges', id, {
      progress: newProgress,
      status: newStatus,
      lastCompletedDate: todayDate
    });

    // Update user points and badges
    const user = db.findById('users', userId);
    let userPoints = user.points + rewardPoints;
    let userBadges = [...(user.badges || [])];

    if (earnedBadge && !userBadges.includes(earnedBadge)) {
      userBadges.push(earnedBadge);
    }

    // Grant overall Wellness Warrior badge for completed challenges
    const completedCount = db.find('userChallenges', { user: userId, status: 'completed' }).length + (newStatus === 'completed' ? 1 : 0);
    if (completedCount >= 1 && !userBadges.includes('Wellness Warrior')) {
      userBadges.push('Wellness Warrior');
      userPoints += 50; // bonus
    }

    db.findByIdAndUpdate('users', userId, {
      points: userPoints,
      badges: userBadges
    });

    // Create in-app notification if completed
    if (newStatus === 'completed') {
      db.create('notifications', {
        recipient: userId,
        sender: 'system',
        senderUsername: 'System',
        type: 'badge',
        postId: '',
        postTitle: challenge.title,
        message: `congratulations! You completed your challenge and earned the "${earnedBadge}" badge!`,
        read: false
      });
    }

    res.status(200).json({
      message: newStatus === 'completed' 
        ? `Incredible job! You have fully completed the ${challenge.title} and unlocked the badge!`
        : `Daily habit check-in updated! Progress: ${newProgress}/${challenge.days} days.`,
      userChallenge: updatedUserChallenge,
      pointsEarned: rewardPoints,
      completed: newStatus === 'completed'
    });
  } catch (error) {
    console.error('Update challenge progress error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
