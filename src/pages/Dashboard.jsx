import { useState, useEffect } from "react";
import initialData from "../data/mockData";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

function Dashboard() {
  const [role, setRole] = useState("viewer");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const saved = localStorage.getItem("transactions");
      setTransactions(saved ? JSON.parse(saved) : initialData);
    }, 300);
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  const income = transactions.filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expenses = transactions.filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const balance = income - expenses;

  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  const lastMonthExpenses = transactions
    .filter(t => {
      const month = new Date(t.date).getMonth();
      return t.type === "expense" && month === lastMonth;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyComparison =
    expenses > lastMonthExpenses
      ? "Spending increased compared to last month"
      : "Spending decreased compared to last month";

  const observation =
    expenses > income
      ? "You are spending more than earning"
      : "Your savings look good";

  const chartData = [
    { day: "Mon", balance: 4000 },
    { day: "Tue", balance: 4500 },
    { day: "Wed", balance: 4200 },
    { day: "Thu", balance: 5000 },
    { day: "Fri", balance: 4800 },
  ];

  const categoryTotals = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + t.amount;
    });

  const categoryData = Object.keys(categoryTotals).map(key => ({
    name: key,
    value: categoryTotals[key],
  }));

  const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

  const filteredTransactions = transactions.filter(t => {
    const text = search.toLowerCase();
    return (
      (t.category.toLowerCase().includes(text) ||
        t.type.toLowerCase().includes(text) ||
        t.date.toLowerCase().includes(text)) &&
      (filterType === "all" || t.type === filterType)
    );
  });

  const highestSpending =
    categoryData.length > 0
      ? categoryData.reduce((a, b) => (a.value > b.value ? a : b)).name
      : "N/A";

  const exportCSV = () => {
    const rows = [
      ["Date", "Category", "Amount", "Type"],
      ...transactions.map(t => [
        t.date, t.category, t.amount, t.type
      ]),
    ];

    const csv =
      "data:text/csv;charset=utf-8," +
      rows.map(r => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <div className={`p-4 sm:p-6 min-h-screen ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
    }`}>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Finance Dashboard
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 border rounded text-black w-full sm:w-auto"
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 bg-black text-white rounded w-full sm:w-auto"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <h2 className="text-lg sm:text-xl font-semibold mb-3">Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
          <p>Total Balance</p>
          <h2>₹ {balance}</h2>
        </div>
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
          <p>Income</p>
          <h2 className="text-green-500">₹ {income}</h2>
        </div>
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
          <p>Expenses</p>
          <h2 className="text-red-500">₹ {expenses}</h2>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        {/* LINE */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
          <h2 className="mb-2">Balance Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" stroke={darkMode ? "#fff" : "#000"} />
              <YAxis stroke={darkMode ? "#fff" : "#000"} />
              <Tooltip />
              <Line dataKey="balance" stroke="#6366f1" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
          <h2 className="mb-2">Spending Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                label={({ name, value }) => `${name}: ₹${value}`}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* TRANSACTIONS */}
      <h2 className="text-lg sm:text-xl font-semibold mt-8 mb-3">Transactions</h2>
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
          <button
            onClick={exportCSV}
            className="bg-green-500 text-white px-3 py-2 rounded w-full sm:w-auto"
          >
            Export CSV
          </button>

          {role === "admin" && (
            <button className="bg-blue-500 text-white px-3 py-2 rounded w-full sm:w-auto">
              + Add Transaction
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            placeholder="Search..."
            className="border p-2 w-full rounded text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border p-2 rounded text-black w-full sm:w-auto"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border min-w-[500px]">
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-200"}>
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Category</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Type</th>
                {role === "admin" && <th className="p-2">Action</th>}
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(t => (
                  <tr key={t.id} className="border-t text-center">
                    <td className="p-2">{t.date}</td>
                    <td className="p-2">{t.category}</td>
                    <td className="p-2">₹ {t.amount}</td>
                    <td className="p-2">{t.type}</td>

                    {role === "admin" && (
                      <td className="p-2">
                        <button className="text-blue-400">Edit</button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSIGHTS */}
      <h2 className="text-lg sm:text-xl font-semibold mt-8 mb-3">Insights</h2>
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
        <p>Highest spending: {highestSpending}</p>
        <p>Last month expenses: ₹ {lastMonthExpenses}</p>
        <p>Monthly: {monthlyComparison}</p>
        <p>Observation: {observation}</p>
      </div>

    </div>
  );
}

export default Dashboard;