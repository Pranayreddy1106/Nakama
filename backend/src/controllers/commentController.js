import db from '../config/db.js';

export function getCommentsByPost(req, res) {
  try {
    const { postId } = req.params;
    const comments = db.find('comments', { post: postId });
    
    // Sort oldest first for conversation flow
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function createComment(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const user = db.findById('users', userId);

    if (!content) {
      return res.status(400).json({ message: 'Comment content cannot be blank' });
    }

    const post = db.findById('posts', postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = db.create('comments', {
      post: postId,
      user: userId,
      username: user.username,
      avatarSeed: user.username,
      content,
      replies: []
    });

    // Update post comments count
    db.findByIdAndUpdate('posts', postId, {
      commentCount: (post.commentCount || 0) + 1
    });

    // Award points
    let userPoints = (user.points || 0) + 5; // +5 points for comments
    let userBadges = [...(user.badges || [])];
    if (!userBadges.includes('First Comment')) {
      userBadges.push('First Comment');
    }

    db.findByIdAndUpdate('users', userId, {
      points: userPoints,
      badges: userBadges,
      commentsCount: (user.commentsCount || 0) + 1
    });

    // Create in-app notification for post author (if not comment on own post)
    if (post.user !== userId) {
      db.create('notifications', {
        recipient: post.user,
        sender: userId,
        senderUsername: user.username,
        type: 'comment',
        postId: post.id,
        postTitle: post.title,
        message: 'shared a encouraging comment on your support post.',
        read: false
      });
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function replyToComment(req, res) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const user = db.findById('users', userId);

    if (!content) {
      return res.status(400).json({ message: 'Reply content cannot be blank' });
    }

    const comment = db.findById('comments', commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = {
      id: 'rep_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
      user: userId,
      username: user.username,
      avatarSeed: user.username,
      content,
      createdAt: new Date().toISOString()
    };

    const replies = comment.replies || [];
    replies.push(reply);

    const updatedComment = db.findByIdAndUpdate('comments', commentId, { replies });

    // Increase post's general comment count as well
    const post = db.findById('posts', comment.post);
    if (post) {
      db.findByIdAndUpdate('posts', post.id, {
        commentCount: (post.commentCount || 0) + 1
      });
    }

    // Notify comment author about reply (if not self)
    if (comment.user !== userId) {
      db.create('notifications', {
        recipient: comment.user,
        sender: userId,
        senderUsername: user.username,
        type: 'reply',
        postId: comment.post,
        postTitle: post ? post.title : 'Discussion Thread',
        message: 'replied to your encouragement thread.',
        read: false
      });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Reply comment error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const comment = db.findById('comments', id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Ensure comment owned or admin
    if (comment.user !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    db.findByIdAndRemove('comments', id);

    // Decrement post comment count
    const post = db.findById('posts', comment.post);
    if (post) {
      const decAmount = 1 + (comment.replies || []).length;
      db.findByIdAndUpdate('posts', post.id, {
        commentCount: Math.max(0, (post.commentCount || 0) - decAmount)
      });
    }

    res.status(200).json({ message: 'Comment successfully removed' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
