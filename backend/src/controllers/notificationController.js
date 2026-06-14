import db from '../config/db.js';

export function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const list = db.find('notifications', { recipient: userId });
    
    // Sort youngest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.status(200).json(list);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = db.findById('notifications', id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient !== userId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const updated = db.findByIdAndUpdate('notifications', id, { read: true });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    const list = db.find('notifications', { recipient: userId, read: false });

    list.forEach(notif => {
      db.findByIdAndUpdate('notifications', notif.id, { read: true });
    });

    res.status(200).json({ message: 'All notifications successfully marked as read' });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
