import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaClipboardList, FaWalking, FaFlagCheckered } from 'react-icons/fa';
import './BudgetPage.css';
import BudgetDailyTable from '../Pages/BudgetDailyTable';
function BudgetDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]);
  const [tripStatus, setTripStatus] = useState('');
  const [editingItem, setEditingItem] = useState(null);

const [newItem, setNewItem] = React.useState({
  type: '',
  estimated: '',
  note: '',
  actualFood: '',
  actualTransport: '',
  actualHotel: '',
  actualSightseeing: '',
  actualEntertainment: '',
  actualShopping: '',
  actualOther: ''
});

const [submittedItem, setSubmittedItem] = React.useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [editItemId, setEditItemId] = useState(null);
  const [actualValue, setActualValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [editingId, setEditingId] = useState(null);
const [tripData, setTripData] = useState(null);
  const [totalFood, setTotalFood] = useState(0);
  const [totalTransport, setTotalTransport] = useState(0);
  const [totalHotel, setTotalHotel] = useState(0);
  const [totalOther, setTotalOther] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteBudgetId, setDeleteBudgetId] = useState(null);
  const [totalSightseeing, setTotalSightseeing] = useState(0);
  const [totalEntertainment, setTotalEntertainment] = useState(0);
  const [totalShopping, setTotalShopping] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [destination, setDestination] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [days, setDays] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');

  const [refreshTrigger, setRefreshTrigger] = useState(0);



 const handleAISuggest = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`http://localhost:8080/api/ai/budget/suggest-from-trip/${tripId}`);
    const content = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    setAiSuggestions(content || 'No suggestion found');
  } catch (error) {
    console.error("AI Suggest error:", error);
    setAiSuggestions('❌ Failed to get suggestions from AI.');
  } finally {
    setLoading(false);
  }
};

const handleSaveToDB = async () => {
  try {
    if (!aiSuggestions || aiSuggestions.startsWith("❌")) {
      alert("No valid AI suggestion to save!");
      return;
    }

    // Cắt theo Day 1:, Day 2: ...
const blocks = aiSuggestions.match(/Day\s+\d+:[\s\S]*?(?=Day\s+\d+:|$)/gi) || [];
const items = blocks.map((block) => {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

  const item = {
    food: 0, foodNote: '',
    transport: 0, transportNote: '',
    hotel: 0, hotelNote: '',
    sightseeing: 0, sightseeingNote: '',
    shopping: 0, shoppingNote: '',
    entertainment: 0, entertainmentNote: '',
    other: 0, otherNote: '',
    estimated: 0, actual: 0,
    type: '', // sẽ gán sau
    tripId: tripId,
  };

  let currentCategory = null;

  lines.forEach(line => {
    // ✅ lấy ra Day số
    const dayMatch = line.match(/^Day\s+(\d+):/i);
    if (dayMatch) {
      item.type = `Day ${dayMatch[1]}`;  // dùng số thật, không dựa vào idx
      return;
    }

    const amountMatch = line.match(/^([A-Za-z &]+):\s*\$([\d.]+)/i);
    const adviceMatch = line.match(/^→?\s*Advice:\s*(.+)/i);

    if (amountMatch) {
      const category = amountMatch[1].trim();
      const amount = parseFloat(amountMatch[2]);
      currentCategory = category;

      switch (category) {
        case 'Food & Dining': item.food = amount; break;
        case 'Transport': item.transport = amount; break;
        case 'Hotel': item.hotel = amount; break;
        case 'Sightseeing': item.sightseeing = amount; break;
        case 'Entertainment': item.entertainment = amount; break;
        case 'Shopping': item.shopping = amount; break;
        case 'Other': item.other = amount; break;
        case 'Total': item.estimated = amount; break;
      }
    } else if (adviceMatch && currentCategory) {
      const note = adviceMatch[1].trim();
      switch (currentCategory) {
        case 'Food & Dining': item.foodNote = note; break;
        case 'Transport': item.transportNote = note; break;
        case 'Hotel': item.hotelNote = note; break;
        case 'Sightseeing': item.sightseeingNote = note; break;
        case 'Entertainment': item.entertainmentNote = note; break;
        case 'Shopping': item.shoppingNote = note; break;
        case 'Other': item.otherNote = note; break;
      }
      currentCategory = null;
    }
  });

  // Nếu AI không có "Total" thì tự tính
  if (item.estimated === 0) {
    item.estimated =
      item.food +
      item.transport +
      item.hotel +
      item.sightseeing +
      item.entertainment +
      item.shopping +
      item.other;
  }

  return item;
});

    await axios.post(
      `http://localhost:8080/api/trips/${tripId}/budgets/ai-replace`,
      items,
      { headers: { "Content-Type": "application/json" } }
    );

    alert('✅ Add Budget AI Success');
    setShowModal(false);
    fetchBudgetItems();
    fetchTripTotalAmount();
    fetchActualBreakdown();
    setRefreshTrigger(prev => prev + 1);

  } catch (err) {
    console.error("Save AI error:", err.response?.data || err.message);
    alert('❌ Failed to save suggested items');
  }
};


  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [suggestions, setSuggestions] = useState(null);

  const [loading, setLoading] = useState(false);


  const [actualInputs, setActualInputs] = useState({
    anUong: '',
    anUongNote: '',
    xeCo: '',
    xeCoNote: '',
    khachSan: '',
    khachSanNote: '',
    khac: '',
    khacNote: '',
    thamQuan: '',
    thamQuanNote: '',
    giaiTri: '',
    giaiTriNote: '',
    muaSam: '',
    muaSamNote: ''

  });
  const [usdAmount, setUsdAmount] = useState(0);
  const [targetCurrency, setTargetCurrency] = useState("VND");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const handleSubmitweather = async (e) => {
    e.preventDefault();
    try {
      const weatherRes = await axios.get(`http://localhost:8080/api/weather/forecast`, {
        params: { city, date },
      });

      const weather = weatherRes.data.forecast.forecastday[0].day;

      const suggestRes = await axios.post(`http://localhost:8080/api/trips/suggestion`, {
        condition: weather.condition.text,
        temp: weather.avgtemp_c,
        rainChance: weather.daily_chance_of_rain,
      });

      setSuggestions(suggestRes.data);
    } catch (err) {
      console.error("Lỗi:", err);
      setSuggestions(null);
    }
  };
