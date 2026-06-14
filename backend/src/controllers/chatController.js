import db from '../config/db.js';

export function getChatRooms(req, res) {
  try {
    const list = db.find('chatRooms', {});
    res.status(200).json(list);
  } catch (error) {
    console.error('Fetch chat rooms error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function getChatMessages(req, res) {
  try {
    const { roomId } = req.params;
    const messages = db.find('messages', { chatRoom: roomId });
    // Sort oldest first (message trail)
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    res.status(200).json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function sendChatMessage(req, res) {
  try {
    const { roomId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const user = db.findById('users', userId);

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message content cannot be blank' });
    }

    const newMessage = db.create('messages', {
      chatRoom: roomId,
      senderId: userId,
      senderUsername: user.username,
      senderAvatar: user.username, // custom seeding
      text
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// ----------------------------------------------------
// Peer Matching Algorithms (State Simulators)
// ----------------------------------------------------
export function joinMatchQueue(req, res) {
  try {
    const { topic } = req.body; // e.g. 'Academic Stress', 'Relationships', etc
    const userId = req.user.id;
    const user = db.findById('users', userId);

    if (!topic) {
      return res.status(400).json({ message: 'Match interest topic selection is required' });
    }

    // Check if user already has an active peer-to-peer chatroom in this topic
    const existingMatch = db.find('chatRooms', {}).find(room => 
      room._type === 'peer_match' && 
      room.topic === topic && 
      (room.userA === userId || room.userB === userId)
    );

    if (existingMatch) {
      return res.status(200).json({
        message: 'Active peer match found. Redirecting you to conversation room!',
        chatRoom: existingMatch
      });
    }

    // Lock query queue candidates with the same topic but a different user
    const matchHolders = db.find('peerMatches', { topic, status: 'waiting' });
    const matchCandidate = matchHolders.find(holder => holder.user !== userId);

    if (matchCandidate) {
      // Create match! Complete the queue
      db.findByIdAndUpdate('peerMatches', matchCandidate.id, { status: 'matched' });
      db.create('peerMatches', {
        user: userId,
        username: user.username,
        topic,
        status: 'matched'
      });

      // Create a private peer_match chatroom
      const partner = db.findById('users', matchCandidate.user);
      const roomName = `Peer Guidance (${topic})`;
      const chatRoomId = 'match_' + Math.random().toString(36).substr(2, 9);

      const newMatchRoom = db.create('chatRooms', {
        id: chatRoomId,
        name: roomName,
        category: topic,
        _type: 'peer_match',
        topic,
        userA: userId,
        userA_name: user.username,
        userB: partner.id,
        userB_name: partner.username,
        activeUsersCount: 2
      });

      // Add system greeting message
      db.create('messages', {
        chatRoom: chatRoomId,
        senderUsername: 'Compassion Bot',
        senderAvatar: 'system',
        text: `Match established! Hello ${user.username} and ${partner.username}. You have been paired to talk about "${topic}" in complete safety and anonymity. Be supportive and remember you can block this room if needed.`
      });

      // Notify partner
      db.create('notifications', {
        recipient: partner.id,
        sender: 'system',
        senderUsername: 'System',
        type: 'match',
        postId: '',
        postTitle: topic,
        message: 'found a new anonymous peer matches interest! Chat is ready.',
        read: false
      });

      return res.status(201).json({
        message: 'Wonderful! Safe match found instantly. Start your anonymous check-in conversation.',
        chatRoom: newMatchRoom
      });
    } else {
      // Add current traveler to queue
      // Prevent duplicate waiting
      const waitingAlready = db.findOne('peerMatches', { user: userId, topic, status: 'waiting' });
      
      if (!waitingAlready) {
        db.create('peerMatches', {
          user: userId,
          username: user.username,
          topic,
          status: 'waiting'
        });
      }

      // Simulate an automatic matching delay bot helper if no real active queue is available!
      // This is a premium experience that ensures the user actually experiences a working match!
      setTimeout(() => {
        // Find if this specific user is still waiting after 10 seconds, match them with an artificial companion!
        const stillWaiting = db.findOne('peerMatches', { user: userId, topic, status: 'waiting' });
        if (stillWaiting) {
          db.findByIdAndUpdate('peerMatches', stillWaiting.id, { status: 'matched' });
          
          const botNames = ['SereneSwan88', 'QuietCat404', 'LivelyLark13', 'BraveBadger29'];
          const botUsername = botNames[Math.floor(Math.random() * botNames.length)];
          const chatRoomId = 'match_b_' + Math.random().toString(36).substr(2, 9);
          
          db.create('chatRooms', {
            id: chatRoomId,
            name: `Peer Guidance (${topic})`,
            category: topic,
            _type: 'peer_match',
            topic,
            userA: userId,
            userA_name: user.username,
            userB: 'bot_partner',
            userB_name: botUsername,
            activeUsersCount: 2
          });

          db.create('messages', {
            chatRoom: chatRoomId,
            senderUsername: 'Compassion Bot',
            senderAvatar: 'system',
            text: `Partner found! You are now speaking with helper ${botUsername} regarding your interest: "${topic}". Share safely under anonymous identities.`
          });

          db.create('messages', {
            chatRoom: chatRoomId,
            senderUsername: botUsername,
            senderAvatar: botUsername,
            text: `Hey there! Thank you for matching. I also struggle with "${topic}" from time to time. Tell me, how are you dealing with it today?`
          });
        }
      }, 5000);

      res.status(202).json({
        message: 'No available peers currently matching. We have placed you in our supportive queue, safe pairing will occur automatically in under 5s!',
        status: 'waiting'
      });
    }
  } catch (error) {
    console.error('Join match queue error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function blockPeerRoom(req, res) {
  try {
    const { roomId } = req.params;
    const room = db.findById('chatRooms', roomId);

    if (!room) {
      return res.status(404).json({ message: 'Group details not found' });
    }

    // Remove the chat room to simulate block
    db.findByIdAndRemove('chatRooms', roomId);
    
    // Remove linked messages if any
    const msgs = db.find('messages', { chatRoom: roomId });
    msgs.forEach(m => db.findByIdAndRemove('messages', m.id));

    res.status(200).json({ message: 'Chat blocks succeeded. Room disbanded safely for privacy protection.' });
  } catch (error) {
    console.error('Block room error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function getPeerRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { topic } = req.query;
    
    // Find all users (excluding current user and admin)
    const allUsers = db.find('users', {});
    const candidates = allUsers.filter(u => u.id !== userId && !u.isAdmin);
    
    const topicNotes = {
      'Academic Stress': 'Studying for exams, here to share study retention & breathing hacks',
      'Career Anxiety': 'Seeking balanced productivity and recovering from severe workplace burnout',
      'Relationships': 'Gentle listener here to evaluate boundaries, empathy, and social connections',
      'Social Anxiety': 'Working on quiet conversations, overthinking, and soothing grounding drills',
      'Family Issues': 'Offering a compassionate, confidential ear for personal family challenges',
      'Daily Burnout': 'Practicing slow living, sleep goals, and green outdoor walks'
    };
    
    const matchedRecommendations = candidates.map(u => {
      const score = Math.max(76, Math.min(99, 81 + ((u.username.charCodeAt(0) + (topic ? topic.charCodeAt(0) : 0)) % 19)));
      return {
        id: u.id,
        username: u.username,
        avatarSeed: u.avatarSeed || u.username,
        points: u.points || 0,
        moodStreak: u.moodStreak || 1,
        badges: u.badges || [],
        matchScore: score,
        status: 'Online',
        recentInterest: topic || 'General Support',
        note: topicNotes[topic] || 'Ready to match and listen unconditionally'
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(matchedRecommendations);
  } catch (error) {
    console.error('Get peer recommendations error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function invitePeerToChat(req, res) {
  try {
    const { partnerId, topic } = req.body;
    const userId = req.user.id;
    const user = db.findById('users', userId);
    const partner = db.findById('users', partnerId);
    
    if (!partner) {
      return res.status(404).json({ message: 'Selected companion peer not found' });
    }

    // Check if user already shares an active companion room regarding this topic
    const existingMatch = db.find('chatRooms', {}).find(room => 
      room._type === 'peer_match' && 
      ((room.userA === userId && room.userB === partnerId) || (room.userA === partnerId && room.userB === userId))
    );

    if (existingMatch) {
      return res.status(200).json({
        message: 'Active dialogue found! Reconnecting to room.',
        chatRoom: existingMatch
      });
    }

    const roomName = `Crew dialogue (${topic || 'Peer Match'})`;
    const chatRoomId = 'match_' + Math.random().toString(36).substr(2, 9);

    const newMatchRoom = db.create('chatRooms', {
      id: chatRoomId,
      name: roomName,
      category: topic || 'Direct Dialogue',
      _type: 'peer_match',
      topic: topic || 'Direct Invite',
      userA: userId,
      userA_name: user.username,
      userB: partner.id,
      userB_name: partner.username,
      activeUsersCount: 2
    });

    // Send Compassion Bot welcome message
    db.create('messages', {
      chatRoom: chatRoomId,
      senderUsername: 'Compassion Bot',
      senderAvatar: 'system',
      text: `Ship matching successful! Hello ${user.username} and ${partner.username}. You are now connected in complete privacy regarding: "${topic || 'Direct Match'}". Share support, listen, and stay safe.`
    });

    const standardResponses = [
      `Hi there companion! Thank you for inviting me to chat about ${topic}. How are you feeling today?`,
      `Ahoy! I saw your invite regarding ${topic}. I struggle with this too. Tell me what is going on.`,
      `Hello! I am happy to companion you regarding ${topic || 'our dialogue'}. No stress here, what is on your mind?`
    ];
    const initialNoteStr = standardResponses[partner.username.length % standardResponses.length];

    db.create('messages', {
      chatRoom: chatRoomId,
      senderUsername: partner.username,
      senderAvatar: partner.username,
      text: initialNoteStr
    });

    // Notify partner
    db.create('notifications', {
      recipient: partner.id,
      sender: 'system',
      senderUsername: 'System',
      type: 'match',
      postId: '',
      postTitle: topic || 'Peer chat',
      message: `invited you to an anonymous conversation! Chat room opened.`,
      read: false
    });

    res.status(201).json({
      message: `Dialogue invitation accepted! Active conversation room has been opened.`,
      chatRoom: newMatchRoom
    });
  } catch (error) {
    console.error('Invite peer to chat error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
