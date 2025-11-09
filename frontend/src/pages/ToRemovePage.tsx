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

// Заглушка отчета "Товары к выводу".
const MOCK_ROWS = [
  {
    supplier_article: "TEST-2",
    name: "Товар с низкой оборачиваемостью",
    reason: "нет продаж > 30 дней, отрицательная прибыль",
    last_sale_date: "2024-08-01",
    profit: -5000,
  },
];

export const ToRemovePage: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Отчет: товары к выводу из ассортимента
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        В рабочем режиме данные подтягиваются из API /reports/to-remove с учетом фильтров по периоду.
      </Typography>
      <Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Артикул</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Причина</TableCell>
              <TableCell>Последняя продажа</TableCell>
              <TableCell align="right">Прибыль</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_ROWS.map((r) => (
              <TableRow key={r.supplier_article}>
                <TableCell>{r.supplier_article}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell>{r.last_sale_date}</TableCell>
                <TableCell align="right">
                  {r.profit.toLocaleString("ru-RU")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};