const handleEditClick = (item) => {
  setEditingItem(item);
  setNewItem({
    type: item.type,
    note: item.note || '',
    actualFood: item.actualFood || '',
    actualTransport: item.actualTransport || '',
    actualHotel: item.actualHotel || '',
    actualSightseeing: item.actualSightseeing || '',
    actualEntertainment: item.actualEntertainment || '',
    actualShopping: item.actualShopping || '',
    actualOther: item.actualOther || ''
  });
  setShowForm(true);
};

const handleUpdate = async (e) => {
  e.preventDefault();

  if (!editingItem) return;

  // Ép kiểu số và tính tổng estimated
  const actualFood = parseFloat(editingItem.actualFood) || 0;
  const actualTransport = parseFloat(editingItem.actualTransport) || 0;
  const actualHotel = parseFloat(editingItem.actualHotel) || 0;
  const actualSightseeing = parseFloat(editingItem.actualSightseeing) || 0;
  const actualEntertainment = parseFloat(editingItem.actualEntertainment) || 0;
  const actualShopping = parseFloat(editingItem.actualShopping) || 0;
  const actualOther = parseFloat(editingItem.actualOther) || 0;

  const estimatedVal =
    actualFood +
    actualTransport +
    actualHotel +
    actualSightseeing +
    actualEntertainment +
    actualShopping +
    actualOther;

  try {
    const token = localStorage.getItem("token");

    const payload = {
      type: editingItem.type,
      estimated: estimatedVal,
      note: editingItem.note || "",
      actualFood,
      actualTransport,
      actualHotel,
      actualSightseeing,
      actualEntertainment,
      actualShopping,
      actualOther,
    };

    // Dùng _id thay vì id
await axios.put(
  `http://localhost:8080/api/trips/${tripId}/budgets/${editingItem.id || editingItem.budgetId}`,
  payload,
  { headers: { Authorization: `Bearer ${token}` } }
);



    toast.success("Budget item updated!");

    // Reset lại form + refetch
    setEditingItem(null);
    fetchBudgetItems();
    fetchTripTotalAmount();
    fetchActualBreakdown();
    setRefreshTrigger((prev) => prev + 1);
  } catch (err) {
    console.error("Update error:", err.response?.data || err.message);
    toast.error("Failed to update budget item.");
  }
};

  const handleConvert = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/currency/convert-usd", {
        params: {
          amount: usdAmount,
          to: targetCurrency
        }
      });
      setConvertedAmount(res.data.convertedAmount);
    } catch (err) {
      console.error("Lỗi chuyển đổi:", err);
    }
  };
  const getStepClass = (currentStatus, step) => {
    const order = { Planning: 1, Ongoing: 2, Completed: 3 };
    return order[currentStatus] >= order[step] ? 'active' : '';
  };
  const itemsPerPage = 4;
  const totalPages = Math.ceil(budgetItems.length / itemsPerPage);
  const currentItems = budgetItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    fetchBudgetItems();
    fetchTripTotalAmount();
    fetchActualBreakdown();
  }, [tripId]);



  const fetchBudgetItems = () => {
    const token = localStorage.getItem('token');

    axios.get(`http://localhost:8080/api/trips/${tripId}/budgets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const items = res.data || [];
        setBudgetItems(Array.isArray(items) ? items : []);
      })
      .catch(err => {
        if (err.response && err.response.status === 403) {
          setTimeout(() => navigate("/403")); // chuyển hướng sau 1s
        } else {
          toast.error('Failed to load budget items.');
          setBudgetItems([]);
        }
      });
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:8080/api/trips/${tripId}/budgets`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        const items = response.data;

        // Khởi tạo tổng cho 7 loại chi phí
        let food = 0, transport = 0, hotel = 0, other = 0;
        let sightseeing = 0, entertainment = 0, shopping = 0;

        items.forEach(item => {
          food += item.food || 0;
          transport += item.transport || 0;
          hotel += item.hotel || 0;
          other += item.other || 0;
          sightseeing += item.sightseeing || 0;
          entertainment += item.entertainment || 0;
          shopping += item.shopping || 0;
        });

        // Set lại các state tổng
        setTotalFood(food);
        setTotalTransport(transport);
        setTotalHotel(hotel);
        setTotalOther(other);
        setTotalSightseeing(sightseeing);
        setTotalEntertainment(entertainment);
        setTotalShopping(shopping);

        fetchBudgetItems(); // Nếu cần giữ hàm này
      })
      .catch(error => {
        console.error('Lỗi khi tải ngân sách:', error);
      });
  }, [tripId]);





  const fetchTripTotalAmount = () => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:8080/api/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const trip = res.data.data;
        setTotalAmount(trip.totalAmount || 0);
        setTripStatus(trip.status || '');
        setStartDate(trip.startDate);
        setEndDate(trip.endDate);
      })
      .catch(() => {
        setTotalAmount(0);
        setTripStatus('');
      });
  };
  const fetchActualBreakdown = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:8080/api/trips/${tripId}/budgets`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const items = res.data || [];

      let food = 0, transport = 0, hotel = 0, sightseeing = 0, shopping = 0, entertainment = 0, other = 0, actual = 0;

      items.forEach(item => {
        food += item.food || 0;
        transport += item.transport || 0;
        hotel += item.hotel || 0;
        sightseeing += item.sightseeing || 0;
        shopping += item.shopping || 0;
        entertainment += item.entertainment || 0;
        other += item.other || 0;
        actual += item.actual || 0;
      });

      setTotalFood(food);
      setTotalTransport(transport);
      setTotalHotel(hotel);
      setTotalSightseeing(sightseeing);
      setTotalShopping(shopping);
      setTotalEntertainment(entertainment);
      setTotalOther(other);
      setTotalActual(actual);
    } catch (err) {
      console.error('Lỗi khi load actual breakdown:', err);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/trips/budgets/${deleteBudgetId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchBudgetItems();
      fetchTripTotalAmount();
      fetchActualBreakdown();
      setBudgetItems((prev) => prev.filter((item) => item.id !== deleteBudgetId));
         setRefreshTrigger(prev => prev + 1);
      toast.success("✅ Delete success!");
    } catch (err) {
      toast.error("❌ Failed to delete");
    } finally {
      setShowConfirmModal(false);
      setDeleteBudgetId(null);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteBudgetId(id);
    setShowConfirmModal(true);
  };

  const remainingBudget = totalAmount - totalActual;

  const generateDayLabels = () => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const labels = [];
    let day = 1;
    while (start <= end) {
      labels.push(`Day ${day}`);
      start.setDate(start.getDate() + 1);
      day++;
    }
    return labels;
  };

  const usedTypes = budgetItems.map(item => item.type);
  const actualByDay = {};

  const dailyChartData = [];

  budgetItems.forEach((item) => {
    if (item.type && item.actual != null) {
      dailyChartData.push({
        day: item.type,
        actual: item.actual,
      });
    }
  });

  // Sắp xếp theo thứ tự ngày (Day 1, Day 2, ...)
  dailyChartData.sort((a, b) => {
    const numA = parseInt(a.day.replace(/\D/g, ''), 10);
    const numB = parseInt(b.day.replace(/\D/g, ''), 10);
    return numA - numB;
  });


  const availableDayOptions = generateDayLabels().filter(day => !usedTypes.includes(day));
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === 'type') {
    const selectedDayNumber = parseInt(value.replace(/\D/g, ''), 10);

    for (let i = 1; i < selectedDayNumber; i++) {
      if (!usedTypes.includes(`Day ${i}`)) {
        setFormErrors(prev => ({
          ...prev,
          [name]: `Please select Day ${i} before selecting ${value}`
        }));
        return; // không update state
      }
    }
  }

  if (name.startsWith('actual')) {
    // Chuyển giá trị input actual thành number hoặc '' nếu rỗng
    setNewItem(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  } else {
    setNewItem(prev => ({ ...prev, [name]: value }));
  }

  setFormErrors(prev => ({ ...prev, [name]: '' }));
};
const handleAdd = async (e) => {
  e.preventDefault();

  if (tripStatus !== 'Planning') {
    toast.error('Only trips with status "Planning" can add budget items.');
    return;
  }

  const errors = {};
  const { type } = newItem;

  if (!type.trim()) errors.type = 'Type is required.';

  // Tính estimated từ tổng các actual
  const actualFood = parseFloat(newItem.actualFood) || 0;
  const actualTransport = parseFloat(newItem.actualTransport) || 0;
  const actualHotel = parseFloat(newItem.actualHotel) || 0;
  const actualSightseeing = parseFloat(newItem.actualSightseeing) || 0;
  const actualEntertainment = parseFloat(newItem.actualEntertainment) || 0;
  const actualShopping = parseFloat(newItem.actualShopping) || 0;
  const actualOther = parseFloat(newItem.actualOther) || 0;

  const estimatedVal = actualFood + actualTransport + actualHotel + actualSightseeing +
                       actualEntertainment + actualShopping + actualOther;

  if (estimatedVal > remainingBudget) {
    errors.estimated = `Total actual must be ≤ remaining budget ($${remainingBudget.toFixed(2)})`;
  }

  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  try {
    const token = localStorage.getItem('token');

    const payload = {
      type,
      estimated: estimatedVal, // auto-calculated
      note: newItem.note || '',
      actualFood,
      actualTransport,
      actualHotel,
      actualSightseeing,
      actualEntertainment,
      actualShopping,
      actualOther
    };

    await axios.post(`http://localhost:8080/api/trips/${tripId}/budgets`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success('Budget item added!');

    setNewItem({
      type: '',
      note: '',
      actualFood: '',
      actualTransport: '',
      actualHotel: '',
      actualSightseeing: '',
      actualEntertainment: '',
      actualShopping: '',
      actualOther: ''
    });

    setFormErrors({});
    fetchBudgetItems();
    fetchTripTotalAmount();

    fetchActualBreakdown();
    setRefreshTrigger(prev => prev + 1);
    setShowForm(false);

  } catch (err) {
    toast.error('Failed to add budget item.');
  }
};

  const handleEdit = async (budgetId, total) => {
    try {
      const token = localStorage.getItem('token');

      const originalItem = budgetItems.find(i => i.budgetId === budgetId);
      if (!originalItem) {
        toast.error('Original budget item not found.');
        return;
      }

      // Gửi PUT request cập nhật actual và breakdown
      await axios.put(
        `http://localhost:8080/api/trips/${tripId}/budgets/${budgetId}`,
        {
          ...originalItem,
          actual: total,
         food: Number(actualInputs.anUong || 0),
    foodNote: actualInputs.anUongNote || '',
    transport: Number(actualInputs.xeCo || 0),
    transportNote: actualInputs.xeCoNote || '',
    hotel: Number(actualInputs.khachSan || 0),
    hotelNote: actualInputs.khachSanNote || '',
           sightseeing: Number(actualInputs.thamQuan || 0),
    sightseeingNote: actualInputs.thamQuanNote || '',
       entertainment: Number(actualInputs.giaiTri || 0),
    entertainmentNote: actualInputs.giaiTriNote || '',
    shopping: Number(actualInputs.muaSam || 0),
    shoppingNote: actualInputs.muaSamNote || '',
    other: Number(actualInputs.khac || 0),
    otherNote: actualInputs.khacNote || '',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Actual cost updated successfully');

      // Reset form & trạng thái
      setEditingId(null);
      setActualInputs({
        anUong: '',
        anUongNote: '',
        xeCo: '',
        xeCoNote: '',
        khachSan: '',
        khachSanNote: '',
        khac: '',
        khacNote: '',
        thamQuan: '',
        thamQuanNote: '',
        vuiChoi: '',
        giaiTriNote: '',
        muaSam: '',
        muaSamNote: ''
      });

      // Gọi lại các API để cập nhật UI
      await Promise.all([
        fetchBudgetItems(),
        fetchTripTotalAmount(),
        fetchActualBreakdown(),
      ]);

      // ✅ Trigger BudgetDailyTable reload (nếu có prop `refreshTrigger`)
      setRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error('Actual total cost after update exceeds total trip budget', error);
      toast.error('Actual total cost after update exceeds total trip budget');
    }
  };


  const handleUpdateActual = async (id) => {
    if (tripStatus === 'Planning') {
      toast.warning('Cannot update actual while trip is still in Planning status.');
      return;
    }

    if (!actualValue || isNaN(actualValue) || parseFloat(actualValue) < 0) {
      toast.error('Please enter a valid actual value.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const item = budgetItems.find(i => i.budgetId === id);

      await axios.put(`http://localhost:8080/api/trips/${tripId}/budgets/${id}`, {
        ...item,
        actual: parseFloat(actualValue)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Actual value updated!');
      setEditItemId(null);
      setActualValue('');
      fetchBudgetItems();
    } catch {
      toast.error('Update failed.');
    }
  };
  const [inputStatus, setInputStatus] = useState({
    anUong: '',
    anUongNote: '',
    xeCo: '',
    xeCoNote: '',
    khachSan: '',
    khachSanNote: '',
    khac: '',
    khacNote: '',
    thamQuan: '',
    thamQuanNote: '',
    vuiChoi: '',
    giaiTriNote: '',
    muaSam: '',
    muaSamNote: ''
  });
  const handleFocus = (field) => {
    setInputStatus((prev) => ({ ...prev, [field]: 'focus' }));
  };

  const handleBlur = (field) => {
    setInputStatus((prev) => ({
      ...prev,
      [field]: actualInputs[field] !== '' ? 'filled' : '',
    }));
  };



  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString();
  };

  const handleExportExcel = () => {
    if (budgetItems.length === 0) {
      toast.warn("No data to export");
      return;
    }
    const exportData = budgetItems.map((item) => ({
      "Type": item.type,
      "Estimated ($)": item.estimated,
      "Actual ($)": item.actual ?? '',
      "Food ($)": item.food ?? 0,
      "Transport ($)": item.transport ?? 0,
      "Hotel ($)": item.hotel ?? 0,
      "Sightseeing ($)": item.sightseeing ?? 0,
      "Entertainment ($)": item.entertainment ?? 0,
      "Shopping ($)": item.shopping ?? 0,
      "Other ($)": item.other ?? 0,
      "Note": item.note || '',
      "Created At": formatDate(item.createdAt),
    }));





    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Budget");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });

    saveAs(blob, `trip_budget.xlsx`);
  };

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>


      <div className="mb-3">
        <button className="btn btn-outline-danger" onClick={() => navigate('/budget')}>
          ← Back To Budget
        </button>
      </div>

      <button className="btn btn-outline-primary" onClick={() => setShowModal(true)}>
        📌AI Budget
      </button>

      {showModal && (
        <div className="modal d-block" tabIndex="-1" onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">💡 AI Budget Suggestions</h5>
               
              </div>

              <div className="modal-body">
                <button className="btn btn-primary mb-3" onClick={handleAISuggest} disabled={loading}>
                  {loading ? 'Generating...' : '✨ Generate AI Suggestion'}
                </button>

                {aiSuggestions && (
                  <div className="p-3 border rounded" style={{ whiteSpace: 'pre-line' }}>
                    {aiSuggestions}
                  </div>
                )}

                {aiSuggestions && (
                  <button className="btn btn-success mt-3" onClick={handleSaveToDB}>
                    💾 Add Suggested Budget to Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-danger mb-4 text-center fs-2">Trip Budget Management</h3>

      <div className="card mb-4 p-4 shadow-sm bg-light border-2">
        <h5 className="text-center text-danger fs-4 mb-4">💰 Trip Budget Summary</h5>
        <div className="status-tracker my-4">
          <div className="steps">
            <div className={`step ${getStepClass(tripStatus, 'Planning')} planning`}>
              <div className="circle"><FaClipboardList /></div>
              <div className="label">Planning</div>
            </div>
            <div className={`step ${getStepClass(tripStatus, 'Ongoing')} ongoing`}>
              <div className="circle"><FaWalking /></div>
              <div className="label">Ongoing</div>
            </div>
            <div className={`step ${getStepClass(tripStatus, 'Completed')} completed`}>
              <div className="circle"><FaFlagCheckered /></div>
              <div className="label">Completed</div>
            </div>
          </div>
        </div>
        <div className="row g-3">
          {/* LEFT COLUMN */}
          <div className="col-md-6">
            <div className="card p-4 shadow-sm bg-white border border-danger border-2 h-100">
              <h6 className="text-center text-danger fw-bold mb-3">SUMMARY</h6>
              <div className="text-center fs-5">

                <p><strong>Total Budget:</strong> ${totalAmount.toFixed(2)}</p>
                <p><strong>Used:</strong> ${totalActual.toFixed(2)}</p>
                <p>
                  <strong>Remaining:</strong>{' '}
                  <span className={remainingBudget < 0 ? 'text-danger fw-bold' : 'text-success'}>
                    ${remainingBudget.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          {/* RIGHT COLUMN */}
          <div className="col-md-6">
            <div className="card p-4 shadow-sm bg-white border border-danger border-2 h-100">
              <h6 className="text-center text-danger fw-bold mb-3"> COST BREAKDOWN</h6>
              <ul className="list-unstyled fs-5 mx-auto" style={{ maxWidth: 400 }}>
                <li className="mb-2">
                  <span className="fw-semibold">🍽️ Food & Dining:</span> ${totalFood.toFixed(2)}
                </li>
                <li className="mb-2">
                  <span className="fw-semibold">🚗 Transportation:</span> ${totalTransport.toFixed(2)}
                </li>
                <li className="mb-2">
                  <span className="fw-semibold">🏨 Accommodation:</span> ${totalHotel.toFixed(2)}
                </li>
                <li className="mb-2">
                  <span className="fw-semibold">🗺️ Sightseeing:</span> ${totalSightseeing.toFixed(2)}
                </li>
                <li className="mb-2">
                  <span className="fw-semibold">🛍️ Shopping:</span> ${totalShopping.toFixed(2)}
                </li>
                <li className="mb-2">
                  <span className="fw-semibold">🎭 Entertainment:</span> ${totalEntertainment.toFixed(2)}
                </li>
                <li>
                  <span className="fw-semibold">📦 Others:</span> ${totalOther.toFixed(2)}
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Export Excel button */}
        <div className="d-flex justify-content-end mb-3 mt-4 me-3">
          <button className="btn btn-outline-success" onClick={handleExportExcel}>
            📁 Export Excel
          </button>
        </div>
      </div>
      <BudgetDailyTable tripId={tripId} refreshTrigger={refreshTrigger} />
   




      {totalAmount > 0 && (
        totalFood + totalTransport + totalHotel + totalOther +
        totalSightseeing + totalEntertainment + totalShopping
      ) > 0 && (
          <div className="row mt-4">
            {/* Total Budget vs Remaining */}
            <div className="col-md-6">
              <h6 className="text-center text-danger mb-2">Total vs Remaining</h6>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Total Budget', value: totalAmount },
                      { name: 'Remaining', value: remainingBudget < 0 ? 0 : remainingBudget }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="red" />
                    <Cell fill="green" />
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>


            {/* Cost Breakdown */}
            <div className="col-md-6">
              <h6 className="text-center text-danger mb-2">Cost Breakdown</h6>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Food & Dining', value: totalFood },
                      { name: 'Transportation', value: totalTransport },
                      { name: 'Accommodation', value: totalHotel },
                      { name: 'Sightseeing', value: totalSightseeing },
                      { name: 'Entertainment', value: totalEntertainment },
                      { name: 'Shopping', value: totalShopping },
                      { name: 'Others', value: totalOther }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    <Cell fill="#FF6384" />
                    <Cell fill="#36A2EB" />
                    <Cell fill="#FFCE56" />
                    <Cell fill="#9966FF" />
                    <Cell fill="#FF9F40" />
                    <Cell fill="#00A8A8" />
                    <Cell fill="#4BC0C0" />
                  </Pie>

                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}


      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-danger rounded-circle"
          style={{ width: 48, height: 48, fontSize: 22 }}
          onClick={() => setShowForm(!showForm)}
          title="Add Budget Item"
        >
          ➕
        </button>


      </div>


{showForm && tripStatus === 'Planning' && (
  <div className="card shadow-sm p-4 mb-5 bg-light border-danger border-2">
    <h5 className="mb-3 text-danger fs-4">Add Budget Item</h5>
    <form onSubmit={handleAdd}>
      <div className="row g-3">
        {/* Select Day */}
        <div className="col-md-6">
          <label className="form-label fw-bold">Select Day</label>
          <select
            name="type"
            value={newItem.type}
            onChange={handleChange}
            className={`form-select fs-5 ${formErrors.type ? 'is-invalid' : ''}`}
          >
            <option value="">-- Select Day --</option>
            {availableDayOptions.map((label, idx) => (
              <option key={idx} value={label}>{label}</option>
            ))}
          </select>
          {formErrors.type && <div className="text-danger mt-1">{formErrors.type}</div>}
        </div>

        {/* Note */}
        <div className="col-md-6">
          <label className="form-label fw-bold">General Note</label>
          <input
            type="text"
            name="note"
            value={newItem.note}
            onChange={handleChange}
            placeholder="Enter note..."
            className="form-control fs-5"
          />
        </div>
      </div>

      {/* Divider */}
      <hr className="my-4" />

      {/* Details section */}
      <h6 className="text-danger fw-bold mb-3 text-uppercase">Estimate The Costs</h6>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Food</label>
          <input
            type="number"
            name="actualFood"
            value={newItem.actualFood}
            onChange={handleChange}
            placeholder="Actual Food ($)"
            min="0"
            step="0.01"
            className="form-control fs-6"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Transport</label>
          <input
            type="number"
            name="actualTransport"
            value={newItem.actualTransport}
            onChange={handleChange}
            placeholder="Actual Transport ($)"
            min="0"
            step="0.01"
            className="form-control fs-6"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Hotel</label>
          <input
            type="number"
            name="actualHotel"
            value={newItem.actualHotel}
            onChange={handleChange}
            placeholder="Actual Hotel ($)"
            min="0"
            step="0.01"
            className="form-control fs-6"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Sightseeing</label>
          <input
            type="number"
            name="actualSightseeing"
            value={newItem.actualSightseeing}
            onChange={handleChange}
            placeholder="Actual Sightseeing ($)"
            min="0"
            step="0.01"
            className="form-control fs-6"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Entertainment</label>
          <input
            type="number"
            name="actualEntertainment"
            value={newItem.actualEntertainment}
            onChange={handleChange}
            placeholder="Actual Entertainment ($)"
            min="0"
            step="0.01"
            className="form-control fs-6"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Shopping</label>
          <input
            type="number"
            name="actualShopping"
            value={newItem.actualShopping}
            onChange={handleChange}
            placeholder="Actual Shopping ($)"
            min="0"
            step="0.01"
            className="form-control fs-6"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Other</label>
          <input
            type="number"
            name="actualOther"
            value={newItem.actualOther}
            onChange={handleChange}
            placeholder="Actual Other ($)"
            min="0"
            step="0.01"
            className="form-control fs-6"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="col-12 mt-4">
        <button type="submit" className="btn btn-danger w-100 fs-5 rounded-pill shadow-sm">
          Submit Budget Item
        </button>
      </div>
    </form>
  </div>
)}


    
      <h5 className="mb-3 text-danger fs-4">💳 Budget Items</h5>
      {currentItems.length > 0 ? (
        <div className="row">
          {currentItems.map((item, index) => (
            <div
              className="col-md-6 mb-4 animate-fade-down"
              key={item.budgetId}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="card border-0 shadow-lg h-120 p-4 text-dark"
                style={{
                  background: 'linear-gradient(135deg, #ffd6d6, #fff2cc)',
                  borderRadius: '1.5rem',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Dropdown menu */}
                <div className="position-relative">
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-secondary btn-sm rounded-circle p-2"
                      title="Options"
                      onClick={() =>
                        setOpenMenuId(openMenuId === item.budgetId ? null : item.budgetId)
                      }
                    >
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⋮</span>
                    </button>

                    {openMenuId === item.budgetId && (
                      <ul
                        className="dropdown-menu dropdown-menu-end show mt-2 shadow"
                        style={{ minWidth: '120px' }}
                      >
                        <li>
                          <button
                            className="dropdown-item text-danger d-flex align-items-center gap-2"
                            onClick={() => handleDeleteClick(item.budgetId)}
                          >
                            🗑 <span>Delete</span>
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>


                <div className="card-body fs-5">
                  <h5 className="card-title text-center text-danger fw-bold fs-4 mb-3">
                    {item.type}
                  </h5>
                  <p className="mb-2">
                    <strong>Estimated:</strong> ${item.estimated?.toFixed(2)}
                  </p>
                  <p className="mb-2">
                    <strong>Note:</strong> {item.note || '—'}
                  </p>

                  {editItemId === item.budgetId ? (
                    <div>
                      <input
                        type="number"
                        value={actualValue}
                        onChange={(e) => setActualValue(e.target.value)}
                        placeholder="Enter actual ($)"
                        className="form-control mb-2"
                      />
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleUpdateActual(item.budgetId)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditItemId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="mb-2">
                        <strong>Actual:</strong> ${item.actual?.toFixed(2) || '—'}
                      </p>
     {tripStatus === 'Planning' && (
  <div className="mb-3">
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 5,
        padding: 15,
        backgroundColor: '#e5c8d9ff',
        maxHeight: 400,
        overflowY: 'auto',
        marginBottom: 20
      }}
    >
      <h6 className="text-center fw-bold fs-4 mb-3">
        Estimated Cost Calculation
      </h6>

      <div className="row">
        <div className="col-md-6">
          <p><strong>Food & Dining:</strong> ${item.actualFood?.toFixed(2) || 0}</p>
          <p><strong>Transportation:</strong> ${item.actualTransport?.toFixed(2) || 0}</p>
          <p><strong>Accommodation:</strong> ${item.actualHotel?.toFixed(2) || 0}</p>
          <p><strong>Sightseeing:</strong> ${item.actualSightseeing?.toFixed(2) || 0}</p>
        </div>
        <div className="col-md-6">
          <p><strong>Shopping:</strong> ${item.actualShopping?.toFixed(2) || 0}</p>
          <p><strong>Entertainment:</strong> ${item.actualEntertainment?.toFixed(2) || 0}</p>
          <p><strong>Others:</strong> ${item.actualOther?.toFixed(2) || 0}</p>
        </div>
      </div>

      {/* Nút Edit */}
      {/* <div className="text-center mt-3">
        <button
          className="btn btn-warning btn-sm px-4"
          onClick={() => setEditingItem(item)}
        >
          Edit
        </button>
      </div> */}
    </div>

    {/* Form edit hiện ra nếu bấm nút */}
    {editingItem && (
      <div className="card p-3 mt-3">
        <h6 className="mb-3 text-center text-warning fw-bold">Edit Estimated Cost</h6>
        <form onSubmit={(e) => handleUpdate(e, editingItem._id)}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Food & Dining</label>
              <input
                type="number"
                value={editingItem.actualFood || 0}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, actualFood: e.target.value })
                }
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Transportation</label>
              <input
                type="number"
                value={editingItem.actualTransport || 0}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, actualTransport: e.target.value })
                }
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Accommodation</label>
              <input
                type="number"
                value={editingItem.actualHotel || 0}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, actualHotel: e.target.value })
                }
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Sightseeing</label>
              <input
                type="number"
                value={editingItem.actualSightseeing || 0}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, actualSightseeing: e.target.value })
                }
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Shopping</label>
              <input
                type="number"
                value={editingItem.actualShopping || 0}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, actualShopping: e.target.value })
                }
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Entertainment</label>
              <input
                type="number"
                value={editingItem.actualEntertainment || 0}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, actualEntertainment: e.target.value })
                }
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Others</label>
              <input
                type="number"
                value={editingItem.actualOther || 0}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, actualOther: e.target.value })
                }
                className="form-control"
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-warning w-50">Save</button>
            <button
              type="button"
              className="btn btn-secondary w-50"
              onClick={() => setEditingItem(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
)}


