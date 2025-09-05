import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ChatModal = ({ handleClose }) => {
    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Chatbot
                </Typography>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    borderRadius: 1,
                    color: "black",
                    p: 1,
                    overflowY: "auto",
                }}
            >
                <Typography variant="body2">Hey 👋 I’m your chatbot!</Typography>
            </Box>
        </Box>
    );
};

export default ChatModal;
