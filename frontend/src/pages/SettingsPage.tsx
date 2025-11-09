import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface ApiKey {
  id: number;
  name: string;
}

export const SettingsPage: React.FC = () => {
  const [tokenName, setTokenName] = useState("default");
  const [tokenValue, setTokenValue] = useState("");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [costsFile, setCostsFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const authHeader = () => {
    const access = localStorage.getItem("access_token");
    return access ? { Authorization: `Bearer ${access}` } : {};
  };

  const loadKeys = async () => {
    try {
      const { data } = await axios.get<ApiKey[]>(`${API_URL}/wb/keys`, {
        headers: authHeader(),
      });
      setKeys(data);
    } catch (e) {
      // ignore for MVP, покажем при сохранении
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await axios.post(
        `${API_URL}/wb/keys`,
        { name: tokenName || "default", token: tokenValue },
        { headers: authHeader() }
      );
      setTokenValue("");
      setMessage("API-ключ сохранен.");
      await loadKeys();
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ||
        (Array.isArray(error?.response?.data) ? error.response.data[0]?.msg : null) ||
        "Ошибка при сохранении ключа";
      setMessage(String(detail));
    }
  };

  const handleDeleteKey = async (id: number) => {
    setMessage(null);
    try {
      await axios.delete(`${API_URL}/wb/keys/${id}`, {
        headers: authHeader(),
      });
      setMessage("Ключ удален.");
      await loadKeys();
    } catch {
      setMessage("Ошибка при удалении ключа");
    }
  };

  const handleUploadCosts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costsFile) {
      setMessage("Выберите файл себестоимости.");
      return;
    }
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", costsFile);
      // Эндпоинт загрузки будет реализован отдельно.
      // await axios.post(`${API_URL}/costs/upload`, formData, { headers: authHeader() });
      setMessage("Файл себестоимости принят (MVP-заглушка).");
      setCostsFile(null);
    } catch {
      setMessage("Ошибка при загрузке файла себестоимости");
    }
  };

  return (
    <Box mt={2}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API-ключи Wildberries
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Ключ хранится на сервере в зашифрованном виде. Убедитесь, что используете ключ с необходимыми правами.
              </Typography>
              <Box
                component="form"
                onSubmit={handleSaveKey}
                display="flex"
                gap={2}
                flexDirection="column"
              >
                <TextField
                  label="Название ключа"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  size="small"
                />
                <TextField
                  label="API-ключ Wildberries"
                  value={tokenValue}
                  onChange={(e) => setTokenValue(e.target.value)}
                  size="small"
                  multiline
                  required
                />
                <Button type="submit" variant="contained">
                  Сохранить ключ
                </Button>
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle1">Сохраненные ключи</Typography>
                {keys.length === 0 && (
                  <Typography variant="body2" color="textSecondary">
                    Ключи еще не добавлены.
                  </Typography>
                )}
                {keys.map((k) => (
                  <Box
                    key={k.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={1}
                  >
                    <Typography>{k.name}</Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteKey(k.id)}
                    >
                      Удалить
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Загрузка себестоимости товаров
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Загрузите CSV/XLSX с колонками: supplier_sku / supplier_article, cost.
                Эти данные используются для расчета прибыли.
              </Typography>
              <Box
                component="form"
                onSubmit={handleUploadCosts}
                display="flex"
                flexDirection="column"
                gap={2}
              >
                <Button variant="outlined" component="label">
                  Выбрать файл
                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      setCostsFile(e.target.files ? e.target.files[0] : null)
                    }
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  />
                </Button>
                <Button type="submit" variant="contained">
                  Загрузить
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {message && (
        <Box mt={2}>
          <Typography
            variant="body2"
            color={message.toLowerCase().includes("ошибка") ? "error" : "primary"}
          >
            {message}
          </Typography>
        </Box>
      )}
    </Box>
  );
};