{(tripStatus === 'Ongoing' || tripStatus === 'Completed') && (
  <>
    {editingId === item.budgetId ? (
      <div className="mt-2">
        {/* Estimated Cost Calculation */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 20,
            backgroundColor: '#f9f9f9',
            maxHeight: 600,
            overflowY: 'auto',
            marginBottom: 20
          }}
        >
          <h6 className="fw-bold text-danger text-center mb-3">
            Estimated Cost Calculation
          </h6>
          <div className="row g-4">
            <div className="col-md-6"><strong>Food & Dining:</strong> ${item.actualFood?.toFixed(2) || 0}</div>
            <div className="col-md-6"><strong>Transportation:</strong> ${item.actualTransport?.toFixed(2) || 0}</div>
            <div className="col-md-6"><strong>Accommodation:</strong> ${item.actualHotel?.toFixed(2) || 0}</div>
            <div className="col-md-6"><strong>Sightseeing:</strong> ${item.actualSightseeing?.toFixed(2) || 0}</div>
            <div className="col-md-6"><strong>Shopping:</strong> ${item.actualShopping?.toFixed(2) || 0}</div>
            <div className="col-md-6"><strong>Entertainment:</strong> ${item.actualEntertainment?.toFixed(2) || 0}</div>
            <div className="col-md-12"><strong>Others:</strong> ${item.actualOther?.toFixed(2) || 0}</div>
          </div>
        </div>

        {/* Reality Form */}
        <h6
          className="fw-bold text-danger text-center"
          style={{
            fontSize: '1.2rem',
            marginBottom: 20,
            textTransform: 'uppercase'
          }}
        >
          Reality
        </h6>

        <div className="row g-3">
          {/* Food */}
          <div className="col-md-6">
            <label className="form-label text-muted">Food & Dining ($)</label>
            <input
              type="number"
              className={`form-control ${inputStatus.anUong === 'focus' ? 'border-danger' : inputStatus.anUong === 'filled' ? 'border-success' : ''}`}
              value={actualInputs.anUong}
              onChange={e => setActualInputs({ ...actualInputs, anUong: e.target.value })}
              onFocus={() => handleFocus('anUong')}
              onBlur={() => handleBlur('anUong')}
            />
            <textarea
              placeholder="Note for Food"
              className="form-control mt-1"
              value={actualInputs.anUongNote}
              onChange={e => setActualInputs({ ...actualInputs, anUongNote: e.target.value })}
            />
          </div>

          {/* Transportation */}
          <div className="col-md-6">
            <label className="form-label text-muted">Transportation ($)</label>
            <input
              type="number"
              className={`form-control ${inputStatus.xeCo === 'focus' ? 'border-danger' : inputStatus.xeCo === 'filled' ? 'border-success' : ''}`}
              value={actualInputs.xeCo}
              onChange={e => setActualInputs({ ...actualInputs, xeCo: e.target.value })}
              onFocus={() => handleFocus('xeCo')}
              onBlur={() => handleBlur('xeCo')}
            />
            <textarea
              placeholder="Note for Transportation"
              className="form-control mt-1"
              value={actualInputs.xeCoNote}
              onChange={e => setActualInputs({ ...actualInputs, xeCoNote: e.target.value })}
            />
          </div>

          {/* Accommodation */}
          <div className="col-md-6">
            <label className="form-label text-muted">Accommodation ($)</label>
            <input
              type="number"
              className={`form-control ${inputStatus.khachSan === 'focus' ? 'border-danger' : inputStatus.khachSan === 'filled' ? 'border-success' : ''}`}
              value={actualInputs.khachSan}
              onChange={e => setActualInputs({ ...actualInputs, khachSan: e.target.value })}
              onFocus={() => handleFocus('khachSan')}
              onBlur={() => handleBlur('khachSan')}
            />
            <textarea
              placeholder="Note for Accommodation"
              className="form-control mt-1"
              value={actualInputs.khachSanNote}
              onChange={e => setActualInputs({ ...actualInputs, khachSanNote: e.target.value })}
            />
          </div>

          {/* Sightseeing */}
          <div className="col-md-6">
            <label className="form-label text-muted">Sightseeing ($)</label>
            <input
              type="number"
              className={`form-control ${inputStatus.thamQuan === 'focus' ? 'border-danger' : inputStatus.thamQuan === 'filled' ? 'border-success' : ''}`}
              value={actualInputs.thamQuan}
              onChange={e => setActualInputs({ ...actualInputs, thamQuan: e.target.value })}
              onFocus={() => handleFocus('thamQuan')}
              onBlur={() => handleBlur('thamQuan')}
            />
            <textarea
              placeholder="Note for Sightseeing"
              className="form-control mt-1"
              value={actualInputs.thamQuanNote}
              onChange={e => setActualInputs({ ...actualInputs, thamQuanNote: e.target.value })}
            />
          </div>

          {/* Shopping */}
          <div className="col-md-6">
            <label className="form-label text-muted">Shopping ($)</label>
            <input
              type="number"
              className={`form-control ${inputStatus.muaSam === 'focus' ? 'border-danger' : inputStatus.muaSam === 'filled' ? 'border-success' : ''}`}
              value={actualInputs.muaSam}
              onChange={e => setActualInputs({ ...actualInputs, muaSam: e.target.value })}
              onFocus={() => handleFocus('muaSam')}
              onBlur={() => handleBlur('muaSam')}
            />
            <textarea
              placeholder="Note for Shopping"
              className="form-control mt-1"
              value={actualInputs.muaSamNote}
              onChange={e => setActualInputs({ ...actualInputs, muaSamNote: e.target.value })}
            />
          </div>

          {/* Entertainment */}
          <div className="col-md-6">
            <label className="form-label text-muted">Entertainment ($)</label>
            <input
              type="number"
              className={`form-control ${inputStatus.giaiTri === 'focus' ? 'border-danger' : inputStatus.giaiTri === 'filled' ? 'border-success' : ''}`}
              value={actualInputs.giaiTri}
              onChange={e => setActualInputs({ ...actualInputs, giaiTri: e.target.value })}
              onFocus={() => handleFocus('giaiTri')}
              onBlur={() => handleBlur('giaiTri')}
            />
            <textarea
              placeholder="Note for Entertainment"
              className="form-control mt-1"
              value={actualInputs.giaiTriNote}
              onChange={e => setActualInputs({ ...actualInputs, giaiTriNote: e.target.value })}
            />
          </div>

          {/* Others */}
          <div className="col-md-12">
            <label className="form-label text-muted">Others ($)</label>
            <input
              type="number"
              className={`form-control ${inputStatus.khac === 'focus' ? 'border-danger' : inputStatus.khac === 'filled' ? 'border-success' : ''}`}
              value={actualInputs.khac}
              onChange={e => setActualInputs({ ...actualInputs, khac: e.target.value })}
              onFocus={() => handleFocus('khac')}
              onBlur={() => handleBlur('khac')}
            />
            <textarea
              placeholder="Note for Others"
              className="form-control mt-1"
              value={actualInputs.khacNote}
              onChange={e => setActualInputs({ ...actualInputs, khacNote: e.target.value })}
            />
          </div>
        </div>

        {/* Save / Cancel */}
        <div className="mt-3 d-flex gap-2">
      <button
  className="btn btn-success btn-sm custom-save-btn"
  onClick={() => {
    const total =
      Number(actualInputs.anUong || 0) +
      Number(actualInputs.xeCo || 0) +
      Number(actualInputs.khachSan || 0) +
      Number(actualInputs.khac || 0) +
      Number(actualInputs.thamQuan || 0) +
      Number(actualInputs.muaSam || 0) +
      Number(actualInputs.giaiTri || 0);
    handleEdit(item.budgetId, total);
    setEditingId(null);
  }}
>
  Save
</button>
<button
  className="btn btn-secondary btn-sm custom-cancel-btn"
  onClick={() => setEditingId(null)}
>
  X
</button>

        </div>
      </div>
    ) : (
      // Chỉ hiện nút Edit khi chưa edit
      <button
        className="btn btn-outline-danger w-100 py-2 fw-bold shadow-sm"
        onClick={() => {
          setEditingId(item.budgetId);
          setActualInputs({
            anUong: item.actualFood?.toString() || '',
            anUongNote: item.foodNote || '',
            xeCo: item.actualTransport?.toString() || '',
            xeCoNote: item.transportNote || '',
            khachSan: item.actualHotel?.toString() || '',
            khachSanNote: item.hotelNote || '',
            khac: item.actualOther?.toString() || '',
            khacNote: item.otherNote || '',
            thamQuan: item.actualSightseeing?.toString() || '',
            thamQuanNote: item.sightseeingNote || '',
            muaSam: item.actualShopping?.toString() || '',
            muaSamNote: item.shoppingNote || '',
            giaiTri: item.actualEntertainment?.toString() || '',
            giaiTriNote: item.entertainmentNote || ''
          });
          setInputStatus({});
        }}
      >
        {item.actualFood != null ? 'Edit' : 'Reality'}
      </button>
    )}
  </>
)}



                    </>
                  )}

                  <p className="text-muted small mb-0">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      ) : (
        <p className="text-muted fst-italic fs-5">No budget items yet.</p>
      )}
            {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
   



      <div className="mt-5 px-4">
        <h6 className="text-center text-danger mb-4 text-xl font-semibold">📈 Daily Actual Spending</h6>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={dailyChartData}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4d4f" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ff4d4f" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', backgroundColor: '#fff', borderColor: '#ff4d4f' }}
              itemStyle={{ color: '#ff4d4f' }}
              formatter={(value) => `$${value}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Spending ($)"
              stroke="#ff4d4f"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#ff4d4f' }}
              activeDot={{ r: 8, strokeWidth: 3, fill: '#ff7875', stroke: '#ff4d4f' }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
        {showConfirmModal && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <h5>Are you sure you want to delete this budget item?</h5>
              <div className="mt-3 d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>



    </div>

  );
}

export default BudgetDetailPage; 