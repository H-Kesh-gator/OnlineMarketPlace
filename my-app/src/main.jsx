import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Import your pages
import LoginPage from "./pages/LoginPage.jsx";
import Signup from "./pages/Signup.jsx";
import Client from "./pages/Client.jsx";
import FreelancerProfile from "./pages/FreelancerProfile.jsx";
import FreelancerClaimed from "./pages/FreelancerClaimed.jsx";
import Notif from "./pages/Notif";
import Orders from "./pages/Orders.jsx";
import ClientReq from "./pages/ClientReq.jsx";
import ClientFinder from "./pages/ClientFinder.jsx";
import ClientOrders from "./pages/ClientOrders.jsx";
import Search13 from "./pages/Search13.jsx";
import SearchClient33 from "./pages/SearchClient33.jsx";
import OrderProgress from "./pages/OrderProgress";
import MessagesPage from "./pages/messages.jsx";
import ReviewForm from "./pages/ReviewForm.jsx";
import FreelancerFinance from "./pages/FreelancerFinance.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<LoginPage />} />

        {/* Signup route */}
        <Route path="/signup" element={<Signup />} />

        {/* Client route */}
        <Route path="/client" element={<Client />} />
        <Route path="/client-req" element={<ClientReq />} />
  <Route path="/client-finder" element={<ClientFinder />} />
        <Route path="/client-orders" element={<ClientOrders />} />
        <Route path="/search13" element={<Search13 />} />
        <Route path="/search33" element={<SearchClient33 />} />
        {/* Freelancer route */}
        <Route path="/freelancer" element={<FreelancerProfile />} />
  <Route path="/freelancer-claimed" element={<FreelancerClaimed />} />
        <Route path="/orders" element={<Orders />} />
        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="flex justify-center items-center h-screen text-xl font-semibold text-neutral-700">
              404 - Page Not Found
            </div>
          }
        />
        <Route path="/order-progress/:log_id" element={<OrderProgress />} />
  <Route path="/messages" element={<MessagesPage />} />
  <Route path="/review" element={<ReviewForm />} />
        <Route path="/notif" element={<Notif />} />
  <Route path="/freelancer-finance" element={<FreelancerFinance />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
