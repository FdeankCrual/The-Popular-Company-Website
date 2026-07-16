"use client";

import { useState, useEffect } from "react";
import { Loader2, DollarSign, Wallet, TrendingUp, TrendingDown, Target, Plus, CheckCircle2, Circle, Save, Trash2, ArrowRight } from "lucide-react";

type Tab = "dashboard" | "income" | "expenses" | "fixed";

export default function MoneyManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [month, setMonth] = useState("July");

  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [emis, setEmis] = useState<any[]>([]);
  
  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/money");
      if (res.ok) {
        const data = await res.json();
        setIncomes(data.incomes || []);
        setExpenses(data.expenses || []);
        setEmployees(data.employees || []);
        setEmis(data.emis || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveMoney",
          payload: { incomes, expenses, employees, emis }
        })
      });
      setUnsaved(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const markUnsaved = () => setUnsaved(true);

  // AUTOMATION
  const runMonthlyAutomation = () => {
    let added = 0;
    const newExpenses = [...expenses];

    employees.filter(e => e.active).forEach(emp => {
      const exists = newExpenses.find(ex => ex.month === month && ex.expense === `Salary: ${emp.name}`);
      if (!exists) {
        newExpenses.push({
          id: `exp_${Math.random().toString(36).substring(2)}`,
          month,
          expense: `Salary: ${emp.name}`,
          amount: Number(emp.minMonthly) || 0,
          paid: false
        });
        added++;
      }
    });

    emis.filter(e => e.active).forEach(emi => {
      const exists = newExpenses.find(ex => ex.month === month && ex.expense === `EMI: ${emi.thing}`);
      if (!exists) {
        newExpenses.push({
          id: `exp_${Math.random().toString(36).substring(2)}`,
          month,
          expense: `EMI: ${emi.thing}`,
          amount: Number(emi.payment) || 0,
          paid: false
        });
        added++;
      }
    });

    if (added > 0) {
      setExpenses(newExpenses);
      markUnsaved();
      alert(`Automated ${added} fixed costs into Expenses for ${month}!`);
    } else {
      alert(`Fixed costs for ${month} have already been added.`);
    }
  };

  // HELPERS
  const calcExpectedIncome = (inc: any) => {
    return (Number(inc.smm) || 0) + 
           ((Number(inc.reels) || 0) * (Number(inc.perReel) || 0)) + 
           ((Number(inc.ytVids) || 0) * (Number(inc.ytCost) || 0)) + 
           ((Number(inc.posts) || 0) * (Number(inc.perPost) || 0)) + 
           (Number(inc.instAds) || 0);
  };

  const monthIncomes = incomes.filter(i => i.month === month);
  const monthExpenses = expenses.filter(e => e.month === month);

  const totalExpectedIncome = monthIncomes.reduce((acc, curr) => acc + calcExpectedIncome(curr), 0);
  const totalCurrentIncome = monthIncomes.filter(i => i.paid).reduce((acc, curr) => acc + calcExpectedIncome(curr), 0);

  const totalExpectedExpense = monthExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalPaidExpense = monthExpenses.filter(e => e.paid).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const expectedProfit = totalExpectedIncome - totalExpectedExpense;
  const currentProfit = totalCurrentIncome - totalPaidExpense;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-tpc-black text-tpc-orange">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="mt-4 font-bold uppercase tracking-widest text-sm">Loading Vault...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tpc-black text-white font-sans p-4 sm:p-8 md:p-12 pb-32">
      
      {/* Floating Save Button */}
      {unsaved && (
        <button 
          onClick={handleSave}
          disabled={saving}
          className="fixed bottom-8 right-8 bg-tpc-orange text-black p-4 rounded-full shadow-[0_0_20px_rgba(255,102,0,0.3)] flex items-center justify-center z-[100] hover:scale-110 active:scale-95 transition-all group animate-in slide-in-from-bottom-8"
        >
          {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
            Money Management
          </h2>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
            Financial Dashboard & Automations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={month} 
            onChange={e => setMonth(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 font-bold uppercase tracking-widest outline-none focus:border-tpc-orange cursor-pointer"
          >
            {["June", "July", "August", "September", "October"].map(m => (
              <option key={m} value={m} className="bg-tpc-black">{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-max max-w-full">
        <button onClick={() => setActiveTab("dashboard")} className={`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === "dashboard" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}>Dashboard</button>
        <button onClick={() => setActiveTab("income")} className={`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === "income" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}>Income</button>
        <button onClick={() => setActiveTab("expenses")} className={`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === "expenses" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}>Expenses</button>
        <button onClick={() => setActiveTab("fixed")} className={`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === "fixed" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}>Fixed Costs</button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-6 shadow-xl">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Total Expected Income</h3>
              <div className="text-3xl font-black text-white">₹{totalExpectedIncome.toLocaleString()}</div>
            </div>
            <div className="bg-[#111] border border-green-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-green-500 text-xs font-bold uppercase tracking-widest mb-4 relative z-10">Total Current Income</h3>
              <div className="text-3xl font-black text-white relative z-10">₹{totalCurrentIncome.toLocaleString()}</div>
            </div>
            <div className="bg-[#111] border border-red-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4 relative z-10">Total Paid Expenses</h3>
              <div className="text-3xl font-black text-white relative z-10">₹{totalPaidExpense.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-tpc-orange/20 to-[#111] border border-tpc-orange/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tpc-orange/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-tpc-orange text-xs font-bold uppercase tracking-widest mb-4 relative z-10">Current Profit</h3>
              <div className="text-4xl font-black text-white relative z-10 tracking-tighter">₹{currentProfit.toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 text-white flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-500" /> Financial Automations
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Run this automation at the start of every month. It will scan your active Employees and active EMIs, and automatically inject their minimum monthly salaries into the Expenses tab for {month}.
              </p>
              <button 
                onClick={runMonthlyAutomation}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all flex justify-center items-center gap-2"
              >
                Run Monthly Automation
              </button>
            </div>
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Expected Profit Margin</span>
                <span className="text-white font-black text-2xl">{totalExpectedIncome > 0 ? Math.round((expectedProfit / totalExpectedIncome) * 100) : 0}%</span>
              </div>
              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-tpc-orange transition-all" style={{ width: `${totalExpectedIncome > 0 ? Math.max(0, (expectedProfit / totalExpectedIncome) * 100) : 0}%` }} />
              </div>
              
              <div className="flex justify-between items-center mt-10 mb-4">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Current Profit Margin</span>
                <span className="text-white font-black text-2xl">{totalCurrentIncome > 0 ? Math.round((currentProfit / totalCurrentIncome) * 100) : 0}%</span>
              </div>
              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all" style={{ width: `${totalCurrentIncome > 0 ? Math.max(0, (currentProfit / totalCurrentIncome) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INCOME TAB */}
      {activeTab === "income" && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Client Income: {month}</h3>
            <button 
              onClick={() => {
                setIncomes([...incomes, { id: `inc_${Math.random().toString(36).substring(2)}`, month, client: "", smm: 0, reels: 0, perReel: 0, ytVids: 0, ytCost: 0, posts: 0, perPost: 0, instAds: 0, paid: false }]);
                markUnsaved();
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4"/> Add Client
            </button>
          </div>
          
          <div className="w-full overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400">
                  <th className="p-4 font-bold border-b border-white/10 w-10 text-center">Paid</th>
                  <th className="p-4 font-bold border-b border-white/10 min-w-[150px]">Client</th>
                  <th className="p-4 font-bold border-b border-white/10">SMM</th>
                  <th className="p-4 font-bold border-b border-white/10">Reels</th>
                  <th className="p-4 font-bold border-b border-white/10">Per Reel</th>
                  <th className="p-4 font-bold border-b border-white/10">YT Vids</th>
                  <th className="p-4 font-bold border-b border-white/10">YT Cost</th>
                  <th className="p-4 font-bold border-b border-white/10">Posts</th>
                  <th className="p-4 font-bold border-b border-white/10">Per Post</th>
                  <th className="p-4 font-bold border-b border-white/10">InstAds</th>
                  <th className="p-4 font-bold border-b border-white/10 text-right">Expected</th>
                  <th className="p-4 font-bold border-b border-white/10 text-right">Current</th>
                  <th className="p-4 font-bold border-b border-white/10 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#111]">
                {monthIncomes.map((inc) => {
                  const expected = calcExpectedIncome(inc);
                  const current = inc.paid ? expected : 0;
                  return (
                    <tr key={inc.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-center">
                        <button onClick={() => {
                          const updated = incomes.map(i => i.id === inc.id ? { ...i, paid: !i.paid } : i);
                          setIncomes(updated);
                          markUnsaved();
                        }}>
                          {inc.paid ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-600" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <input type="text" value={inc.client} onChange={e => {
                          const updated = incomes.map(i => i.id === inc.id ? { ...i, client: e.target.value } : i);
                          setIncomes(updated); markUnsaved();
                        }} className="bg-transparent border-none outline-none text-white w-full text-sm font-bold" placeholder="Client Name"/>
                      </td>
                      <td className="p-4"><input type="number" value={inc.smm || ''} onChange={e => {
                          setIncomes(incomes.map(i => i.id === inc.id ? { ...i, smm: Number(e.target.value) } : i)); markUnsaved();
                        }} className="bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white w-full text-xs" /></td>
                      <td className="p-4"><input type="number" value={inc.reels || ''} onChange={e => {
                          setIncomes(incomes.map(i => i.id === inc.id ? { ...i, reels: Number(e.target.value) } : i)); markUnsaved();
                        }} className="bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white w-full text-xs" /></td>
                      <td className="p-4"><input type="number" value={inc.perReel || ''} onChange={e => {
                          setIncomes(incomes.map(i => i.id === inc.id ? { ...i, perReel: Number(e.target.value) } : i)); markUnsaved();
                        }} className="bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white w-full text-xs" /></td>
                      <td className="p-4"><input type="number" value={inc.ytVids || ''} onChange={e => {
                          setIncomes(incomes.map(i => i.id === inc.id ? { ...i, ytVids: Number(e.target.value) } : i)); markUnsaved();
                        }} className="bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white w-full text-xs" /></td>
                      <td className="p-4"><input type="number" value={inc.ytCost || ''} onChange={e => {
                          setIncomes(incomes.map(i => i.id === inc.id ? { ...i, ytCost: Number(e.target.value) } : i)); markUnsaved();
                        }} className="bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white w-full text-xs" /></td>
                      <td className="p-4"><input type="number" value={inc.posts || ''} onChange={e => {
                          setIncomes(incomes.map(i => i.id === inc.id ? { ...i, posts: Number(e.target.value) } : i)); markUnsaved();
                        }} className="bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white w-full text-xs" /></td>
                      <td className="p-4"><input type="number" value={inc.perPost || ''} onChange={e => {
                          setIncomes(incomes.map(i => i.id === inc.id ? { ...i, perPost: Number(e.target.value) } : i)); markUnsaved();
                        }} className="bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white w-full text-xs" /></td>
                      <td className="p-4"><input type="number" value={inc.instAds || ''} onChange={e => {
                          setIncomes(incomes.map(i => i.id === inc.id ? { ...i, instAds: Number(e.target.value) } : i)); markUnsaved();
                        }} className="bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white w-full text-xs" /></td>
                      
                      <td className="p-4 text-right font-mono font-bold text-gray-300">₹{expected.toLocaleString()}</td>
                      <td className={`p-4 text-right font-mono font-black ${inc.paid ? 'text-green-500' : 'text-gray-600'}`}>₹{current.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => { setIncomes(incomes.filter(i => i.id !== inc.id)); markUnsaved(); }} className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-black/50 border-t border-white/10 font-black">
                <tr>
                  <td colSpan={10} className="p-4 text-right uppercase tracking-widest text-xs text-gray-500">Totals:</td>
                  <td className="p-4 text-right text-white">₹{totalExpectedIncome.toLocaleString()}</td>
                  <td className="p-4 text-right text-green-500">₹{totalCurrentIncome.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === "expenses" && (
        <div className="animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Expenses: {month}</h3>
            <button 
              onClick={() => {
                setExpenses([...expenses, { id: `exp_${Math.random().toString(36).substring(2)}`, month, expense: "", amount: 0, paid: false }]);
                markUnsaved();
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4"/> Add Expense
            </button>
          </div>

          <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400">
                  <th className="p-4 font-bold border-b border-white/10 w-16 text-center">Paid</th>
                  <th className="p-4 font-bold border-b border-white/10">Expense Name</th>
                  <th className="p-4 font-bold border-b border-white/10 text-right w-48">Amount (₹)</th>
                  <th className="p-4 font-bold border-b border-white/10 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {monthExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-center">
                      <button onClick={() => {
                        setExpenses(expenses.map(e => e.id === exp.id ? { ...e, paid: !e.paid } : e));
                        markUnsaved();
                      }}>
                        {exp.paid ? <CheckCircle2 className="w-5 h-5 text-red-500" /> : <Circle className="w-5 h-5 text-gray-600" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <input type="text" value={exp.expense} onChange={e => {
                        setExpenses(expenses.map(ex => ex.id === exp.id ? { ...ex, expense: e.target.value } : ex)); markUnsaved();
                      }} className="bg-transparent border-none outline-none text-white w-full text-sm font-bold" placeholder="Expense description"/>
                    </td>
                    <td className="p-4 text-right">
                      <input type="number" value={exp.amount || ''} onChange={e => {
                        setExpenses(expenses.map(ex => ex.id === exp.id ? { ...ex, amount: Number(e.target.value) } : ex)); markUnsaved();
                      }} className="bg-white/5 border border-white/10 rounded px-3 py-2 outline-none text-white w-full text-right font-mono font-bold" placeholder="0"/>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => { setExpenses(expenses.filter(e => e.id !== exp.id)); markUnsaved(); }} className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-black/50 border-t border-white/10 font-black">
                <tr>
                  <td colSpan={2} className="p-4 text-right uppercase tracking-widest text-xs text-gray-500">Total Expected vs Paid:</td>
                  <td className="p-4 text-right flex flex-col gap-1 items-end">
                    <span className="text-white text-sm font-mono">₹{totalExpectedExpense.toLocaleString()}</span>
                    <span className="text-red-500 text-lg font-mono tracking-tighter">₹{totalPaidExpense.toLocaleString()}</span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* FIXED COSTS TAB */}
      {activeTab === "fixed" && (
        <div className="animate-in fade-in zoom-in-95 duration-300 grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Employees */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Employees</h3>
              <button 
                onClick={() => {
                  setEmployees([...employees, { id: `emp_${Math.random().toString(36).substring(2)}`, name: "", work: "", startDate: "", minMonthly: 0, duration: "", active: true }]);
                  markUnsaved();
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
              >
                <Plus className="w-3 h-3"/> Add
              </button>
            </div>
            
            <div className="space-y-4">
              {employees.map(emp => (
                <div key={emp.id} className={`p-4 rounded-xl border transition-all ${emp.active ? 'bg-white/5 border-white/10' : 'bg-black/50 border-black opacity-50'}`}>
                  <div className="flex justify-between gap-4 mb-3">
                    <input type="text" value={emp.name} onChange={e => { setEmployees(employees.map(em => em.id === emp.id ? { ...em, name: e.target.value } : em)); markUnsaved(); }} className="bg-transparent border-b border-white/20 outline-none text-white font-bold text-lg w-full" placeholder="Name" />
                    <button onClick={() => { setEmployees(employees.map(em => em.id === emp.id ? { ...em, active: !em.active } : em)); markUnsaved(); }} className="text-[10px] uppercase tracking-widest font-bold whitespace-nowrap bg-white/10 px-2 rounded hover:bg-white/20">
                      {emp.active ? "Active" : "Inactive"}
                    </button>
                    <button onClick={() => { setEmployees(employees.filter(em => em.id !== emp.id)); markUnsaved(); }} className="text-red-500/50 hover:text-red-500">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Role</label>
                      <input type="text" value={emp.work} onChange={e => { setEmployees(employees.map(em => em.id === emp.id ? { ...em, work: e.target.value } : em)); markUnsaved(); }} className="bg-black/50 border border-white/10 rounded px-2 py-1.5 w-full text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Min Salary (₹)</label>
                      <input type="number" value={emp.minMonthly || ''} onChange={e => { setEmployees(employees.map(em => em.id === emp.id ? { ...em, minMonthly: Number(e.target.value) } : em)); markUnsaved(); }} className="bg-black/50 border border-white/10 rounded px-2 py-1.5 w-full text-white outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Start Date</label>
                      <input type="text" value={emp.startDate} onChange={e => { setEmployees(employees.map(em => em.id === emp.id ? { ...em, startDate: e.target.value } : em)); markUnsaved(); }} className="bg-black/50 border border-white/10 rounded px-2 py-1.5 w-full text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Duration</label>
                      <input type="text" value={emp.duration} onChange={e => { setEmployees(employees.map(em => em.id === emp.id ? { ...em, duration: e.target.value } : em)); markUnsaved(); }} className="bg-black/50 border border-white/10 rounded px-2 py-1.5 w-full text-white outline-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EMIs */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">EMIs / Subscriptions</h3>
              <button 
                onClick={() => {
                  setEmis([...emis, { id: `emi_${Math.random().toString(36).substring(2)}`, thing: "", duration: "", date: "", payment: 0, active: true }]);
                  markUnsaved();
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
              >
                <Plus className="w-3 h-3"/> Add
              </button>
            </div>
            
            <div className="space-y-4">
              {emis.map(emi => (
                <div key={emi.id} className={`p-4 rounded-xl border transition-all ${emi.active ? 'bg-white/5 border-white/10' : 'bg-black/50 border-black opacity-50'}`}>
                  <div className="flex justify-between gap-4 mb-3">
                    <input type="text" value={emi.thing} onChange={e => { setEmis(emis.map(em => em.id === emi.id ? { ...em, thing: e.target.value } : em)); markUnsaved(); }} className="bg-transparent border-b border-white/20 outline-none text-white font-bold text-lg w-full" placeholder="Service Name" />
                    <button onClick={() => { setEmis(emis.map(em => em.id === emi.id ? { ...em, active: !em.active } : em)); markUnsaved(); }} className="text-[10px] uppercase tracking-widest font-bold whitespace-nowrap bg-white/10 px-2 rounded hover:bg-white/20">
                      {emi.active ? "Active" : "Inactive"}
                    </button>
                    <button onClick={() => { setEmis(emis.filter(em => em.id !== emi.id)); markUnsaved(); }} className="text-red-500/50 hover:text-red-500">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Payment per Month (₹)</label>
                      <input type="number" value={emi.payment || ''} onChange={e => { setEmis(emis.map(em => em.id === emi.id ? { ...em, payment: Number(e.target.value) } : em)); markUnsaved(); }} className="bg-black/50 border border-white/10 rounded px-2 py-1.5 w-full text-white outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Duration</label>
                      <input type="text" value={emi.duration} onChange={e => { setEmis(emis.map(em => em.id === emi.id ? { ...em, duration: e.target.value } : em)); markUnsaved(); }} className="bg-black/50 border border-white/10 rounded px-2 py-1.5 w-full text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Date Range</label>
                      <input type="text" value={emi.date} onChange={e => { setEmis(emis.map(em => em.id === emi.id ? { ...em, date: e.target.value } : em)); markUnsaved(); }} className="bg-black/50 border border-white/10 rounded px-2 py-1.5 w-full text-white outline-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
