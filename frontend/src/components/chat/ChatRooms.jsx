import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services.js';
import { 
  MessageCircle, Smile, Shield, Compass, Heart, Send, AlertTriangle, Users, 
  RotateCw, AlertCircle, Trash2, X, HelpCircle, CheckCircle2 
} from 'lucide-react';

const STATIC_ROOMS = [
  { id: 'general_support', name: 'General Support Circle', desc: 'A safe, warm space to talk about overall wellness concerns.' },
  { id: 'students', name: 'Student Support Center', desc: 'Focusing on exams, homework pressures, and campus stress.' },
  { id: 'career_worries', name: 'Career & Ambition Anxiety', desc: 'Workplace burnout, job interviews, and financial worries.' },
  { id: 'anxiety_support', name: 'Anxiety & Panic Shelter', desc: 'Share grounding logs and breathing support during tough moments.' }
];

const MATCH_TOPICS = [
  'Academic Stress', 'Career Anxiety', 'Relationships', 'Social Anxiety', 'Family Issues', 'Daily Burnout'
];

export default function ChatRooms({ user }) {
  const [activeTab, setActiveTab] = useState('rooms_list'); // 'rooms_list' | 'matching_queue' | 'chat_view' | 'recommendations_dashboard'
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMsgText, setNewMsgText] = useState('');

  // Peer Match Queue variables
  const [queuing, setQueuing] = useState(false);
  const [queuingTopic, setQueuingTopic] = useState('');
  const [matchStatus, setMatchStatus] = useState('');

  // Peer Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  // Status banners
  const [errorBanner, setErrorBanner] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const chatRoomsContainerRef = useRef(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  // Polling messages while chat screen is active
  useEffect(() => {
    let interval;
    if (activeTab === 'chat_view' && currentRoomId) {
      fetchMessages(currentRoomId);
      interval = setInterval(() => {
        fetchMessages(currentRoomId);
      }, 3000); // Poll messages every 3s
    }
    return () => clearInterval(interval);
  }, [activeTab, currentRoomId]);

  // Handle scrolling to bottom of messages feed
  useEffect(() => {
    if (chatRoomsContainerRef.current) {
      chatRoomsContainerRef.current.scrollTop = chatRoomsContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const data = await api.getChatRooms();
      setRooms(data);
    } catch (err) {
      setErrorBanner('Could not load active peer circles list');
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const data = await api.getRoomMessages(roomId);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim() || !currentRoomId) return;

    try {
      const added = await api.sendChatMessage(currentRoomId, newMsgText);
      setNewMsgText('');
      setMessages(prev => [...prev, added]);
    } catch (err) {
      setErrorBanner('Could not deliver message to peer room');
    }
  };

  const handleEnterRoom = (room) => {
    setCurrentRoomId(room.id);
    setCurrentRoomName(room.name);
    setMessages([]);
    setActiveTab('chat_view');
  };

  const handleTriggerMatch = async (topic) => {
    setErrorBanner('');
    setQueuingTopic(topic);
    setQueuing(true);
    setMatchStatus('initiating security key pairs');
    setActiveTab('matching_queue');

    try {
      const res = await api.joinMatchQueue(topic);
      
      if (res.chatRoom) {
        // Instant match!
        setMatchStatus('match found! configuring room');
        setSuccessBanner(res.message);
        setTimeout(() => {
          setSuccessBanner('');
          handleEnterRoom(res.chatRoom);
          setQueuing(false);
        }, 1500);
      } else {
        // Placed in queue. Waiting for automatic simulated bot partner or real user!
        setMatchStatus('searching supportive peers...');
        
        let timer = setTimeout(async () => {
          // Poll server again to verify if matched
          try {
            const data = await api.joinMatchQueue(topic);
            if (data.chatRoom) {
              setMatchStatus('match found! complete');
              handleEnterRoom(data.chatRoom);
            } else {
              setErrorBanner('Matching room timeout. Please trigger queue again.');
              setActiveTab('rooms_list');
            }
            setQueuing(false);
          } catch (pollingErr) {
            setErrorBanner('Error processing match');
            setActiveTab('rooms_list');
            setQueuing(false);
          }
        }, 6000);
      }
    } catch (err) {
      setErrorBanner('Error pairing. Please login or try again later.');
      setActiveTab('rooms_list');
      setQueuing(false);
    }
  };

  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    setLoadingRecs(true);
    setActiveTab('recommendations_dashboard');
    setRecommendations([]);
    setErrorBanner('');

    try {
      const data = await api.getPeerRecommendations(topic);
      setRecommendations(data);
    } catch (err) {
      setErrorBanner('Could not load compatible companion peers');
      setActiveTab('rooms_list');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleInvitePeer = async (partnerId) => {
    setErrorBanner('');
    try {
      const btn = document.getElementById(`btn-invite-${partnerId}`);
      if (btn) btn.innerText = "Opening dialogue room...";
      
      const res = await api.invitePeerToChat(partnerId, selectedTopic);
      setSuccessBanner(res.message);
      setTimeout(() => {
        setSuccessBanner('');
        handleEnterRoom(res.chatRoom);
      }, 1500);
    } catch (err) {
      setErrorBanner('Could not establish dialogue invitation');
    }
  };

  const handleBlockRoom = async (roomId) => {
    if (!window.confirm('Are you sure you would like to block and permanently clear this private dialogue for absolute safety? This action is irreversible.')) return;
    try {
      await api.blockChatRoom(roomId);
      setSuccessBanner('Room blocked and disarmed safely. All matching trace has been removed.');
      setActiveTab('rooms_list');
      await fetchRooms();
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (err) {
      setErrorBanner('Could not block peer room');
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-6" id="chatrooms-container">
      {/* Page Title Header */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-xs font-semibold w-fit tracking-wide">
        <Compass className="w-3.5 h-3.5 text-teal-400" />
        Support Channels & Safe Pairing
      </div>

      {/* Global Alerts */}
      {errorBanner && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex gap-2 max-w-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
          <button onClick={() => setErrorBanner('')} className="ml-auto text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>
      )}

      {successBanner && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex gap-2 max-w-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner('')} className="ml-auto text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main Two-Column Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: CHATS & MATCHMAKER SIDEBAR ================= */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-[650px]">
          
          {/* Section 1: Peer Matchmaker Topics */}
          <div className="bg-slate-850 p-5 border border-slate-800 rounded-3xl space-y-4" id="peer-matchmaker-card">
            <div className="flex items-center gap-1.5 text-teal-400 font-semibold font-sans text-xs uppercase tracking-wider">
              Peer Support Matchmaker
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Facing difficulties? Choose an interest topic to find compatible helper peers or launch auto-matching.
            </p>
            <div className="space-y-1.5" id="matchmaker-triggers">
              {MATCH_TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => handleSelectTopic(topic)}
                  className={`w-full text-left border px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    selectedTopic === topic && activeTab === 'recommendations_dashboard'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 font-semibold'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-750 text-slate-300'
                  }`}
                  id={`btn-match-${topic.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <span>🍀 {topic}</span>
                  <span className="text-[9px] bg-teal-500/15 text-teal-400 border border-teal-500/25 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider font-bold">Match</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Active Chats & Circles List */}
          <div className="flex-1 bg-slate-850 border border-slate-800 rounded-3xl p-5 flex flex-col overflow-hidden">
            <h3 className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase mb-3">Chats & Support Circles</h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {/* Static support circles */}
              {STATIC_ROOMS.map(ch => {
                const isActive = currentRoomId === ch.id && activeTab === 'chat_view';
                return (
                  <div 
                    key={ch.id}
                    onClick={() => handleEnterRoom({ id: ch.id, name: ch.name })}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border flex items-center gap-3 ${
                      isActive 
                        ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 font-semibold' 
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-750 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      #
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs text-slate-200 truncate font-semibold">{ch.name}</h4>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">Public Open Circle</p>
                    </div>
                  </div>
                );
              })}

              {/* Private Matched conversations */}
              {rooms.filter(r => r._type === 'peer_match').map(pairRoom => {
                const isActive = currentRoomId === pairRoom.id && activeTab === 'chat_view';
                return (
                  <div 
                    key={pairRoom.id}
                    onClick={() => handleEnterRoom(pairRoom)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border flex items-center gap-3 ${
                      isActive 
                        ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 font-semibold' 
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-750 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500/10 text-teal-400 text-xs font-bold">
                      💬
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs text-slate-200 truncate font-semibold">{pairRoom.name}</h4>
                      <p className="text-[9px] text-teal-400 truncate mt-0.5 font-semibold">Matched Dialogue</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: CHAT VIEW OR PLACEHOLDERS ================= */}
        <div className="lg:col-span-2 h-[650px] flex flex-col">
          
          {/* Case 1: Active Chat Room View */}
          {activeTab === 'chat_view' && currentRoomId && (
            <div className="bg-slate-850 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-full" id="live-chat-panel">
              {/* Chat Header */}
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-semibold text-slate-200 text-sm leading-tight">{currentRoomName}</h4>
                  <span className="text-[11px] text-slate-500 font-mono tracking-wide">Anonymity Shield Active</span>
                </div>

                {/* Block / Disband button (Only for private P2P rooms) */}
                {currentRoomId.startsWith('match') && (
                  <button
                    onClick={() => handleBlockRoom(currentRoomId)}
                    className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/25 hover:border-rose-400 text-rose-400 font-mono text-[9px] font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                    title="Disband room immediately for safety"
                  >
                    Block dialogue
                  </button>
                )}
              </div>

              {/* Messages feed */}
              <div ref={chatRoomsContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-slate-900/40">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-12">No messages in room yet. Offer a friendly, anonymous hello!</p>
                ) : (
                  messages.map((msg, index) => {
                    const isSystem = msg.senderAvatar === 'system';
                    const isMe = msg.senderId === user?.id;

                    if (isSystem) {
                      return (
                        <div key={index} className="flex justify-center">
                          <div className="bg-teal-500/10 border border-teal-500/10 text-teal-400 px-4 py-2 rounded-2xl max-w-sm text-center text-[10px] font-sans font-medium">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={index} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`} id={`chatmsg-${index}`}>
                        <img 
                          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${msg.senderUsername || 'Default'}`} 
                          alt="anon" 
                          className="w-7 h-7 rounded-full bg-slate-850 border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        
                        <div className="space-y-1 max-w-[70%]">
                          <div className={`flex items-center gap-1.5 text-[10px] text-slate-500 ${isMe ? 'justify-end' : ''}`}>
                            <span className="font-mono font-bold text-slate-400">{msg.senderUsername}</span>
                            <span>&bull; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 rounded-tr-none font-semibold' 
                              : 'bg-slate-850 text-slate-200 rounded-tl-none boundary-card'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message input line form */}
              <div className="bg-slate-900 px-5 py-4 border-t border-slate-800">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input 
                    type="text" 
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-850 border border-slate-800 focus:border-teal-400 rounded-2xl text-xs text-slate-200 outline-none"
                    placeholder="Write supportive messaging..."
                    required
                  />
                  <button 
                    type="submit"
                    className="px-5 py-3.5 bg-gradient-to-r from-teal-500 to-sky-500 text-slate-900 rounded-2xl text-xs font-bold shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4 fill-slate-900 shrink-0" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Case 2: Compatible Companions Recommendations Matchboard */}
          {activeTab === 'recommendations_dashboard' && (
            <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 h-full flex flex-col overflow-hidden" id="recommendations-dashboard">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide uppercase">Compatible Companions</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Matching focus: <span className="text-teal-400 font-bold font-mono">"{selectedTopic}"</span>
                  </p>
                </div>

                <button
                  onClick={() => handleTriggerMatch(selectedTopic)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-teal-400 font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                >
                  🚀 Instant Auto-Match
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                {loadingRecs ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent animate-spin rounded-full inline-block" />
                    <p className="text-xs text-slate-500 font-mono">Searching compatible companion coordinates...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.length === 0 ? (
                      <div className="p-12 text-center col-span-2 text-slate-400 text-xs">
                        No active coordinates available currently. Tap auto-matching fallback above!
                      </div>
                    ) : (
                      recommendations.map(peer => (
                        <div 
                          key={peer.id}
                          className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-750 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2.5">
                                <img 
                                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${peer.avatarSeed || 'Calm'}`} 
                                  alt="avatar" 
                                  className="w-10 h-10 rounded-full bg-slate-950 border border-slate-850 p-0.5"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <span className="font-mono text-xs font-bold text-slate-100 block">{peer.username}</span>
                                  <span className="text-[9px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5 font-bold border border-teal-500/10">
                                    {peer.matchScore}% Match
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] text-slate-500 block font-mono">Rating</span>
                                <span className="text-xs font-bold font-mono text-slate-300">{peer.points} XP</span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-950 mt-3 leading-relaxed font-sans italic">
                              "{peer.note}"
                            </div>
                          </div>
                          <button
                            id={`btn-invite-${peer.id}`}
                            onClick={() => handleInvitePeer(peer.id)}
                            className="w-full py-2 bg-gradient-to-r from-teal-500 to-sky-500 text-slate-900 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Invite to Chat
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Case 3: Matchmaker Queue Spinner */}
          {activeTab === 'matching_queue' && (
            <div className="bg-slate-850 border border-slate-800 rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center space-y-6" id="matching-spinner">
              <div className="relative inline-block w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-900 rounded-full" />
                <div className="absolute inset-0 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-xl">💑</span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-200">Establishing Supportive Pair</h3>
                <span className="text-xs font-mono font-bold text-teal-400 block tracking-wider uppercase mt-1">Topic: {queuingTopic}</span>
              </div>

              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Placing your anonymous coordinates in the queue. Match status: <span className="font-mono text-slate-300 italic">"{matchStatus}"</span>.
              </p>

              <button
                onClick={() => {
                  setQueuing(false);
                  setActiveTab('rooms_list');
                }}
                className="px-6 py-2 bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer font-bold font-mono"
              >
                Cancel queue search
              </button>
            </div>
          )}

          {/* Case 4: Default Empty State */}
          {activeTab === 'rooms_list' && (
            <div className="bg-slate-850 border border-slate-800 rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center space-y-4" id="chat-empty-placeholder">
              <div className="w-16 h-16 bg-slate-900/80 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 text-2xl">
                💬
              </div>
              <h3 className="text-md font-semibold text-slate-200">Select a Chat or Matchmaker Topic</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Choose one of our public open circles from the sidebar to talk with the community, or select a peer match topic to invite supportive listeners.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
