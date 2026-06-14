import db from '../config/db.js';

export function getGratitudes(req, res) {
  try {
    const list = db.find('gratitudes', {});
    // Sort youngest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.status(200).json(list);
  } catch (error) {
    console.error('Get gratitudes error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function createGratitude(req, res) {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const user = db.findById('users', userId);

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Gratitude message cannot be empty' });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // Enforce daily gratitude posting limits
    const existingToday = db.findOne('gratitudes', { user: userId, dateOnly: todayDate });
    if (existingToday) {
      return res.status(400).json({ message: 'You have already posted on the Gratitude Wall today. Keep the streak active tomorrow!' });
    }

    const newGratitude = db.create('gratitudes', {
      user: userId,
      username: user.username,
      avatarSeed: user.username,
      content,
      dateOnly: todayDate,
      supportCount: 0,
      supportedBy: []
    });

    // Award Points
    let points = (user.points || 0) + 5; // +5 points for spreading positivity!
    let badges = [...(user.badges || [])];

    if (!badges.includes('Gratitude Champion')) {
      badges.push('Gratitude Champion');
    }

    db.findByIdAndUpdate('users', userId, { points, badges });

    res.status(201).json(newGratitude);
  } catch (error) {
    console.error('Create gratitude error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function toggleSupportGratitude(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const gratitude = db.findById('gratitudes', id);

    if (!gratitude) {
      return res.status(404).json({ message: 'Gratitude card not found' });
    }

    let supportedBy = gratitude.supportedBy || [];
    let supportCount = gratitude.supportCount || 0;

    const index = supportedBy.indexOf(userId);
    if (index === -1) {
      supportedBy.push(userId);
      supportCount += 1;
    } else {
      supportedBy.splice(index, 1);
      supportCount -= 1;
    }

    const updated = db.findByIdAndUpdate('gratitudes', id, {
      supportedBy,
      supportCount: Math.max(0, supportCount)
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Toggle gratitude support error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
