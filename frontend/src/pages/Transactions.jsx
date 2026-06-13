import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

/* ─── Constants ─────────────────────────────────────────── */
const CATEGORIES = ["Sales","Inventory","Salary","Rent","Utilities","Marketing","Refund","Other"];
const CAT_COLORS = ["#1a56db","#3b82f6","#60a5fa","#93c5fd","#0e4cad","#2563eb","#7c3aed","#06b6d4"];

const fmt = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0}).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const monthKey = (d) => { const dt=new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`; };
const monthLabel = (k) => { const [y,m]=k.split("-"); return new Date(y,m-1).toLocaleDateString("en-US",{month:"short",year:"2-digit"}); };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#fff",border:"1px solid #dbeafe",borderRadius:10,padding:"10px 16px",boxShadow:"0 4px 20px #1a56db18",fontSize:13}}>
      <div style={{color:"#1a56db",fontWeight:700,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
          <div style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
          <span style={{color:"#64748b"}}>{p.name}:</span>
          <span style={{fontWeight:700,color:"#1e293b"}}>{typeof p.value==="number"&&p.value>100?fmt(p.value):p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function GJGlobalMoneyManager() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({type:"income",description:"",amount:"",category:"Sales",date:new Date().toISOString().split("T")[0]});
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Fetch transactions from backend on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/api/transactions/user-transactions');
        if (response.data?.transactions) {
          setTransactions(response.data.transactions);
          // Also save to localStorage as backup
          localStorage.setItem("gj_tx", JSON.stringify(response.data.transactions));
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // Fallback to localStorage if backend fails
        try { 
          const s = localStorage.getItem("gj_tx"); 
          if (s) setTransactions(JSON.parse(s)); 
        } catch { 
          setTransactions([]); 
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    if (!loading && transactions.length > 0) {
      localStorage.setItem("gj_tx", JSON.stringify(transactions));
    }
  }, [transactions, loading]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle view profile
  const handleViewProfile = () => {
    setProfileDropdownOpen(false);
    navigate('/profile');
  };

  useEffect(()=>{ localStorage.setItem("gj_tx",JSON.stringify(transactions)); },[transactions]);

  const totalIncome = transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const totalExpense = transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const balance = totalIncome - totalExpense;

  /* Chart Data */
  const monthlyData = (() => {
    const map = {};
    transactions.forEach(t=>{
      const k=monthKey(t.date);
      if(!map[k]) map[k]={month:monthLabel(k),income:0,expense:0,net:0};
      if(t.type==="income") map[k].income+=t.amount;
      else map[k].expense+=t.amount;
    });
    return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0])).map(([,v])=>({...v,net:v.income-v.expense}));
  })();

  const freqData = (() => {
    const map = {};
    transactions.forEach(t=>{
      const k=monthKey(t.date);
      if(!map[k]) map[k]={month:monthLabel(k),income:0,expense:0,total:0};
      map[k][t.type]++;
      map[k].total++;
    });
    return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0])).map(([,v])=>v);
  })();

  const categoryData = CATEGORIES.map((cat,i)=>({
    name:cat, color:CAT_COLORS[i%CAT_COLORS.length],
    income:transactions.filter(t=>t.category===cat&&t.type==="income").reduce((s,t)=>s+t.amount,0),
    expense:transactions.filter(t=>t.category===cat&&t.type==="expense").reduce((s,t)=>s+t.amount,0),
  })).filter(c=>c.income>0||c.expense>0);

  const pieData = [
    {name:"Income",value:totalIncome,color:"#1a56db"},
    {name:"Expense",value:totalExpense,color:"#ef4444"},
  ].filter(d=>d.value>0);

  /* CRUD - Connected to Backend */
  const handleSubmit = async () => {
    if(!form.description||!form.amount||!form.date) return;
    
    const txData = {
      name: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.category,
      type: form.type
    };

    try {
      let response;
      if (editId) {
        // Update existing transaction
        response = await api.put(`/api/user-transactions/${editId}`, txData);
        if (response.data?.transaction) {
          setTransactions(transactions.map(t => 
            t._id === editId ? { ...t, ...response.data.transaction } : t
          ));
          toast.success('Transaction updated successfully');
        }
      } else {
        // Create new transaction
        response = await api.post('/api/user-transactions', txData);
        if (response.data?.transaction) {
          setTransactions([response.data.transaction, ...transactions]);
          toast.success('Transaction added successfully');
        } else if (response.data?.transactions) {
          // Bulk insert response
          setTransactions([...response.data.transactions, ...transactions]);
          toast.success('Transactions added successfully');
        }
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      // Fallback to local storage if backend fails
      const tx = {...form, id: editId ?? Date.now(), amount: parseFloat(form.amount)};
      setTransactions(editId ? transactions.map(t => t.id === editId ? tx : t) : [...transactions, tx]);
      toast.error('Saved locally (backend unavailable)');
    }

    setEditId(null);
    setForm({type:"income",description:"",amount:"",category:"Sales",date:new Date().toISOString().split("T")[0]});
    setShowForm(false);
  };

  const handleEdit = async (t) => {
    // Check if it's a backend transaction (has _id) or local (has id)
    if (t._id) {
      // Fetch full transaction data from backend for editing
      try {
        const response = await api.get('/api/user-transactions');
        const fullTx = response.data?.transactions?.find(tx => tx._id === t._id);
        if (fullTx) {
          setForm({
            type: fullTx.type || (fullTx.amount < 0 ? 'expense' : 'income'),
            description: fullTx.name || fullTx.description || '',
            amount: String(Math.abs(fullTx.amount)),
            category: Array.isArray(fullTx.category) ? fullTx.category[0] : fullTx.category || 'Other',
            date: new Date(fullTx.date).toISOString().split("T")[0]
          });
          setEditId(t._id);
          setShowForm(true);
          return;
        }
      } catch (error) {
        console.error('Error fetching transaction for edit:', error);
      }
    }
    // Fallback to local data
    setForm({...t, amount: String(Math.abs(t.amount))});
    setEditId(t._id || t.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    
    try {
      // Try to delete from backend first
      await api.delete(`/api/user-transactions/${id}`);
      setTransactions(transactions.filter(t => t._id !== id && t.id !== id));
      toast.success('Transaction deleted');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // Fallback to local deletion
      setTransactions(transactions.filter(t => t._id !== id && t.id !== id));
      toast.error('Deleted locally (backend unavailable)');
    }
  };

  const filtered = transactions
    .filter(t=>filter==="all"||t.type===filter)
    .filter(t=>(t.description?.toLowerCase() || '').includes(search.toLowerCase())||(t.category?.toLowerCase() || '').includes(search.toLowerCase()))
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  const hasData = transactions.length > 0;

  // Dark mode color utilities
  const colors = {
    bg: isDark ? '#0f172a' : '#f0f5ff',
    card: isDark ? '#1e293b' : '#fff',
    cardBorder: isDark ? '#334155' : '#e8f0fe',
    input: isDark ? '#334155' : '#f8faff',
    inputBorder: isDark ? '#475569' : '#dbeafe',
    text: isDark ? '#f1f5f9' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#334155' : '#e2e8f0',
    hover: isDark ? '#1e293b' : '#f0f7ff',
    header: isDark ? 'linear-gradient(135deg, #0c1929 0%, #1e3a5f 55%, #1e3a8a 100%)' : 'linear-gradient(135deg,#0e3fa3 0%,#1a56db 55%,#3b82f6 100%)',
  };

  return (
    <div style={{minHeight:"100vh",background:colors.bg,fontFamily:"'Nunito','Segoe UI',sans-serif",color:colors.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sora:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:#f0f5ff;}
        ::-webkit-scrollbar-thumb{background:#bfdbfe;border-radius:3px;}
        .btn{cursor:pointer;border:none;transition:all 0.18s;}
        .btn:hover{transform:translateY(-1px);}
        .card{background:#fff;border-radius:16px;box-shadow:0 2px 16px #1a56db0d;border:1px solid #e8f0fe;}
        .inp{background:#f8faff;border:1.5px solid #dbeafe;border-radius:10px;color:#1e293b;padding:10px 14px;font-family:inherit;font-size:13.5px;width:100%;outline:none;transition:border-color 0.2s;}
        .inp:focus{border-color:#1a56db;background:#fff;}
        .tx-row{transition:background 0.12s;}
        .tx-row:hover{background:#f0f7ff !important;}
        .act-btn{opacity:0;transition:opacity 0.15s;}
        .tx-row:hover .act-btn{opacity:1;}
        .fade-in{animation:fadeUp 0.35s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0e3fa3 0%,#1a56db 55%,#3b82f6 100%)",padding:"0 32px",boxShadow:"0 4px 24px #1a56db44"}}>
        <div style={{maxWidth:1180,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 0",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s"
              alt="GJ Global Services Logo"
              style={{width:50,height:50,borderRadius:14,objectFit:"cover",border:"1.5px solid rgba(255,255,255,0.3)"}}
            />
            <div>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-0.5px"}}>GJ Global Services</div>
              <div style={{fontSize:11,color:"#bfdbfe",letterSpacing:"2.5px",textTransform:"uppercase",fontWeight:700}}>Store Money Manager</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            {/* User Profile Section */}
            {user && (
              <div style={{position:"relative"}} ref={profileDropdownRef}>
                <div
                  style={{display:"flex",alignItems:"center",gap:12,padding:"6px 12px",background:"rgba(255,255,255,0.15)",borderRadius:12,border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer"}}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  {user.profilePicture ? (
                    <>
                      <img
                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                        alt={user.username}
                        style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid #fff"}}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.querySelector('.fallback-avatar') && (e.target.parentElement.querySelector('.fallback-avatar').style.display = 'flex');
                        }}
                      />
                      <div className="fallback-avatar" style={{display:'none',width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#38bdf8,#8b5cf6)",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14}}>
                        {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                      </div>
                    </>
                  ) : (
                    <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#38bdf8,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14}}>
                      {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div style={{display:"flex",flexDirection:"column"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{user.username || "User"}</div>
                    <div style={{fontSize:10,color:"#bfdbfe"}}>{user.email || ""}</div>
                  </div>
                  <span style={{color:"#bfdbfe",fontSize:10,marginLeft:4}}>▼</span>
                </div>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div style={{position:"absolute",top:"100%",right:0,mt:2,width:200,background:"#ffffff",borderRadius:12,border:"1px solid #e2e8f0",boxShadow:"0 10px 40px rgba(0,0,0,0.12)",overflow:"hidden",zIndex:100}}>
                    <button
                      onClick={handleViewProfile}
                      style={{width:"100%",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:600,color:"#0f172a",transition:"background 0.15s"}}
                      onMouseOver={(e) => e.target.style.background = "#f8fafc"}
                      onMouseOut={(e) => e.target.style.background = "none"}
                    >
                      <span style={{fontSize:16}}>👤</span> View Full Profile
                    </button>
                    <div style={{height:1,background:"#e2e8f0",margin:"0 8px"}}/>
                    <button
                      onClick={handleLogout}
                      style={{width:"100%",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:600,color:"#ef4444",transition:"background 0.15s"}}
                      onMouseOver={(e) => e.target.style.background = "#fef2f2"}
                      onMouseOut={(e) => e.target.style.background = "none"}
                    >
                      <span style={{fontSize:16}}>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          {hasData&&(
              <button className="btn" onClick={async ()=>{
                if(!window.confirm("Clear ALL transactions? This cannot be undone.")) return;
                try {
                  // Try to delete all transactions from backend
                  for (const tx of transactions) {
                    if (tx._id) {
                      await api.delete(`/api/user-transactions/${tx._id}`);
                    }
                  }
                  setTransactions([]);
                  toast.success('All transactions cleared');
                } catch (error) {
                  console.error('Error clearing transactions:', error);
                  setTransactions([]);
                  toast.error('Cleared locally (backend unavailable)');
                }
              }}
                style={{background:"rgba(239,68,68,0.15)",color:"#fca5a5",padding:"9px 16px",borderRadius:10,fontFamily:"inherit",fontWeight:700,fontSize:13,border:"1px solid rgba(239,68,68,0.3)"}}>
                🗑 Clear All
              </button>
            )}
            <button className="btn" onClick={()=>{setShowForm(!showForm);setEditId(null);setForm({type:"income",description:"",amount:"",category:"Sales",date:new Date().toISOString().split("T")[0]});}}
              style={{background:"#fff",color:"#1a56db",padding:"10px 24px",borderRadius:10,fontFamily:"inherit",fontWeight:800,fontSize:13.5,boxShadow:"0 2px 12px #0003"}}>
              {showForm?"✕ Cancel":"＋ Add Transaction"}
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1180,margin:"0 auto",padding:"28px 24px"}}>

        {/* Stat Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:16,marginBottom:24}}>
          {[
            {label:"Net Balance",value:fmt(balance),icon:"⚖️",grad:balance>=0?"linear-gradient(135deg,#1a56db,#3b82f6)":"linear-gradient(135deg,#dc2626,#ef4444)",sub:balance>=0?"Positive cash flow":"Negative cash flow"},
            {label:"Total Income",value:fmt(totalIncome),icon:"📈",grad:"linear-gradient(135deg,#0891b2,#06b6d4)",sub:`${transactions.filter(t=>t.type==="income").length} income entries`},
            {label:"Total Expenses",value:fmt(totalExpense),icon:"📉",grad:"linear-gradient(135deg,#dc2626,#ef4444)",sub:`${transactions.filter(t=>t.type==="expense").length} expense entries`},
            {label:"Total Transactions",value:transactions.length,icon:"🔢",grad:"linear-gradient(135deg,#7c3aed,#a855f7)",sub:`${new Set(transactions.map(t=>monthKey(t.date))).size} active month(s)`},
          ].map((s,i)=>(
            <div key={s.label} className="fade-in" style={{background:s.grad,borderRadius:16,padding:"22px 24px",color:"#fff",boxShadow:"0 4px 20px #1a56db22",animationDelay:`${i*0.07}s`,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>
              <div style={{fontSize:26,marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:10,letterSpacing:"2px",textTransform:"uppercase",fontWeight:800,opacity:0.8,marginBottom:4}}>{s.label}</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:"-1px"}}>{s.value}</div>
              <div style={{fontSize:11,opacity:0.72,marginTop:4}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm&&(
          <div className="card fade-in" style={{padding:24,marginBottom:24,borderColor:"#bfdbfe",borderWidth:2}}>
            <div style={{fontSize:13,color:"#1a56db",fontWeight:800,letterSpacing:"1px",textTransform:"uppercase",marginBottom:18}}>
              {editId?"✏️ Edit Transaction":"➕ New Transaction"}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:14}}>
              <div>
                <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5,fontWeight:700,letterSpacing:"1px"}}>TYPE</label>
                <select className="inp" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  <option value="income">📈 Income</option>
                  <option value="expense">📉 Expense</option>
                </select>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5,fontWeight:700,letterSpacing:"1px"}}>DESCRIPTION</label>
                <input className="inp" placeholder="e.g. Product Sales, Staff Salary…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
              </div>
              <div>
                <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5,fontWeight:700,letterSpacing:"1px"}}>AMOUNT ($)</label>
                <input className="inp" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
              </div>
              <div>
                <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5,fontWeight:700,letterSpacing:"1px"}}>CATEGORY</label>
                <select className="inp" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5,fontWeight:700,letterSpacing:"1px"}}>DATE</label>
                <input className="inp" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
              </div>
            </div>
            <button className="btn" onClick={handleSubmit}
              style={{background:"linear-gradient(135deg,#1a56db,#3b82f6)",color:"#fff",padding:"11px 32px",borderRadius:10,fontFamily:"inherit",fontWeight:800,fontSize:14,boxShadow:"0 4px 14px #1a56db44"}}>
              {editId?"Update Transaction":"Save Transaction"}
            </button>
          </div>
        )}

        {/* Charts - only shown when data exists */}
        {hasData&&(
          <>
            <div style={{fontSize:13,fontWeight:800,color:"#1a56db",letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>📊 Charts & Analytics</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(330px,1fr))",gap:16,marginBottom:24}}>

              {/* Bar: Income vs Expense per Month */}
              <div className="card fade-in" style={{padding:22}}>
                <div style={{fontWeight:800,color:"#1e293b",fontSize:14,marginBottom:3}}>Monthly Income vs Expense</div>
                <div style={{fontSize:11,color:"#94a3b8",marginBottom:16}}>Bar comparison by month</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={monthlyData} barGap={3} barCategoryGap="32%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8f0fe" vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v}`}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
                    <Bar dataKey="income" name="Income" fill="#1a56db" radius={[6,6,0,0]}/>
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Area: Net Balance Trend */}
              <div className="card fade-in" style={{padding:22}}>
                <div style={{fontWeight:800,color:"#1e293b",fontSize:14,marginBottom:3}}>Net Balance Trend</div>
                <div style={{fontSize:11,color:"#94a3b8",marginBottom:16}}>Monthly profit/loss over time</div>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a56db" stopOpacity={0.18}/>
                        <stop offset="95%" stopColor="#1a56db" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8f0fe" vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v}`}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area type="monotone" dataKey="net" name="Net Balance" stroke="#1a56db" strokeWidth={2.5} fill="url(#netGrad)" dot={{fill:"#1a56db",r:4}} activeDot={{r:6}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Line: Transaction Frequency */}
              <div className="card fade-in" style={{padding:22}}>
                <div style={{fontWeight:800,color:"#1e293b",fontSize:14,marginBottom:3}}>Transaction Frequency</div>
                <div style={{fontSize:11,color:"#94a3b8",marginBottom:16}}>Number of transactions per month</div>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={freqData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8f0fe" vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
                    <Line type="monotone" dataKey="income" name="Income Txns" stroke="#1a56db" strokeWidth={2.5} dot={{fill:"#1a56db",r:4}} activeDot={{r:6}}/>
                    <Line type="monotone" dataKey="expense" name="Expense Txns" stroke="#ef4444" strokeWidth={2.5} dot={{fill:"#ef4444",r:4}} activeDot={{r:6}}/>
                    <Line type="monotone" dataKey="total" name="Total" stroke="#7c3aed" strokeWidth={2} strokeDasharray="6 4" dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pie: Income vs Expense */}
              <div className="card fade-in" style={{padding:22}}>
                <div style={{fontWeight:800,color:"#1e293b",fontSize:14,marginBottom:3}}>Income vs Expense Split</div>
                <div style={{fontSize:11,color:"#94a3b8",marginBottom:16}}>Overall distribution</div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={76} paddingAngle={4} dataKey="value">
                        {pieData.map((e,i)=><Cell key={i} fill={e.color} stroke="none"/>)}
                      </Pie>
                      <Tooltip formatter={(v)=>fmt(v)}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{flex:1}}>
                    {pieData.map(d=>{
                      const total=totalIncome+totalExpense;
                      const pct=total>0?((d.value/total)*100).toFixed(1):0;
                      return(
                        <div key={d.name} style={{marginBottom:14}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,marginBottom:5}}>
                            <span style={{display:"flex",alignItems:"center",gap:6,color:"#1e293b"}}>
                              <span style={{width:10,height:10,borderRadius:3,background:d.color,display:"inline-block"}}/>
                              {d.name}
                            </span>
                            <span style={{color:d.color}}>{pct}%</span>
                          </div>
                          <div style={{height:6,background:"#f0f5ff",borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:d.color,borderRadius:3,transition:"width 0.6s"}}/>
                          </div>
                          <div style={{fontSize:11,color:"#94a3b8",marginTop:3}}>{fmt(d.value)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bottom: Transactions + Category */}
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>

        {/* Transaction List */}
          <div>
            {loading ? (
              <div className="card" style={{padding: 60, textAlign: 'center'}}>
                <div style={{fontSize: 40, marginBottom: 12}}>⏳</div>
                <div style={{color:"#94a3b8",fontSize:14,fontWeight:700}}>Loading transactions...</div>
              </div>
            ) : (
              <>
                <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                  {["all","income","expense"].map(f=>(
                    <button key={f} className="btn" onClick={()=>setFilter(f)}
                      style={{padding:"8px 18px",borderRadius:30,fontSize:13,fontFamily:"inherit",fontWeight:700,textTransform:"capitalize",background:filter===f?"linear-gradient(135deg,#1a56db,#3b82f6)":"#fff",color:filter===f?"#fff":"#64748b",border:filter===f?"none":"1.5px solid #e2e8f0",boxShadow:filter===f?"0 4px 14px #1a56db33":"none"}}>
                      {f==="all"?"All":f==="income"?"📈 Income":"📉 Expense"}
                    </button>
                  ))}
                  <input className="inp" placeholder="🔍 Search transactions…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:140,padding:"8px 14px"}}/>
                </div>

                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{padding:"12px 20px",borderBottom:"1px solid #f0f5ff",display:"flex",gap:10,fontSize:11,fontWeight:800,color:"#94a3b8",letterSpacing:"1px",textTransform:"uppercase"}}>
                    <div style={{width:36}}/>
                    <div style={{flex:1}}>Description</div>
                    <div style={{width:100,textAlign:"right"}}>Amount</div>
                    <div style={{width:140}}>Category / Date</div>
                    <div style={{width:80}}/>
                  </div>
                  {filtered.length===0?(
                    <div style={{padding:"52px 24px",textAlign:"center"}}>
                      <div style={{fontSize:40,marginBottom:12}}>📭</div>
                      <div style={{color:"#94a3b8",fontSize:14,fontWeight:700,marginBottom:6}}>
                        {transactions.length===0?"No transactions yet":"No results found"}
                      </div>
                      {transactions.length===0&&<div style={{color:"#cbd5e1",fontSize:12}}>Click "+ Add Transaction" to record your first entry</div>}
                    </div>
                  ):filtered.map((t,i)=>(
                    <div key={t._id || t.id} className="tx-row" style={{padding:"13px 20px",borderBottom:i<filtered.length-1?"1px solid #f8faff":"none",display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:t.type==="income"?"#eff6ff":"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                        {t.type==="income"?"↑":"↓"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13.5,fontWeight:700,color:"#1e293b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name || t.description}</div>
                      </div>
                      <div style={{width:100,textAlign:"right",fontWeight:800,fontSize:13.5,flexShrink:0,color:t.type==="income"?"#1a56db":"#ef4444"}}>
                        {t.type==="income"?"+":"-"}{fmt(Math.abs(t.amount))}
                      </div>
                      <div style={{width:140,flexShrink:0}}>
                        <div style={{display:"inline-block",background:"#eff6ff",color:"#1a56db",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,marginBottom:2}}>{Array.isArray(t.category) ? t.category[0] : t.category}</div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>{fmtDate(t.date)}</div>
                      </div>
                      <div style={{width:80,display:"flex",gap:5,flexShrink:0,justifyContent:"flex-end"}}>
                        <button className="btn act-btn" onClick={()=>handleEdit(t)} style={{background:"#eff6ff",color:"#1a56db",border:"none",padding:"4px 9px",borderRadius:7,fontSize:11,fontFamily:"inherit",fontWeight:700}}>edit</button>
                        <button className="btn act-btn" onClick={()=>handleDelete(t._id || t.id)} style={{background:"#fef2f2",color:"#ef4444",border:"none",padding:"4px 9px",borderRadius:7,fontSize:11,fontFamily:"inherit",fontWeight:700}}>del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Category Breakdown */}
            <div className="card" style={{padding:20}}>
              <div style={{fontWeight:800,color:"#1e293b",fontSize:14,marginBottom:3}}>📂 By Category</div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:16}}>Income & expense per category</div>
              {categoryData.length===0?(
                <div style={{color:"#cbd5e1",fontSize:12,textAlign:"center",padding:"20px 0"}}>No data yet</div>
              ):categoryData.map(cat=>{
                const max=Math.max(...categoryData.map(c=>Math.max(c.income,c.expense)),1);
                return(
                  <div key={cat.name} style={{marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                      <span style={{width:8,height:8,borderRadius:2,background:cat.color,flexShrink:0,display:"inline-block"}}/>
                      <span style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{cat.name}</span>
                    </div>
                    {cat.income>0&&(
                      <div style={{marginBottom:3}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8",marginBottom:2}}>
                          <span>Income</span><span style={{color:"#1a56db",fontWeight:700}}>{fmt(cat.income)}</span>
                        </div>
                        <div style={{height:5,background:"#f0f5ff",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${(cat.income/max)*100}%`,background:"#1a56db",borderRadius:3,transition:"width 0.6s"}}/>
                        </div>
                      </div>
                    )}
                    {cat.expense>0&&(
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8",marginBottom:2}}>
                          <span>Expense</span><span style={{color:"#ef4444",fontWeight:700}}>{fmt(cat.expense)}</span>
                        </div>
                        <div style={{height:5,background:"#fff1f2",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${(cat.expense/max)*100}%`,background:"#ef4444",borderRadius:3,transition:"width 0.6s"}}/>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="card" style={{padding:20}}>
              <div style={{fontWeight:800,color:"#1e293b",fontSize:14,marginBottom:3}}>📌 Quick Stats</div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:16}}>Performance metrics</div>
              {[
                {label:"Profit Margin",value:totalIncome>0?`${((balance/totalIncome)*100).toFixed(1)}%`:"N/A",color:balance>=0?"#1a56db":"#ef4444"},
                {label:"Avg Income/Txn",value:transactions.filter(t=>t.type==="income").length>0?fmt(totalIncome/transactions.filter(t=>t.type==="income").length):"N/A",color:"#1a56db"},
                {label:"Avg Expense/Txn",value:transactions.filter(t=>t.type==="expense").length>0?fmt(totalExpense/transactions.filter(t=>t.type==="expense").length):"N/A",color:"#ef4444"},
                {label:"Active Months",value:new Set(transactions.map(t=>monthKey(t.date))).size||"—",color:"#7c3aed"},
                {label:"Top Category",value:categoryData.sort((a,b)=>(b.income+b.expense)-(a.income+a.expense))[0]?.name||"—",color:"#0891b2"},
              ].map(s=>(
                <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,fontSize:12.5,paddingBottom:10,borderBottom:"1px solid #f0f5ff"}}>
                  <span style={{color:"#64748b",fontWeight:600}}>{s.label}</span>
                  <span style={{color:s.color,fontWeight:800}}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{marginTop:32,textAlign:"center",fontSize:12,color:"#94a3b8",paddingBottom:24}}>
          <span style={{color:"#1a56db",fontWeight:800}}>GJ Global Services</span> · Financial Management System · Data saved locally in your browser
        </div>
      </div>
    </div>
  );
}