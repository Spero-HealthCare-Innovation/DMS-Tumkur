import { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";

import flood from "../../../assets/flood (1).png";
import urbanflood from "../../../assets/Urbanflood.png";
import cloudburst from "../../../assets/heavy-rain.png";
import firehazard from "../../../assets/fire.png";
import forestfirehazard from "../../../assets/forest.png";
import landslide from "../../../assets/landslide.png";
import masscasualty from "../../../assets/response.png";
import heavyrainfall from "../../../assets/heavyRainfall.jpg";
import thunderstorm from "../../../assets/thunder (1).png";
import { useAuth } from "../../../Context/ContextAPI";

const disasterImages = [
  { text: "Flood", img: flood },
  { text: "Urban Floods", img: urbanflood },
  { text: "Cloudburst", img: cloudburst },
  { text: "Fire Hazard", img: firehazard },
  { text: "Forest Fire Hazard", img: forestfirehazard },
  { text: "Landslide", img: landslide },
  { text: "Mass Casualty", img: masscasualty },
  { text: "Heavy Rainfall", img: heavyrainfall },
  { text: "Thunderstorm ", img: thunderstorm },
];

const Sidebar = ({ darkMode }) => {
  const [open, setOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const { disaster, selectedDisasterId, setSelectedDisasterId, setSelectedDisasterName } = useAuth();

  useEffect(() => {
    if (disaster && disaster.length > 0) {
      const dynamicMenuItems = disaster.map((item) => {
        const imageObj = disasterImages.find((d) => d.text === item.disaster_name);
        return {
          id: item.disaster_id,
          text: item.disaster_name,
          img: imageObj ? imageObj.img : "",
        };
      });
      setMenuItems([
        {
          id: 0,
          text: "All",
          img: "",
        },
        ...dynamicMenuItems,
      ]);
    }
  }, [disaster]);

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        sx={{
          width: open ? 200 : 50,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? 200 : 50,
            height: "60vh",
            overflowY: "auto",
            overflowX: "hidden",
            background: darkMode
              ? "linear-gradient(to bottom, #5FC8EC, rgb(19, 26, 28))"
              : "linear-gradient(to bottom, #5FC8EC, rgb(18, 24, 26))",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            color: "#fff",
            borderRadius: "30px",
            display: "flex",
            flexDirection: "column",
            paddingTop: 1,
            paddingBottom: 3,
            marginTop: "9em",
            marginLeft: "0.8em",
            transition: "width 0.5s ease-in-out",
            "&::-webkit-scrollbar": {
              width: "0px",
            },
            "&:hover": {
              background: darkMode
                ? "linear-gradient(to bottom, #53bce1, rgb(19, 26, 28))"
                : "linear-gradient(to bottom, #5FC8EC, rgb(18, 24, 26))",
            },
          },
        }}
      >
        <List sx={{ width: "100%", padding: 0 }}>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={index}
              sx={{
                color: "black",
                "&:hover": { background: "rgb(95, 200, 236)" },
              }}
              onClick={() => {
                setSelectedDisasterId(item.id);
                setSelectedDisasterName(item.text);
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <img
                  src={item.img}
                  alt={item.text}
                  style={{ width: 24, height: 24, objectFit: "contain" }}
                  onError={(e) => (e.target.style.display = "none")} // hide broken image
                />
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "14px",
                  lineHeight: 1.3,
                }}
                sx={{
                  opacity: open ? 1 : 0,
                  whiteSpace: "nowrap",
                  color: "white",
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
