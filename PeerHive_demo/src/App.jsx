import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, LineChart, Line, CartesianGrid } from 'recharts';

// --- Firebase Configuration ---
import localFirebaseConfig  from './firebase/localFirebaseConfig';
const firebaseConfig = localFirebaseConfig;
const appId = firebaseConfig.projectId;
const ADMIN_EMAIL = "admin@peerhive.io";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Helper Components & Functions ---
const formatTimestamp = (ts) => ts ? new Date(ts.seconds * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '...';
const ZoneTag = ({ zone }) => {
    const styles = { Calm: 'bg-green-100 text-green-800', Stressed: 'bg-yellow-100 text-yellow-800', Overwhelmed: 'bg-red-100 text-red-800' };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[zone]}`}>{zone}</span>;
};
const simulateModel = (text) => {
    const k = { s: ['frustrating', 'angry', 'hate', 'stupid', 'bug', 'useless', 'wrong', 'fucking', 'shit', 'portal', 'deadline'], o: ['sad', 'crying', 'hopeless', 'failed', 'anxious', 'exhausted', 'dread', 'empty', 'lonely', "can't"] };
    const lt = text.toLowerCase();
    let sp = 0, op = 0;
    k.s.forEach(word => { if (lt.includes(word)) sp++; });
    k.o.forEach(word => { if (lt.includes(word)) op += 1.5; });
    const scores = { Calm: 0.5, Stressed: sp, Overwhelmed: op };
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
};

// --- Student View Components ---
const UpvoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>;
const DownvoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>;
const CommentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const PostCard = ({ post, onVote }) => (
    <div className="bg-white rounded-md border border-gray-300 flex hover:border-emerald-500 transition-all duration-300">
        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-l-md">
            <button onClick={() => onVote(post.id, 1)} className="p-1 rounded-full hover:bg-green-100 text-gray-500 hover:text-green-600"><UpvoteIcon /></button>
            <span className="font-bold text-sm my-1">{post.votes || 0}</span>
            <button onClick={() => onVote(post.id, -1)} className="p-1 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600"><DownvoteIcon /></button>
        </div>
        <div className="p-3 flex-grow"><div className="flex items-center gap-2 text-xs text-gray-500 mb-2"><span>Posted by <span className="font-semibold text-emerald-700">{post.author}</span></span><span>•</span><span>{formatTimestamp(post.timestamp)}</span></div><p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p><div className="flex items-center gap-4 mt-3"><ZoneTag zone={post.zone} /><button className="flex items-center gap-1 text-xs text-gray-500 font-semibold hover:bg-gray-200 p-1 rounded-md"><CommentIcon /><span>{Math.floor(Math.random() * 20)} Comments</span></button></div></div>
    </div>
);
const LiveAnalyzer = ({ user, onAnalyze }) => {
    const [text, setText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const handleAnalysis = async () => {
        if (!text.trim() || !user) return;
        setIsAnalyzing(true);
        const topZone = simulateModel(text);
        const authorName = user.isAnonymous ? `User-${user.uid.substring(0, 6)}` : (user.displayName || `Student-${user.uid.substring(0, 6)}`);
        await onAnalyze({ author: authorName, text, zone: topZone, timestamp: serverTimestamp(), votes: 1 });
        setText('');
        setIsAnalyzing(false);
    };
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm"><h3 className="font-bold text-slate-800 mb-2">Create a New Post</h3><textarea rows="5" value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-slate-800" placeholder="What's on your mind?"></textarea><button onClick={handleAnalysis} disabled={isAnalyzing || !user} className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">{isAnalyzing ? <div className="w-5 h-5 border-2 border-white border-t-emerald-500 rounded-full animate-spin"></div> : 'Analyze & Post'}</button></div>
    );
};
const StudentView = ({ user, posts, onVote, onAnalyze, onGoogleLogin, onAdminLogin }) => (
    <div className="max-w-7xl mx-auto"><header className="text-left mb-6 pb-4 border-b border-gray-300 flex justify-between items-center"><div_><h1 className="font-poppins text-4xl font-bold text-slate-900 tracking-tight">PeerHive Community 🐝</h1><p className="text-gray-500 mt-1 text-sm">A space for students to share and connect.</p></div_><AuthControls user={user} onGoogleLogin={onGoogleLogin} onAdminLogin={onAdminLogin} /></header><main className="grid lg:grid-cols-3 gap-8 items-start"><div className="lg:col-span-2">{!posts.length ? <div className="text-center p-12">Loading feed...</div> : <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar">{posts.map(post => <PostCard key={post.id} post={post} onVote={onVote} />)}</div>}</div><div className="lg:col-span-1"><LiveAnalyzer user={user} onAnalyze={onAnalyze} /></div></main></div>
);

// --- Admin Dashboard Components ---
const KpiCard = ({ title, value, change, icon, color }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"><div className="flex justify-between items-start"><div_><p className="text-sm text-gray-500">{title}</p><p className="text-3xl font-bold text-gray-800">{value}</p></div_><div className={`text-2xl p-2 rounded-full ${color.bg}`}>{icon}</div></div>{change && <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change} vs last hour</p>}</div>
);

const AdminDashboard = ({ posts, onLogout }) => {
    const { kpis, activityData, negativeKeywords } = useMemo(() => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
        const twoHoursAgo = new Date(now.getTime() - (120 * 60 * 1000));
        
        const postsLastHour = posts.filter(p => p.timestamp && p.timestamp.toDate() > oneHourAgo);
        const postsPrevHour = posts.filter(p => p.timestamp && p.timestamp.toDate() > twoHoursAgo && p.timestamp.toDate() <= oneHourAgo);
        
        const atRiskCount = postsLastHour.filter(p => p.zone !== 'Calm').length;
        const atRiskPrevCount = postsPrevHour.filter(p => p.zone !== 'Cal-m').length;
        const change = atRiskCount - atRiskPrevCount;
        
        const activity = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            activity[key] = { name: key, Calm: 0, Stressed: 0, Overwhelmed: 0 };
        }
        posts.forEach(p => {
            if (p.timestamp) {
                const key = p.timestamp.toDate().toISOString().split('T')[0];
                if (activity[key]) activity[key][p.zone]++;
            }
        });

        const negKeywords = {};
        const k = { s: ['frustrating', 'angry', 'hate', 'stupid', 'bug', 'useless', 'wrong', 'fucking', 'shit', 'portal', 'deadline'], o: ['sad', 'crying', 'hopeless', 'failed', 'anxious', 'exhausted', 'dread', 'empty', 'lonely', "can't"] };
        posts.forEach(p => {
            const lt = p.text.toLowerCase();
            [...k.s, ...k.o].forEach(word => {
                if(lt.includes(word)) {
                    negKeywords[word] = (negKeywords[word] || 0) + 1;
                }
            });
        });

        return {
            kpis: {
                totalPosts: posts.length,
                atRiskNow: atRiskCount,
                atRiskChange: `${change >= 0 ? '+' : ''}${change}`
            },
            activityData: Object.values(activity),
            negativeKeywords: Object.entries(negKeywords).sort(([,a],[,b]) => b-a).slice(0, 7).map(([name, value]) => ({name, count: value}))
        };
    }, [posts]);
    
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-6">
                <h1 className="font-poppins text-4xl font-bold text-slate-900">Admin Dashboard</h1>
                <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-600">Admin Logout</button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <KpiCard title="Total Posts" value={kpis.totalPosts} icon="📊" color={{bg: "bg-blue-100"}} />
                <KpiCard title="At-Risk Posts (1hr)" value={kpis.atRiskNow} change={kpis.atRiskChange} icon="⚠️" color={{bg: "bg-yellow-100"}} />
                <KpiCard title="Active Users" value={new Set(posts.map(p=>p.author)).size} icon="👥" color={{bg: "bg-green-100"}} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-2">Activity Last 7 Days</h3>
                    <ResponsiveContainer width="100%" height={300}><LineChart data={activityData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="Calm" stroke="#2ECC71" /><Line type="monotone" dataKey="Stressed" stroke="#F1C40F" /><Line type="monotone" dataKey="Overwhelmed" stroke="#E74C3C" /></LineChart></ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-2">Top Negative Keywords</h3>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={negativeKeywords} layout="vertical"><XAxis type="number" /><YAxis type="category" dataKey="name" width={80} /><Tooltip /><Bar dataKey="count" fill="#E74C3C" /></BarChart></ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [posts, setPosts] = useState([]);
    const [showLogin, setShowLogin] = useState(false);
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setIsAdmin(!currentUser.isAnonymous && currentUser.email === ADMIN_EMAIL);
            } else {
                signInAnonymously(auth);
            }
        });
    }, []);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'artifacts', appId, 'public/data/posts'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const handleNewPost = async (newPostData) => {
        try { await addDoc(collection(db, 'artifacts', appId, 'public/data/posts'), newPostData); } 
        catch (e) { console.error("Error adding post:", e); }
    };
    
    const handleVote = async (postId, direction) => {
        if (!user || user.isAnonymous) return;
        const postRef = doc(db, 'artifacts', appId, 'public/data/posts', postId);
        try { await updateDoc(postRef, { votes: increment(direction) }); } catch (e) { console.error("Error voting:", e); }
    };
    
    const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
            setShowLogin(false);
        } catch (error) { setLoginError("Login failed."); }
    };
    const handleLogout = () => signOut(auth);

    // Conditional rendering for the entire view
    if (isAdmin) {
        return <AdminDashboard posts={posts} onLogout={handleLogout} />;
    }

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="text-slate-800 bg-gray-100">
             <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }`}</style>
             {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} error={loginError} />}
             <StudentView 
                user={user} 
                posts={posts} 
                onVote={handleVote} 
                onAnalyze={handleNewPost} 
                onGoogleLogin={handleGoogleLogin} 
                onAdminLogin={() => setShowLogin(true)} 
             />
        </div>
    );
}

