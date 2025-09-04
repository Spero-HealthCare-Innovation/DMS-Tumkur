import React, { useState, useLayoutEffect, useRef } from 'react'
import { motion } from "framer-motion"
import { Box, Typography, Paper, Grid, Switch, List, ListItem, ListItemText, Collapse, Tabs, Tab, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import * as am5 from "@amcharts/amcharts5";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
  ComposedChart,
  Line,
  Legend,
} from "recharts";
import vehical from "./../../../../assets/vehical.png";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import AddIcCallIcon from '@mui/icons-material/AddIcCall';
import SendIcon from "@mui/icons-material/Send";
import CallIcon from '@mui/icons-material/Call';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useAuth } from "../../../../Context/ContextAPI";

const MotionBox = motion(Box);
export const commonStyles1 = {
  fontFamily: "Roboto, sans-serif",
  heading: {
    fontWeight: 700,
    fontSize: "16px",
    color: "#5FC8EC",
  }
};

// Sample data for the chart
const data = [
  { name: "Chief Complaint A", value: 50, color: "#f78da7" },
  { name: "Chief Complaint B", value: 70, color: "#f9a26c" },
  { name: "Chief Complaint C", value: 20, color: "#fcd56c" },
  { name: "Chief Complaint D", value: 80, color: "#9ddfe5" },
  { name: "Chief Complaint E", value: 90, color: "#a3c9f9" },
  { name: "Chief Complaint F", value: 30, color: "#e3f48e" },
  { name: "Chief Complaint G", value: 50, color: "#d5a8f5" },
  { name: "Chief Complaint H", value: 70, color: "#77b3f9" },
  { name: "Chief Complaint I", value: 90, color: "#f78da7" },
  { name: "Chief Complaint J", value: 80, color: "#f9a26c" },
  { name: "Chief Complaint K", value: 100, color: "#fcd56c" },
  { name: "Chief Complaint L", value: 50, color: "#9ddfe5" }
];
const lightenColor = (color, percent) => {
  // Agar 8-digit hex ho (#RRGGBBAA), to last 2 digits (alpha) hatao
  if (color.length === 9) {
    color = color.slice(0, 7);
  }

  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
};

// Sample complaints data
const complaintsData = [
  {
    chief: "Chief Complaint A",
    count: 50,
    color: lightenColor("#d77e94ff", 20),
    sub: [
      { name: "Sub-complaint 1", count: 20 },
      { name: "Sub-complaint 2", count: 15 },
      { name: "Sub-complaint 3", count: 15 }
    ]
  },
  {
    chief: "Chief Complaint B",
    count: 70,
    color: lightenColor("#db8956ff", 25),
    sub: [
      { name: "Sub-complaint 1", count: 30 },
      { name: "Sub-complaint 2", count: 25 },
      { name: "Sub-complaint 3", count: 15 }
    ]
  },
  {
    chief: "Chief Complaint C",
    count: 20,
    color: lightenColor("#c5a243ff", 15),
    sub: [
      { name: "Sub-complaint 1", count: 10 },
      { name: "Sub-complaint 2", count: 10 }
    ]
  },
  {
    chief: "Chief Complaint D",
    count: 80,
    color: lightenColor("#61b5bcff", 15),
    sub: [
      { name: "Sub-complaint 1", count: 35 },
      { name: "Sub-complaint 2", count: 25 },
      { name: "Sub-complaint 3", count: 20 }
    ]
  },
  {
    chief: "Chief Complaint E",
    count: 90,
    color: lightenColor("#6f8cb1ff", 15),
    sub: [
      { name: "Sub-complaint 1", count: 40 },
      { name: "Sub-complaint 2", count: 30 },
      { name: "Sub-complaint 3", count: 20 }
    ]
  },
  {
    chief: "Chief Complaint F",
    count: 30,
    color: lightenColor("#aec151ff", 10),
    sub: [
      { name: "Sub-complaint 1", count: 15 },
      { name: "Sub-complaint 2", count: 15 }
    ]
  },
  {
    chief: "Chief Complaint G",
    count: 50,
    color: lightenColor("#ac78d1ff", 20),
    sub: [
      { name: "Sub-complaint 1", count: 25 },
      { name: "Sub-complaint 2", count: 25 }
    ]
  },
  {
    chief: "Chief Complaint H",
    count: 70,
    color: lightenColor("#4c8fdcff", 20),
    sub: [
      { name: "Sub-complaint 1", count: 35 },
      { name: "Sub-complaint 2", count: 35 }
    ]
  },
  {
    chief: "Chief Complaint I",
    count: 90,
    color: lightenColor("#c05c75ff", 25),
    sub: [
      { name: "Sub-complaint 1", count: 45 },
      { name: "Sub-complaint 2", count: 45 }
    ]
  },
  {
    chief: "Chief Complaint J",
    count: 80,
    color: lightenColor("#b9754aff", 25),
    sub: [
      { name: "Sub-complaint 1", count: 40 },
      { name: "Sub-complaint 2", count: 40 }
    ]
  }
];


// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '8px',
        borderRadius: '4px',
        color: 'white'
      }}>
        <p>{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Custom Bar Shape Component
const RoundedBar = (props) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={4}
      ry={4}
    />
  );
};

const COLORS = [
  "#f78da7", "#f9a26c", "#fcd56c",
  "#9ddfe5", "#a3c9f9", "#e3f48e",
  "#d5a8f5", "#9be6c2", "#77b3f9"
];



const pyramidData = [
  // { number: "01", title: "Total Calls", color: "#3f51b5" },
  // { number: "02", title: "Dispatch", color: "#ff4081" },
  // { number: "03", title: "Closure", color: "#ff9800" },
  // { number: "04", title: "Pending", color: "#e91e63" },
  { number: "70", title: "Vehical", color: "#9c27b0" },
];



function Dashboard() {
  const {
    vehicleData,
    loading1,
    error1,
    callData,
    filter,
    setFilter,
    loading2,
    error2,
    dispatchClosure,
    avgTimes,
    callTypes,
    chiefComplaints,
    fetchChiefComplaints,
  } = useAuth();
  const chartRef = useRef(null);

  console.log("vehical count", callData);
  const [selectedCallType, setSelectedCallType] = useState("Municipal Call");
  const [activeType, setActiveType] = useState("municipal");


  useLayoutEffect(() => {
    if (!chartRef.current || !callData) return;  // 👈 null check

    const root = am5.Root.new(chartRef.current);
    root._logo.dispose();
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(60),
        startAngle: 180,
        endAngle: 360,
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        startAngle: 180,
        endAngle: 360,
      })
    );

    series.labels.template.setAll({
      text: "{category}: {value}"  // shows count
    });

    series.slices.template.setAll({
      tooltipText: "{category}: {value}",
      strokeOpacity: 0,
      fillOpacity: 1
    });

    // ✅ color set
    series.set("colors", am5.ColorSet.new(root, {
      colors: [
        am5.color("rgba(255, 113, 139, 1)"),
        am5.color("rgba(45, 200, 125, 1)")
      ],
      reuse: true,
      step: 1,
    }));

    // ✅ data from context
    const filteredData = callData[filter] || { emergency: 0, non_emergency: 0 };
    const data = [
      { category: "Emergency", value: filteredData.emergency || callData.emergency },
      { category: "Non-Emergency", value: filteredData.non_emergency || callData.non_emergency },
    ];
    series.data.setAll(data);

    // Calculate total only from available counts
    const total = data
      .filter(d => d.value > 0)   // only non-zero values
      .reduce((s, d) => s + d.value, 0);

    // Add center label
    series.children.push(
      am5.Label.new(root, {
        text: `Total Call\n${total}`,
        fontSize: 17,
        fontWeight: "700",
        fill: am5.color(0xffffff),
        textAlign: "center",
        centerX: am5.p50,
        centerY: am5.p50,
        dy: -13,
      })
    );


    series.appear(1000, 500);
    chart.appear(1000, 500);

    return () => root.dispose();
  }, [callData, filter]);

  const fallbackData = [
    { name: 'Div-1', value: 0, line: 0 },
    { name: 'Div-2', value: 0, line: 0 },
    { name: 'Div-3', value: 0, line: 0 },
    { name: 'Div-4', value: 0, line: 0 },
    { name: 'Div-5', value: 0, line: 0 },
  ];

  const isEmpty = !data || data.length === 0;
  const chartData = isEmpty ? fallbackData : data;


  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const commonStyles = {
    heading: {
      color: '#fff',
      textAlign: 'center'
    }
  };


  // ---- Call Chart Component ----
  // if (loading2) return <Typography>Loading...</Typography>;
  // if (error2) return <Typography color="red">{error}</Typography>;
  if (!callData) return null;

  console.log(callData, "Call status");

  // pick the right data from filter
  const filteredData = callData[filter] || { all: 0, emergency: 0, non_emergency: 0 };

  const handleFilterClick = (type) => {
    setFilter(type);
  };

  //average time
  const avgDispatch = avgTimes?.average_dispatch_time?.[filter] || "00:00:00";
  const avgResponse = avgTimes?.average_response_time?.[filter] || "00:00:00";

  //call types
  // Map API response -> chart data
  const data1 = callTypes.map((ct, idx) => ({
    name: ct.name,
    value: ct[filter] || 0,   // today, last_month, total
    color: ["rgba(200, 147, 253, 1)", "rgba(179, 234, 106, 1)", "rgba(255, 113, 139, 1)", "rgba(127, 167, 247, 1)", "#dea53d"][idx % 5], // random colors
  }));

  // Handle call type change
  const handleCallTypeChange = (event) => {
    const selected = event.target.value;
    setSelectedCallType(selected);

    // find call type id from name
    const selectedType = callTypes.find((ct) => ct.name === selected);
    if (selectedType) {
      fetchChiefComplaints(selectedType.id);
    }
  };




  return (
    <>
      <Grid>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between", // left & right alignment
            alignItems: "center",
            width: "100%",
            // mt: 2,
          }}
        >
          {/* LEFT SECTION (Tabs + Date Picker) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }} style={{ marginLeft: '-6px' }}>
            {/* Tabs */}
            <Box
              sx={{
                maxWidth: { xs: 320, sm: 480, md: 900 },
                bgcolor: "#383737ff",
                borderRadius: "20px",
                mt: 1,
                p: 0,
                marginLeft: "4.5rem",
              }}
            >
              <Tabs
                value={filter}
                onChange={(e, val) => setFilter(val)}
                TabIndicatorProps={{ style: { display: "none" } }}
                sx={{
                  minHeight: "auto",
                  ".MuiTab-root": {
                    textTransform: "none",
                    fontSize: "14px",
                    padding: "8px 12px",
                    minHeight: "auto",
                    color: "#f5f3f3ff",
                    transition: "all 0.3s ease",
                    fontFamily: "Roboto",
                    fontWeight: 500,
                  },
                  ".Mui-selected": {
                    backgroundColor: "#5e3dea",
                    color: "#fff",
                    borderRadius: "20px",
                  },
                }}
              >

                <Tab label="Till Date" value="total" />
                <Tab label="Last Month" value="last_month" />
                <Tab label="Today" value="today" />
              </Tabs>
            </Box>
            <Box>
              <Select
                size="small"
                value={selectedCallType}
                onChange={handleCallTypeChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: "white", opacity: 0.7, fontSize: "12px" }}>
                        Select Call Type
                      </span>
                    );
                  }
                  return selected;
                }}
                sx={{
                  mt: 1,
                  borderRadius: "20px",
                  bgcolor: "transparent",   // transparent bg
                  color: "white",           // text color
                  fontSize: "16px",
                  fontFamily: "Roboto, sans-serif",
                  minWidth: 200,
                  height: 32,
                  border: "1px solid white", // white outline
                  "& .MuiSelect-select": {
                    padding: "4px 10px",
                  },
                  "& fieldset": {
                    border: "none",
                  },
                  "&.MuiOutlinedInput-root": {
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                  "&.Mui-focused": {
                    outline: "none",
                    boxShadow: "none",
                  },
                  "& svg": {
                    color: "white", // arrow white
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#2a2a2a",   // dropdown background
                      color: "white",       // items white
                      maxHeight: 300,
                      "&::-webkit-scrollbar": {
                        width: 8,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#6649BF",
                        borderRadius: 4,
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "#1e1e1e",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" disabled hidden>
                  Select Call Type
                </MenuItem>
                {callTypes.map((ct) => (
                  <MenuItem key={ct.id} value={ct.name}>
                    {ct.name}
                  </MenuItem>
                ))}
              </Select>

              {/* Chief Complaint Dropdown */}
              <Select
                size="small"
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: "white", opacity: 0.7, fontSize: "12px" }}>
                        Select Chief Complaint
                      </span>
                    );
                  }
                  return selected;
                }}
                sx={{
                  ml: 2,
                  borderRadius: "20px",
                  bgcolor: "transparent",
                  color: "white",
                  fontSize: "16px",
                  fontFamily: "Roboto, sans-serif",
                  minWidth: 220,
                  height: 32,
                  border: "1px solid white",
                  "& .MuiSelect-select": { padding: "4px 10px" },
                  "& fieldset": { border: "none" },
                  "&.MuiOutlinedInput-root": {
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                  "&.Mui-focused": { outline: "none", boxShadow: "none" },
                  "& svg": { color: "white" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#2a2a2a",
                      color: "white",
                      maxHeight: 300,
                      "&::-webkit-scrollbar": { width: 8 },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#6649BF",
                        borderRadius: 4,
                      },
                      "&::-webkit-scrollbar-track": { backgroundColor: "#1e1e1e" },
                    },
                  },
                }}
              >
                <MenuItem value="" disabled hidden>
                  Select Chief Complaint
                </MenuItem>
                <MenuItem value="Chest Pain">Chest Pain</MenuItem>
                <MenuItem value="Breathing Issue">Breathing Issue</MenuItem>
                <MenuItem value="Accident">Accident</MenuItem>
                <MenuItem value="Burn">Burn</MenuItem>
              </Select>
            </Box>


          </Box>
        </Box>
      </Grid>

      <Grid container spacing={2} >


        {/* Left Side (25-30%) */}
        <Grid item xs={12} md={3.5} sx={{ marginLeft: "4.5rem", }}> {/* 3/12 = 25% width */}
          <Paper
            elevation={3}
            sx={{
              borderRadius: "16px",
              p: 1.5,
              mt: 2,
              backgroundColor: "rgba(112, 144, 176, 0.12)",
              position: "relative",
            }}
          >
            {/* Heading */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "700", mb: 2, textAlign: "left", ...commonStyles1.heading }}
            >
              Average Timings
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              {/* Call Take Time */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box textAlign="center" className="hvr-shrink">
                  <CallIcon sx={{ fontSize: 50, color: "rgba(127, 167, 247, 1)" }} />
                  <Typography sx={{ fontWeight: "600", mt: 1, ...commonStyles1.fontFamily }}>00:01:00</Typography>
                  <Typography sx={{ fontSize: "11px", ...commonStyles1.fontFamily }}>Average Call Take Time</Typography>
                </Box>
              </motion.div>

              <Box sx={{ width: "40px", borderTop: "2px dashed #888", mt: "5vh" }} />

              {/* Dispatch Time */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Box textAlign="center" className="hvr-shrink">
                  <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "rgba(127, 228, 126, 1)" }} />
                  <Typography sx={{ fontWeight: "600", mt: 1, ...commonStyles1.fontFamily }}> {avgDispatch}</Typography>
                  <Typography sx={{ fontSize: "11px", ...commonStyles1.fontFamily }}>Average Call Dispatch Time</Typography>
                </Box>
              </motion.div>

              <Box sx={{ width: "40px", borderTop: "2px dashed #888", mt: "5vh" }} />

              {/* Response Time */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Box textAlign="center" className="hvr-shrink">
                  <AccessTimeIcon sx={{ fontSize: 50, color: "rgba(248, 195, 145, 1)" }} />
                  <Typography sx={{ fontWeight: "600", mt: 1, ...commonStyles1.fontFamily }}>{avgResponse}</Typography>
                  <Typography sx={{ fontSize: "11px", ...commonStyles1.fontFamily }}>Average Response Time</Typography>
                </Box>
              </motion.div>
            </Box>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              borderRadius: "16px",
              p: 2,
              mt: 1,
              backgroundColor: "rgba(112, 144, 176, 0.12)",
            }}
          >
            <Box display="flex" flexDirection="column">

              <Typography variant="subtitle1" sx={{ fontWeight: 600, ...commonStyles1.heading }}>
                Call Status
              </Typography>

              <Box display="flex" alignItems="center">
                <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "rgba(255, 113, 139, 1)", mr: 1 }} />
                <Typography sx={{ fontFamily: "Roboto", fontWeight: 400, fontSize: 11, mr: 1 }}>
                  Emergency
                </Typography>
                <Switch defaultChecked size="small" sx={{ mr: 1, zIndex: "100" }} />
                <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "rgba(45, 200, 125, 1)", mr: 1 }} />
                <Typography sx={{ fontFamily: "Roboto", fontWeight: 400, fontSize: 11, mr: 1 }}>
                  Non-Emergency
                </Typography>
                <Switch defaultChecked size="small" sx={{ mr: 1, zIndex: "100" }} />
              </Box>

              <Box ref={chartRef} sx={{ width: "300px", height: "250px", marginTop: "-3.6rem", marginBottom: "-3rem" }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={2}>
          {/* <Box display="flex" gap={2} mt={3}> */}
          {/* Dispatch */}

          <Paper
            elevation={3}
            sx={{
              p: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              borderRadius: "12px",
              bgcolor: "rgba(112, 144, 176, 0.12)",
              color: "#fff",
              minWidth: 230,
              mt: 2,
            }}
          >
            {/* Heading */}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                ...commonStyles1.heading,
                alignSelf: "flex-start",
              }}
            >
              Vehicle
            </Typography>
            {/* Image (Right → Left Animation) */}
            <Box
              component={motion.img}
              src={vehical}
              alt="Vehicle"
              initial={{ x: 120, opacity: 0 }}   // start off right side
              animate={{ x: 0, opacity: 1 }}     // slide to normal position
              transition={{ duration: 0.8, ease: "easeOut" }}
              sx={{ height: 60, width: 200, mt: 1 }}
            />
            {/* Label */}
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Total Vehicle
            </Typography>

            {/* Count */}
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {vehicleData.total_vehicle_today}
            </Typography>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              p: 2.6,
              mt: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderRadius: "12px",
              bgcolor: "rgba(112, 144, 176, 0.12)",
              color: "#fff",
              minWidth: 230,
            }}
          >
            {/* Top section */}
            <Box sx={{ textAlign: "left" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, ...commonStyles1.heading }}>
                Total Emergency Calls
              </Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 600, textAlign: "center", mt: 2 }}>
                {filteredData.emergency}
              </Typography>
            </Box>

            {/* Bottom section */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
              {/* Dispatch Row */}
              <MotionBox
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 200, justifyContent: "space-between" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocalShippingIcon sx={{ fontSize: 38, color: "rgba(255, 113, 139, 1)" }} />
                  <Typography sx={{ fontSize: 17, fontWeight: 500 }}>Dispatch</Typography>
                </Box>
                <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{dispatchClosure.dispatch[filter]}</Typography>
              </MotionBox>

              {/* Closure Row */}
              <MotionBox
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 200, justifyContent: "space-between" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AssignmentTurnedInIcon sx={{ fontSize: 38, color: "rgba(179, 234, 106, 1)" }} />
                  <Typography sx={{ fontSize: 17, fontWeight: 500 }}>Closure</Typography>
                </Box>
                <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{dispatchClosure.closure[filter]}</Typography>
              </MotionBox>
            </Box>

          </Paper>
        </Grid>

        {/* Right Side (50% for graph / chart) */}
        <Grid item xs={12} md={5.5}>
          {/* First Row - Chart taking full width */}
          <Grid container spacing={2}>


            {/* Second Row - Split into 6 and 6 */}

            <Grid item xs={12} md={5}>

              <Paper
                elevation={3}
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column", // stack heading on top, chart below
                  gap: 2,
                  borderRadius: "12px",
                  bgcolor: "rgba(112, 144, 176, 0.12)",
                  color: "#fff",
                  minWidth: 235,
                  mt: 2,
                  ml: 5,
                }}
              >
                {/* Heading */}
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, ...commonStyles1.heading, alignSelf: "flex-start" }}
                >
                  Call Types
                </Typography>


                <BarChart
                  width={200}
                  height={135}
                  layout="vertical"
                  data={data1}
                  margin={{ top: -2, left: -40, bottom: 4 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={true}
                    tick={false}
                  />
                  <Tooltip
                    formatter={(val, name, props) => [val, props.payload.name]}
                    contentStyle={{
                      padding: "2px 4px",
                      fontSize: "12px",
                    }}
                    itemStyle={{
                      padding: "2px 0",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    isAnimationActive={false}
                    radius={[4, 4, 4, 4]}
                    background={false}
                    barSize={12}
                    minPointSize={4}   // 👈 ensures even "0" shows as tiny bar
                  >
                    {data1.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Bar>

                </BarChart>
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              {/* Enhanced List Section */}
              <Paper
                elevation={3}
                sx={{
                  width: 280,
                  maxHeight: 195,
                  overflowY: "auto",
                  borderRadius: 2,
                  p: 1,
                  ml: 5,
                  mt: 2,

                  // Custom scrollbar styling
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#696767ff',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#555',
                    },
                  },
                }}
              >
                <List sx={{ p: 0 }}>
                  {chiefComplaints.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ListItem
                        onClick={() => handleClick(index)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: "#31373D",
                          borderRadius: 1,
                          mb: 0.5,
                          '&:hover': { backgroundColor: '#323030ff' },
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={item.name}
                          primaryTypographyProps={{
                            fontWeight: "500",
                            color: '#fff',
                            fontFamily: "Roboto",
                            fontSize: "13px",
                          }}
                        />
                        <Box
                          sx={{
                            backgroundColor: "#5e3dea",
                            borderRadius: '12px',
                            padding: '4px 8px',
                            minWidth: '30px',
                            textAlign: 'center',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: '#010101ff', fontWeight: 'bold' }}
                          >
                            {item[filter] || 0} {/* today/last_month/total ke hisaab se */}
                          </Typography>
                        </Box>
                      </ListItem>

                      {/* Sub complaints same as abhi */}
                      <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.sub?.map((subItem, subIndex) => (
                            <ListItem
                              key={subIndex}
                              sx={{
                                pl: 4,
                                backgroundColor: '#31373D',
                                borderRadius: 1,
                                mb: 0.3,
                                mr: 1,
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#9a9494ff' },
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <ListItemText
                                primary={subItem.name}
                                primaryTypographyProps={{
                                  color: '#ffffffff',
                                  fontSize: '14px',
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#000000ff',
                                  fontWeight: 'bold',
                                  backgroundColor: "#5e3dea",
                                  borderRadius: '8px',
                                  padding: '2px 6px',
                                  marginRight: "10",
                                }}
                              >
                                {subItem[filter] || 0}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  ))}
                </List>

              </Paper>
            </Grid>
            <Grid item xs={12}>
              {/* Chart Section */}
              <Paper
                elevation={3}
                sx={{
                  p: 1,
                  // mt: 1,
                  ml: 5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  borderRadius: "12px",
                  bgcolor: "rgba(112, 144, 176, 0.12)",
                  color: "#fff",
                  minWidth: 230,
                }}
              >
                {/* Heading */}
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, ...commonStyles1.heading, alignSelf: "flex-start" }}
                >
                  Chief-Complaints
                </Typography>
                {/* Chart */}
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart
                    data={data}
                    margin={{ top: 15, right: 20, left: 20, bottom: -10 }}
                  >
                    <XAxis dataKey="name" stroke="#fff" tick={false} axisLine={true} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Bars first (piche) */}
                    <Bar
                      dataKey="value"
                      shape={<RoundedBar />}
                      maxBarSize={30}
                      label={{ position: "top", fill: "#fff", fontSize: 14 }}
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          cursor="pointer"
                        />
                      ))}
                    </Bar>
                    {/* Line after bars (upar dikhne ke liye) */}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ff6b81"
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        fill: "#fff",
                        stroke: "#ff6b81",
                        strokeWidth: 2
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default Dashboard
