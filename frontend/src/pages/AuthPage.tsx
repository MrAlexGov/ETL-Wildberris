import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (mode === "register") {
        await axios.post(`${API_URL}/auth/register`, {
          email,
          password,
          full_name: fullName || undefined,
        });
        setMessage("Регистрация успешна. Теперь войдите.");
        setMode("login");
      } else {
        const form = new FormData();
        form.append("username", email);
        form.append("password", password);
        const { data } = await axios.post(`${API_URL}/auth/login`, form);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        setMessage("Вход выполнен.");
      }
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ||
        (Array.isArray(error?.response?.data) ? error.response.data[0]?.msg : null) ||
        "Ошибка запроса";
      setMessage(String(detail));
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Личный кабинет WB Analytics
          </Typography>
          <Tabs
            value={mode}
            onChange={(_, v) => {
              setMode(v);
              setMessage(null);
            }}
            sx={{ mb: 2 }}
          >
            <Tab label="Вход" value="login" />
            <Tab label="Регистрация" value="register" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mode === "register" && (
              <TextField
                fullWidth
                label="Имя"
                margin="normal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <TextField
              fullWidth
              label="Пароль"
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {message && (
              <Typography
                variant="body2"
                color={message.includes("Ошибка") ? "error" : "primary"}
                sx={{ mt: 1 }}
              >
                {message}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              {mode === "login" ? "Войти" : "Зарегистрироваться"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};