// Separate AuthControls for StudentView to avoid prop drilling
const AuthControls = ({ user, onGoogleLogin, onAdminLogin }) => {
    if (!user) return <div className="h-8"></div>;
    if (user.isAnonymous) {
      return (
        <div className="flex items-center gap-4">
          <button onClick={onGoogleLogin} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm transition-colors">Sign in with Google</button>
          <button onClick={onAdminLogin} className="text-slate-500 hover:text-emerald-600 text-sm transition-colors">Admin Login</button>
        </div>
      );
    }
    // Logged in as a Student
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src={user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`} alt="User avatar" className="w-8 h-8 rounded-full border-2 border-emerald-500" />
          <span className="text-sm font-semibold text-slate-700">{user.displayName}</span>
          <button onClick={() => signOut(auth)} className="text-xs text-gray-500 hover:text-red-500">(Logout)</button>
        </div>
        <span className="text-gray-300">|</span>
        <button onClick={onAdminLogin} className="text-slate-500 hover:text-emerald-600 text-sm transition-colors">Admin Login</button>
      </div>
    );
};

// Simplified LoginModal for brevity
const LoginModal = ({ onLogin, onClose, error }) => (
    <div className="fixed inset-0 bg-slate-500/30 backdrop-blur-xl flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Admin Login</h2>
            <form onSubmit={onLogin}>
                <div className="mb-4"><label className="block text-sm text-slate-600 mb-2" htmlFor="email">Email</label><input type="email" id="email" className="w-full bg-slate-100 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500" defaultValue={ADMIN_EMAIL}/></div>
                <div className="mb-6"><label className="block text-sm text-slate-600 mb-2" htmlFor="password">Password</label><input type="password" id="password" className="w-full bg-slate-100 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500" /></div>
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                <div className="flex gap-4"><button type="button" onClick={onClose} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-lg">Cancel</button><button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg">Login</button></div>
            </form>
        </div>
    </div>
);

