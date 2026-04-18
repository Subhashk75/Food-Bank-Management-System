import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, ColorModeScript, CSSReset } from '@chakra-ui/react';

import theme from "./theme";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Auth Pages
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Admin Dashboard & Pages
import Dashboard from "./components/admin/Dashboard";
import Distribution from "./components/admin/DistributionManagement";
import Inventory from "./components/admin/InventoryManagement";
import Inputs from './components/admin/Input';
import Output from './components/admin/Output';
import PrivacyPolicy from './components/admin/PrivacyPolicy';
import TermsOfService from './components/admin/TermsOfService';
import AboutUs from './components/admin/AboutUs';

// Product & Distribution
import ProductList from './pages/productlist';
import AddItem from './pages/additem';
import ModifyItem from './pages/modifyitem';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config?.initialColorMode || "light"} />
      <CSSReset />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes with DashboardLayout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/distribution" element={<Distribution />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inputs" element={<Inputs />} />
            <Route path="/output" element={<Output />} />

            <Route path="/productlist" element={<ProductList />} />
            <Route path="/additem" element={<AddItem />} />
            <Route path="/modifyitem" element={<ModifyItem />} />
            <Route path="/modifyitem/:productId" element={<ModifyItem />} />

            {/* Static Pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/aboutus" element={<AboutUs />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;