// src/pages/Dashboard.jsx
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
  } from "@mui/material";
  
  const rows = [
    { task: "Flood", status: "Completed", action: "Get Data" },
    { task: "Flood", status: "Pending", action: "Dispatch" },
  ];
  
  const Dashboard = () => {
    return (
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Task
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.task}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    <Button variant="contained" size="small">
                      {row.action}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  export default Dashboard;
  