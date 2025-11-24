import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// Layouts
import UserLayout from "./layout/UserLayout";
import AdminLayout from "./layout/AdminLayout";
import PartnerLayout from "./layout/PartnerLayout";
// Pages
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import PaymentForm from './Component/PaymentForm';
import PaymentPage from './Component/PaymentPage';
import TripDetails from './Pages/TripDetails';
import ChecklistPage from './Pages/checklist/ChecklistPage';
import TripPage from './Pages/Trippage';
import AlbumPage from './Pages/AlbumPage';
import Article from './Pages/Article';
import AuthSwitcher from './Pages/AuthSwitcher';
import FeedbackPage from "./Pages/FeedbackPage";
import HotelPage from "./Pages/HotelPage";
import BudgetPage from "./Pages/BudgetPage";
import AssignHotelPage from "./Pages/AssignHotelPage";
import BudgetDetailPage from "./Pages/BudgetDetailPage";
import ForgotPassword from "./Pages/ForgotPassword";
import DashboardPage from "./Pages/Admin/dashboard";
import User from "./Pages/Admin/user";
import AccessDeniedPage from "./Pages/AccessDeniedPage";
import BudgetDetailsPage from "./Pages/Admin/BudgetDetailsPage";
import ManageMembers from "./Pages/ManageMembers";
import PredictionForm from "./Pages/PredictionForm";
import SafetyPage from "./Pages/safety/SafetyPage";
import ReviewManagementPage from "./Pages/Admin/ReviewManagementPage";
import TripManagementPage from "./Pages/Admin/TripManagementPage";
import AcceptInvitePage from "./Pages/AcceptInvite";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomeLogout from "./Pages/HomeLogout";
import AdminArticle from "./Pages/Admin/adminArticle";
import AdminAlbumScreen from "./Pages/Admin/adminAlbumScreen";
import FeedbackPageLogout from "./Pages/FeedbackPageLogout";
import Blog from "./Pages/Blog";
import AlbumByTrip from "./Pages/AlbumByTrip";
import AlbumScreen from './Pages/AlbumScreen';
import BlogDetail from "./Pages/BlogDetail";
import FeelFeed from './Pages/FeelFeed';
import FeelUpload from './Pages/FeelUpload';
import AdminFeelManager from "./Pages/Admin/AdminFeelManager";
// Check list

// Partner pages
import PartnerDashboardPage from './Pages/Partner/dashboard';
import PartnerHotelManagermentPage from "./Pages/Partner/HotelManagementPage";
import PartnerRoomManagermentPage from "./Pages/Partner/RoomManagermentPage";
import RoomTypesManagermentPage from './Pages/Partner/RoomTypeManagementPage';
import UserBookedManagementPage from "./Pages/Partner/UserBookedManagementPage";
import ReviewManagementPage1 from "./Pages/Partner/ReviewManagementPage1";
import HotelStatisticsPage from "./Pages/Partner/HotelStatisticsPage";
import RequestCancelPage from "./Pages/Partner/RequestCancelPage";

// Detail pages
import HotelDetailsPage from "./Pages/HotelDetailsPage";
import RoomDetailsPage from './Pages/RoomDetailsPage';
import EditProfile from "./Pages/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public/Auth */}
        <Route path="/login" element={<AuthSwitcher />} />
        <Route path="/register" element={<AuthSwitcher />} />
        <Route path="/403" element={<AccessDeniedPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/payment/:tripId" element={<PaymentPage />} />

        <Route path="/trips/:tripId/accept" element={<AcceptInvitePage />} />
        <Route path="/rooms/:roomId" element={<RoomDetailsPage />} />

        {/* Admin layout */}
        <Route path="/backend" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="usermanager" element={<User />} />
          <Route path="budgetmanager" element={<BudgetDetailsPage />} />

          <Route path="reviewmanager" element={<ReviewManagementPage />} />
          <Route path="tripmanager" element={<TripManagementPage />} />
          <Route path="adminArticle" element={<AdminArticle />} />
          <Route path="Feel" element={<AdminFeelManager />} />
          <Route path="adminAlbumScreen" element={<AdminAlbumScreen />} />
        </Route>

        {/* Parnet layout */}
        <Route path="/partner" element={<PartnerLayout />}>
          <Route path="dashboard" element={<PartnerDashboardPage />} />
          <Route path="hotelmanager" element={<PartnerHotelManagermentPage />} />
          <Route path="roommanager" element={<PartnerRoomManagermentPage />} />
          <Route path="roomtypes" element={<RoomTypesManagermentPage />} />
          <Route path="usermanager" element={<UserBookedManagementPage />} />
          <Route path="reviewmanager1" element={<ReviewManagementPage1 />} />
          <Route path="hotel-stats" element={<HotelStatisticsPage />} />
          <Route path="requestcancel" element={<RequestCancelPage />} />

        </Route>
        <Route path="/rooms-types/add" element={<RoomTypesManagermentPage />} />
        <Route path="/rooms/add" element={<PartnerRoomManagermentPage />} />


        {/* User layout */}
        <Route element={<UserLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/trippage" element={<TripPage />} />
          <Route path="/albumbytrip" element={<AlbumByTrip />} />
          <Route path="/album/:tripId" element={<AlbumScreen />} />
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/article" element={<Article />} />
          <Route path="/trips/:id" element={<TripDetails />} />
          <Route path="/checklist/:tripId" element={<ChecklistPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/hotel" element={<HotelPage />} />
          <Route path="trips/:tripId/assign-hotel" element={<AssignHotelPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/budget/:tripId" element={<BudgetDetailPage />} />
          <Route path="/feel" element={<FeelFeed />} />
          <Route path="/feel/upload" element={<FeelUpload />} />
          <Route path="/hotels/:id" element={<HotelDetailsPage />} />
          <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />
          <Route path="/trips/:id/members" element={<ManageMembers />} />
          <Route path="prediction" element={<PredictionForm />} />
        </Route>

        {/* Public without layout */}
        <Route path="/" element={<HomeLogout />} />
        <Route path="/feedback-logout" element={<FeedbackPageLogout />} />

        {/* Partner extra routes outside layout */}
        <Route path="/rooms-types/add" element={<RoomTypesManagermentPage />} />
        <Route path="/rooms/add" element={<PartnerRoomManagermentPage />} />
        <Route path="/editprofile" element={<EditProfile />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
