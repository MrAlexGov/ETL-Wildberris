import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

// Заглушка отчета "Управление остатками".
const MOCK_ROWS = [
  {
    supplier_article: "TEST-3",
    name: "Товар с риском отсутствия",
    stock_qty: 15,
    avg_daily_sales: 5,
    days_left: 3,
  },
];

export const StocksPage: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Отчет: управление остатками
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        В рабочем режиме данные подтягиваются из API /reports/stocks и показывают прогноз исчерпания остатков.
      </Typography>
      <Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Артикул</TableCell>
              <TableCell>Название</TableCell>
              <TableCell align="right">Остаток</TableCell>
              <TableCell align="right">Средн. продаж/день</TableCell>
              <TableCell align="right">Дней до нуля</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_ROWS.map((r) => (
              <TableRow key={r.supplier_article}>
                <TableCell>{r.supplier_article}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell align="right">
                  {r.stock_qty.toLocaleString("ru-RU")}
                </TableCell>
                <TableCell align="right">{r.avg_daily_sales}</TableCell>
                <TableCell align="right">{r.days_left}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};