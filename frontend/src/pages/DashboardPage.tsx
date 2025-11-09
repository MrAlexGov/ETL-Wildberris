import React from "react";
import { Grid, Paper, Typography } from "@mui/material";

export const DashboardPage: React.FC = () => {
  // Заглушка дашборда: ключевые KPI. В реальном запуске данные тянем из /reports.
  const cards = [
    { label: "Выручка (за 30 дней)", value: "—" },
    { label: "Прибыль (за 30 дней)", value: "—" },
    { label: "Количество заказов", value: "—" },
    { label: "Товаров на складе", value: "—" }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((c) => (
        <Grid item xs={12} sm={6} md={3} key={c.label}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {c.label}
            </Typography>
            <Typography variant="h5">{c.value}</Typography>
          </Paper>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Динамика продаж</Typography>
          <Typography variant="body2" color="textSecondary">
            График будет построен по данным API /reports (MVP-заглушка).
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};