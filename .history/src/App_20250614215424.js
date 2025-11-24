import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Component/Header";
import Footer from './Component/Footer';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import PaymentForm from './Component/PaymentForm';
import BudgetItemList from './Component/BudgetItemList';
import TripDetails from './Pages/TripDetails';
import ChecklistPage from './Pages/ChecklistPage';
import TripPage from './Pages/Trippage';
import Admin from './Pages/Backend';
import AlbumPage from './Pages/AlbumPage';
import Article from './Pages/Article';
import AuthSwitcher from './Pages/AuthSwitcher';
import FeedbackPage from "./Pages/FeedbackPage";
import HotelPage from "./Pages/HotelPage";
import BudgetPage from "./Pages/BudgetPage";
import AssignHotelPage from "./Pages/AssignHotelPage";
import HotelManagementPage from "./Pages/Admin/HotelManagementPage";
import HotelReviewManagementPage from "./Pages/Admin/HotelReviewManagementPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các route không có layout */}
        <Route path="/login" element={<AuthSwitcher />} />
        <Route path="/register" element={<AuthSwitcher />} />
        <Route path="/backend" element={<Admin />} />
        <Route path="/payment/:tripId" element={<PaymentForm />} />
        <Route path="/budget" element={<BudgetItemList />} />

        {/* Các route có Header và Footer */}
        <Route path="/" element={<LayoutWithHeaderFooter><Home /></LayoutWithHeaderFooter>} />
        <Route path="/trippage" element={<LayoutWithHeaderFooter><TripPage /></LayoutWithHeaderFooter>} />
        <Route path="/album" element={<LayoutWithHeaderFooter><AlbumPage /></LayoutWithHeaderFooter>} />
        <Route path="/article" element={<LayoutWithHeaderFooter><Article /></LayoutWithHeaderFooter>} />
        <Route path="/trips/:id" element={<LayoutWithHeaderFooter><TripDetails /></LayoutWithHeaderFooter>} />
        <Route path="/checklist/:tripId" element={<LayoutWithHeaderFooter><ChecklistPage /></LayoutWithHeaderFooter>} />
        <Route path="/feedback" element={<LayoutWithHeaderFooter><FeedbackPage /></LayoutWithHeaderFooter>} />
        <Route path="/hotel" element={<LayoutWithHeaderFooter><HotelPage /></LayoutWithHeaderFooter>} />
        <Route path="trips/:tripId/assign-hotel" element={<LayoutWithHeaderFooter><AssignHotelPage /></LayoutWithHeaderFooter>} />
        <Route path="/admin" element={<Admin />}>
          <Route path="hotels" element={<HotelManagementPage />} />
          <Route path="reviews" element={<HotelReviewManagementPage />} />
          <Route path="reviews/:hotelId/stats" element={<HotelReviewManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Component Layout bọc Header + Footer
function LayoutWithHeaderFooter({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default App;
