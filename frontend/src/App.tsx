import React from "react";
import { Route, Routes, Navigate, Link } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";

import { DashboardPage } from "./pages/DashboardPage";
import { ProfitabilityPage } from "./pages/ProfitabilityPage";
import { ToRemovePage } from "./pages/ToRemovePage";
import { StocksPage } from "./pages/StocksPage";
import { SlowMovingPage } from "./pages/SlowMovingPage";
import { ABCPage } from "./pages/ABCPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AuthPage } from "./pages/AuthPage";

export const App: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            WB Analytics
          </Typography>
          <Button color="inherit" component={Link} to="/dashboard">
            Дашборд
          </Button>
          <Button color="inherit" component={Link} to="/reports/profitability">
            Прибыльность
          </Button>
          <Button color="inherit" component={Link} to="/reports/to-remove">
            Товары к выводу
          </Button>
          <Button color="inherit" component={Link} to="/reports/stocks">
            Остатки
          </Button>
          <Button color="inherit" component={Link} to="/reports/slow-moving">
            Залежавшиеся
          </Button>
          <Button color="inherit" component={Link} to="/reports/abc">
            ABC
          </Button>
          <Button color="inherit" component={Link} to="/settings">
            Настройки
          </Button>
          <Button color="inherit" component={Link} to="/auth">
            Вход
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, pb: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports/profitability" element={<ProfitabilityPage />} />
          <Route path="/reports/to-remove" element={<ToRemovePage />} />
          <Route path="/reports/stocks" element={<StocksPage />} />
          <Route path="/reports/slow-moving" element={<SlowMovingPage />} />
          <Route path="/reports/abc" element={<ABCPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;