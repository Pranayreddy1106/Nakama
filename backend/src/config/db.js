import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.resolve(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Helper to ensure directory exists
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initial default seed data
const DEFAULT_CHALLENGES = [
  { id: 'c1', title: '7-Day Meditation Challenge', description: 'Take 5-10 minutes every day to sit in quiet mindfulness.', days: 7, points: 100, badge: 'Mindfulness Master' },
  { id: 'c2', title: 'Daily Walk Challenge', description: 'Take a restorative 30-minute walk outside daily to clear your mind.', days: 10, points: 150, badge: 'Wellness Walker' },
  { id: 'c3', title: 'Hydration Challenge', description: 'Drink at least 8 glasses of water every day to support brain health.', days: 5, points: 50, badge: 'Hydrated Soul' },
  { id: 'c4', title: 'Gratitude Challenge', description: 'Post at least one thing you are grateful for on the Gratitude Wall every day.', days: 7, points: 120, badge: 'Gratitude Champion' },
  { id: 'c5', title: 'Sleep Improvement Challenge', description: 'Log off from all screens by 10 PM and aim for 8 hours of sleep.', days: 7, points: 100, badge: 'Zen Sleeper' }
];

const DEFAULT_BADGES = [
  { name: 'First Post', description: 'Shared your first supportive post on the forum.', icon: 'PenTool' },
  { name: 'First Comment', description: 'Offered encouragement or advice to another member.', icon: 'MessageSquare' },
  { name: 'Helpful Member', description: 'Earned 20+ points from supportive activities.', icon: 'Award' },
  { name: 'Supportive Listener', description: 'Offered positive feedback on 5+ other members\' posts.', icon: 'Heart' },
  { name: 'Gratitude Champion', description: 'Shared a gratitude post on the Gratitude Wall.', icon: 'Sun' },
  { name: '7-Day Streak', description: 'Completed a 7-day solid mood tracking or journaling streak.', icon: 'Flame' },
  { name: '30-Day Streak', description: 'Maintained mood tracking or journals for 30 consecutive days.', icon: 'ShieldCheck' },
  { name: 'Community Helper', description: 'Made 10+ comment replies to general discussion boards.', icon: 'Users' },
  { name: 'Wellness Warrior', description: 'Completed at least one Community Challenge successfully.', icon: 'Trophy' }
];

const DEFAULT_CHAT_ROOMS = [
  { id: 'cr_general', name: 'General Support', category: 'General Support', activeUsersCount: 15 },
  { id: 'cr_students', name: 'Students & Academics', category: 'Academic Pressure', activeUsersCount: 8 },
  { id: 'cr_career', name: 'Career Opportunities & Stress', category: 'Career Concerns', activeUsersCount: 6 },
  { id: 'cr_anxiety', name: 'Anxiety Support Circle', category: 'Social Anxiety', activeUsersCount: 12 },
  { id: 'cr_relationships', name: 'Relationships Advice', category: 'Relationships', activeUsersCount: 9 },
  { id: 'cr_wellness', name: 'Wellness Discussions', category: 'Self Improvement', activeUsersCount: 5 }
];

const generateStarterPosts = () => {
  return [];
};

const DEFAULT_COMMENTS = [];

class LocalDatabase {
  constructor() {
    this.data = {
      users: [],
      posts: [],
      comments: [],
      moodEntries: [],
      gratitudes: [],
      challenges: DEFAULT_CHALLENGES,
      userChallenges: [],
      notifications: [],
      chatRooms: DEFAULT_CHAT_ROOMS,
      messages: [],
      reports: [],
      badges: DEFAULT_BADGES,
      peerMatches: []
    };
    
    this.mongoConnected = false;
    this.mdb = null;
    
    // Initial cache loading from JSON
    this.loadLocalJson();
    
    // Connect to MongoDB Atlas
    this.connectMongo();
  }

  loadLocalJson() {
    try {
      ensureDirectoryExists(DB_DIR);
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(content);
        this.data = {
          users: parsed.users || [],
          posts: parsed.posts || generateStarterPosts(),
          comments: parsed.comments || DEFAULT_COMMENTS,
          moodEntries: parsed.moodEntries || [],
          gratitudes: parsed.gratitudes || [],
          challenges: parsed.challenges && parsed.challenges.length ? parsed.challenges : DEFAULT_CHALLENGES,
          userChallenges: parsed.userChallenges || [],
          notifications: parsed.notifications || [],
          chatRooms: parsed.chatRooms && parsed.chatRooms.length ? parsed.chatRooms : DEFAULT_CHAT_ROOMS,
          messages: parsed.messages || [],
          reports: parsed.reports || [],
          badges: DEFAULT_BADGES,
          peerMatches: parsed.peerMatches || []
        };
      } else {
        this.data.posts = generateStarterPosts();
        this.data.comments = DEFAULT_COMMENTS;
        this.saveLocalJson();
      }
    } catch (e) {
      console.error('Error loading local JSON database:', e);
    }
  }

  saveLocalJson() {
    try {
      ensureDirectoryExists(DB_DIR);
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving local JSON database:', e);
    }
  }

  async connectMongo() {
    const defaultUri = "mongodb+srv://pranay:pranay%402345@auraforum.cppegoq.mongodb.net/?appName=auraforum";
    const mongoUri = process.env.MONGODB_URI || defaultUri;
    
    console.log(`[MONGO] Connecting to MongoDB Atlas database...`);
    try {
      const client = new MongoClient(mongoUri);
      await client.connect();
      // Use "auraforum" as DBName
      this.mdb = client.db('auraforum');
      this.mongoConnected = true;
      console.log(`[MONGO] Successfully connected to MongoDB Atlas!`);
      
      // Perform database cleanup of legacy seeded/mock users
      const usersCol = this.mdb.collection('users');
      const deleteResult = await usersCol.deleteMany({
        email: { 
          $nin: [
            'admin@forum.com', 
            'pranayreddy1116@gmail.com'
          ] 
        }
      });
      console.log(`[CLEANUP] Wiped ${deleteResult.deletedCount} legacy test/seeded users from Atlas.`);

      // Clean up orphaned posts, comments and mood logs from deleted test accounts
      const remainingUsers = await usersCol.find({}).toArray();
      const validUserIds = remainingUsers.map(u => u.id).filter(Boolean);
      
      if (validUserIds.length > 0) {
        await this.mdb.collection('posts').deleteMany({ user: { $nin: validUserIds } });
        await this.mdb.collection('comments').deleteMany({ user: { $nin: validUserIds } });
        await this.mdb.collection('moodEntries').deleteMany({ user: { $nin: validUserIds } });
      }

      // Hydrate local cache
      await this.hydrateFromMongo();
    } catch (err) {
      console.error(`[MONGO ERROR] Failed to connect to MongoDB Atlas:`, err);
      console.log(`[MONGO FALLBACK] Falling back to high-resilience local JSON datastore.`);
    }
  }

  async hydrateFromMongo() {
    if (!this.mongoConnected) return;

    try {
      const collections = [
        'users', 'posts', 'comments', 'moodEntries', 'gratitudes', 
        'challenges', 'userChallenges', 'notifications', 'chatRooms', 
        'messages', 'reports', 'badges', 'peerMatches'
      ];

      for (const col of collections) {
        const mongoCollection = this.mdb.collection(col);
        const count = await mongoCollection.countDocuments();
        
        if (count === 0) {
          // Empty remote collection - Seed it from current memory data
          const currentMemoryData = this.data[col] || [];
          if (currentMemoryData.length > 0) {
            console.log(`[MONGO SEED] Seeding collection '${col}' to Mongo Atlas (${currentMemoryData.length} records)...`);
            const cleanDocs = currentMemoryData.map(doc => {
              const { _id, ...rest } = doc;
              return rest;
            });
            await mongoCollection.insertMany(cleanDocs);
          }
        } else {
          // Documents exist in Atlas - Hydrate our local cache
          console.log(`[MONGO HYDRATE] Hydrating cache for '${col}' (${count} docs) from Atlas...`);
          const docs = await mongoCollection.find({}).toArray();
          this.data[col] = docs.map(doc => {
            const { _id, ...rest } = doc;
            return rest;
          });
        }
      }
      
      this.saveLocalJson();
      console.log(`[MONGO HYDRATE] Cache fully synchronized.`);
    } catch (err) {
      console.error(`[MONGO HYDRATE ERROR] Failed to sync collections from Atlas:`, err);
    }
  }

  // Consistent API wrappers (Mimics MongoDB synchronously on cache for performance)
  find(collection, query = {}, sort = null, limit = null, skip = null) {
    let list = this.data[collection] || [];
    
    // Filter matching
    list = list.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined) {
          const expected = query[key];
          const actual = item[key];
          
          if (Array.isArray(actual)) {
            if (!actual.includes(expected)) return false;
          } else if (actual !== expected) {
            return false;
          }
        }
      }
      return true;
    });

    let results = JSON.parse(JSON.stringify(list));

    // Sorting
    if (sort) {
      const sortKey = Object.keys(sort)[0];
      const order = sort[sortKey]; // -1 for desc, 1 for asc
      results.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (typeof valA === 'string' && Date.parse(valA)) {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (valA < valB) return order === -1 ? 1 : -1;
        if (valA > valB) return order === -1 ? -1 : 1;
        return 0;
      });
    }

    // Skip and Limit
    if (skip !== null) {
      results = results.slice(skip);
    }
    if (limit !== null) {
      results = results.slice(0, limit);
    }

    return results;
  }

  findOne(collection, query = {}) {
    const list = this.find(collection, query);
    return list.length > 0 ? list[0] : null;
  }

  findById(collection, id) {
    const list = this.data[collection] || [];
    const found = list.find(item => item.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  create(collection, data) {
    const list = this.data[collection] || [];
    const newItem = {
      id: collection.slice(0, 3) + '_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
      createdAt: new Date().toISOString(),
      ...data
    };
    list.push(newItem);
    this.saveLocalJson();
    
    // Non-blocking asynchronous sync to MongoDB Atlas
    if (this.mongoConnected) {
      this.mdb.collection(collection).insertOne(JSON.parse(JSON.stringify(newItem)))
        .then(() => console.log(`[MONGO ASYNC] Persisted doc to Atlas: ${collection} / ${newItem.id}`))
        .catch(err => console.error(`[MONGO ASYNC ERROR] Failed to create doc on Atlas:`, err));
    }
    
    return JSON.parse(JSON.stringify(newItem));
  }

  findByIdAndUpdate(collection, id, updates) {
    const list = this.data[collection] || [];
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveLocalJson();
      const updatedDoc = list[index];

      // Non-blocking asynchronous update to MongoDB Atlas
      if (this.mongoConnected) {
        this.mdb.collection(collection).updateOne({ id }, { $set: JSON.parse(JSON.stringify(updates)) })
          .then(() => console.log(`[MONGO ASYNC] Updated doc in Atlas: ${collection} / ${id}`))
          .catch(err => console.error(`[MONGO ASYNC ERROR] Failed to update doc on Atlas:`, err));
      }

      return JSON.parse(JSON.stringify(updatedDoc));
    }
    return null;
  }

  findByIdAndRemove(collection, id) {
    const list = this.data[collection] || [];
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      const removed = list.splice(index, 1)[0];
      this.saveLocalJson();

      // Non-blocking asynchronous deletion from MongoDB Atlas
      if (this.mongoConnected) {
        this.mdb.collection(collection).deleteOne({ id })
          .then(() => console.log(`[MONGO ASYNC] Deleted doc in Atlas: ${collection} / ${id}`))
          .catch(err => console.error(`[MONGO ASYNC ERROR] Failed to delete doc on Atlas:`, err));
      }

      return JSON.parse(JSON.stringify(removed));
    }
    return null;
  }

  count(collection, query = {}) {
    return this.find(collection, query).length;
  }
}

const db = new LocalDatabase();
export default db;
