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

// Заглушка отчета "ABC-анализ".
const MOCK_ROWS = [
  {
    supplier_article: "TEST-5",
    name: "Товар A",
    revenue: 300000,
    share: 50,
    group: "A",
  },
  {
    supplier_article: "TEST-6",
    name: "Товар B",
    revenue: 150000,
    share: 25,
    group: "B",
  },
  {
    supplier_article: "TEST-7",
    name: "Товар C",
    revenue: 150000,
    share: 25,
    group: "C",
  },
];

export const ABCPage: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Отчет: ABC-анализ ассортимента
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        В рабочем режиме данные подтягиваются из API /reports/abc и группируются по накопленной доле выручки.
      </Typography>
      <Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Артикул</TableCell>
              <TableCell>Название</TableCell>
              <TableCell align="right">Выручка</TableCell>
              <TableCell align="right">Доля, %</TableCell>
              <TableCell align="right">Группа</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_ROWS.map((r) => (
              <TableRow key={r.supplier_article}>
                <TableCell>{r.supplier_article}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell align="right">
                  {r.revenue.toLocaleString("ru-RU")}
                </TableCell>
                <TableCell align="right">{r.share}</TableCell>
                <TableCell align="right">{r.group}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};