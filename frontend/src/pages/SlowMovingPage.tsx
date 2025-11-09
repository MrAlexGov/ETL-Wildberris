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

// Заглушка отчета "Залежавшиеся товары".
const MOCK_ROWS = [
  {
    supplier_article: "TEST-4",
    name: "Товар без продаж",
    last_sale_date: "2024-06-01",
    days_since_last_sale: 120,
  },
];

export const SlowMovingPage: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Отчет: залежавшиеся товары
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        В рабочем режиме данные подтягиваются из API /reports/slow-moving с параметром порога дней.
      </Typography>
      <Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Артикул</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Последняя продажа</TableCell>
              <TableCell align="right">Дней без продаж</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_ROWS.map((r) => (
              <TableRow key={r.supplier_article}>
                <TableCell>{r.supplier_article}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.last_sale_date}</TableCell>
                <TableCell align="right">
                  {r.days_since_last_sale}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};