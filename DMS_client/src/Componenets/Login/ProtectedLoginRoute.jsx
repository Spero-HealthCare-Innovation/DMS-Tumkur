import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";
import { useAuth } from "../../Context/ContextAPI";

const ProtectedLoginRoute = ({ children }) => {
    const navigate = useNavigate();
    const port = import.meta.env.VITE_APP_API_KEY;
    const { newToken } = useAuth();
    const accessToken = localStorage.getItem("access_token");
    const [open, setOpen] = useState(false);
    const [allowRender, setAllowRender] = useState(false);
    const [logoutInitiated, setLogoutInitiated] = useState(false);

    useEffect(() => {
        if (accessToken) {
            setOpen(true);
        } else {
            setAllowRender(true);
        }
    }, [accessToken]);

    // Listen to browser back button
    // useEffect(() => {
    //     const handlePopState = () => {
    //         if (open && !logoutInitiated) {
    //             setOpen(false);
    //         }
    //     };

    //     window.addEventListener("popstate", handlePopState);
    //     return () => {
    //         window.removeEventListener("popstate", handlePopState);
    //     };
    // }, [open, logoutInitiated]);

    const handleConfirmLogout = async () => {
        const effectiveToken = newToken || localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        try {
            setLogoutInitiated(true);

            const response = await fetch(`${port}/admin_web/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${effectiveToken}`,
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            localStorage.setItem('logout', Date.now());
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('user_group');

            if (!response.ok) {
                console.warn('Logout request failed:', await response.text());
            }

            setOpen(false);
            navigate("/login");
        } catch (error) {
            console.error('Error during logout:', error);
            localStorage.clear();
            setOpen(false);
            navigate("/login");
        }
    };

    const handleCancel = () => {
        setOpen(false);
        navigate(-1); // Go back to previous page
    };

    return (
        <>
            {allowRender && children}

            <Dialog open={open} onClose={handleCancel}>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to log out?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmLogout} color="error" variant="contained">
                        Yes, Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProtectedLoginRoute;
