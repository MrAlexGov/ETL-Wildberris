import React from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

// MVP: заглушка таблицы прибыльности.
// В дальнейшем данные подгружаются с backend /reports/profitability.
const MOCK_ROWS = [
  {
    supplier_article: "TEST-1",
    name: "Товар 1",
    revenue: 100000,
    cost: 60000,
    commission: 15000,
    logistics: 5000,
    profit: 20000,
    margin: 20,
  },
];

export const ProfitabilityPage: React.FC = () => {
  const handleExport = () => {
    // Здесь будет вызов backend-эндпоинта экспорта в Excel.
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Отчет: прибыльность товаров</Typography>
        <Button variant="outlined" onClick={handleExport}>
          Экспорт в Excel
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Артикул</TableCell>
            <TableCell>Название</TableCell>
            <TableCell align="right">Выручка</TableCell>
            <TableCell align="right">Себестоимость</TableCell>
            <TableCell align="right">Комиссия</TableCell>
            <TableCell align="right">Логистика</TableCell>
            <TableCell align="right">Прибыль</TableCell>
            <TableCell align="right">Маржа, %</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {MOCK_ROWS.map((r) => (
            <TableRow key={r.supplier_article}>
              <TableCell>{r.supplier_article}</TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell align="right">{r.revenue.toLocaleString("ru-RU")}</TableCell>
              <TableCell align="right">{r.cost.toLocaleString("ru-RU")}</TableCell>
              <TableCell align="right">{r.commission.toLocaleString("ru-RU")}</TableCell>
              <TableCell align="right">{r.logistics.toLocaleString("ru-RU")}</TableCell>
              <TableCell align="right">{r.profit.toLocaleString("ru-RU")}</TableCell>
              <TableCell align="right">{r.margin}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="body2" color="textSecondary" mt={2}>
        Данные демонстрационные. В рабочем режиме подтягиваются из API /reports/profitability.
      </Typography>
    </Paper>
  );
};