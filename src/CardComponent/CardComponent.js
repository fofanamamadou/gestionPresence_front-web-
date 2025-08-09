import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import "./styles.css";

function CardComponent({ title, count }) {
  return (
    <Card className="card">
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{count}</Typography>
      </CardContent>
    </Card>
  );
}

export default CardComponent;