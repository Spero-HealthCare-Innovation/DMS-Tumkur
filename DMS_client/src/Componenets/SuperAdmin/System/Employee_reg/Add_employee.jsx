import { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { Box, Typography, TextField, Button, Paper, InputAdornment, Grid, Popover, Snackbar } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Search, ArrowBack, DeleteOutline, EditOutlined, AddCircleOutline, } from "@mui/icons-material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Alert } from '@mui/material';
import { styled } from "@mui/material/styles";
import dayjs from 'dayjs';
import { Select, MenuItem, IconButton, Popper } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useTheme } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from "@mui/material/Tooltip";
import {
  CustomTextField,
  getThemeBgColors,
  textfieldInputFonts,
  fontsTableBody,
  getCustomSelectStyles,
  fontsTableHeading,
  StyledCardContent,
  inputStyle,
  EnquiryCardBody,
  EnquiryCard,

} from "../../../../CommonStyle/Style";
import { useAuth } from './../../../../Context/ContextAPI';
import KeyIcon from '@mui/icons-material/Key';

function Add_employee({ darkMode }) {
  const port = import.meta.env.VITE_APP_API_KEY;

  const {
    states,
    districts,
    Tehsils,
    Citys,
    Wards,
    selectedStateId,
    selectedDistrictId,
    selectedTehsilId,
    selectedCityID,
    selectedWardId,
    setSelectedStateId,
    setSelectedDistrictId,
    setSelectedTehsilId,
    setSelectedCityId,
    setSelectedWardId,
    loading,
    error,
  } = useAuth();


  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = "linear-gradient(to bottom, #53bce1, rgb(173, 207, 216))";
  const paper = darkMode ? "202328" : "#FFFFFF";
  const tableRow = "rgb(53 53 53)";
  const labelColor = darkMode ? "#5FECC8" : "#1976d2";
  const fontFamily = "Roboto, sans-serif";
  const borderColor = darkMode ? "#7F7F7F" : "#ccc";
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const selectStyles = getCustomSelectStyles(isDarkMode);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const inputBgColor = darkMode
    ? "rgba(255, 255, 255, 0.16)"
    : "rgba(0, 0, 0, 0.04)";

  const [passwordValue, setPasswordValue] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [addFormShow, setAddFormShow] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empContact, setEmpContact] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empDOJ, setEmpDOJ] = useState('');
  const [empDOB, setEmpDOB] = useState('');
  const [groupId, setGroupId] = useState('');
  const [employees, setEmployees] = useState([]);
  const { newToken } = useAuth();
  const effectiveToken = newToken || localStorage.getItem("access_token");
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  console.log(editingEmployeeId, 'editingEmployeeId');

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editSelectedRowId, setEditSelectedRowId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // or 'error'
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');


  const userName = localStorage.getItem("userId");
  console.log(userName, "userName");



  // Format date properly for API submission
  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // gets YYYY-MM-DD
    } catch (err) {
      console.error("Date formatting error:", err);
      return '';
    }
  };
  const formattedDOB = formatDate(empDOB);
  const formattedDOJ = formatDate(empDOJ);


  const handleStateChange = (e) => {
    setSelectedStateId(e.target.value);
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrictId(e.target.value);
  };

  const handleTehsilChange = (e) => {
    setSelectedTehsilId(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCityId(e.target.value);
  };

  const handleWardChange = (e) => {
    setSelectedWardId(e.target.value);
    if (formErrors.selectedWardId) {
      setFormErrors(prev => ({ ...prev, selectedWardId: '' }));
    }
  };



  const open = Boolean(anchorEl);
  const handleOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const initialEmployeeData = [
    {
      empName: "Akshata",
      empContact: "9876543212",
      empDOJ: "22-02-25",
      groupID: "G-2323",
      state: "maharashtra"
    },
    {
      empName: "Sneha",
      empContact: "9876543212",
      empDOJ: "22-02-25",
      groupID: "G-2323",
      state: "maharashtra"
    }
  ]


  // Function to show alert
  const showAlertMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type); // "success" or "error"
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };


  const handleSubmit = async () => {

    if (!validateForm()) {
      showAlertMessage("Please fix the form errors before submitting.", 'error');
      return;
    }
    if (empContact.length !== 10) {
      setFormErrors(prev => ({ ...prev, empContact: "Contact must be 10 digits" }));
      showAlertMessage("Contact must be exactly 10 digits.", 'error');
      return;
    }


    if (!empName || !empContact || !empEmail || !empDOJ || !empDOB || !groupId ||
      !selectedStateId || !selectedDistrictId || !selectedTehsilId || !selectedCityID) {
      alert("Please fill all required fields");
      return;
    }

    if (password !== password2) {
      setFormErrors(prev => ({
        ...prev,
        password: "Passwords do not match",
        password2: "Passwords do not match",
      }));
      showAlertMessage("Passwords do not match", 'error');
      return;
    }

    if (!validatePassword(password)) {
      setFormErrors(prev => ({
        ...prev,
        password: "Weak password",
      }));
      showAlertMessage(
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
        'error'
      );
      return;
    }

    // Generate a unique username based on name and timestamp
    const timestamp = new Date().getTime();
    const uniqueUsername = `${empName.replace(/\s+/g, '_').toLowerCase()}`;

    const payload = {
      emp_username: uniqueUsername, // Use unique username to avoid conflict
      grp_id: groupId,
      emp_email: empEmail, // Generate unique email to avoid conflict
      emp_name: empName,
      emp_contact_no: empContact,
      emp_doj: formatDate(empDOJ),
      emp_dob: formatDate(empDOB),
      emp_is_login: "0",
      state_id: selectedStateId,
      dist_id: selectedDistrictId,
      tahsil_id: selectedTehsilId,
      city_id: selectedCityID,
      ward_id: selectedWardId,
      emp_is_deleted: "0",
      emp_added_by: userName,
      emp_modified_by: userName,
      password: password,
      password2: password2
    };

    try {
      console.log("Sending employee data:", payload);
      const res = await axios.post(`${port}/admin_web/employee_post/`, payload);
      console.log("Employee Registered:", res.data);

      // Get state name from the states array
      const stateName = states.find(state => state.state_id === selectedStateId)?.state_name || "Unknown";

      await fetchEmployees();
      setShowSuccessAlert(true);

      // Optional: Auto-hide after 3 seconds
      setTimeout(() => setShowSuccessAlert(false), 3000);

      // Reset form after successful submission
      setEmpName('');
      setEmpContact('');
      setEmpEmail('');
      setEmpDOJ('');
      setEmpDOB('');
      setGroupId('');
      setSelectedStateId('');
      setSelectedDistrictId('');
      setSelectedTehsilId('');
      setSelectedCityId('');
      setSelectedWardId('');

    } catch (err) {
      console.error("Error creating employee:", err.response?.data || err.message);

      if (err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;
        let errorMessage = "Failed to add employee:\n";

        if (statusCode === 409) {
          if (errorData.emp_username) {
            errorMessage += `- Username already exists\n`;
          }
          if (errorData.emp_email) {
            errorMessage += `- Email already exists\n`;
          }
          if (errorData.detail === "Employee with this emp_name already exists.") {
            errorMessage += `- Employee name already exists\n`;
          }
        } else {
          errorMessage += errorData.detail || "Unexpected server error.";
        }

        showAlertMessage(errorMessage, 'error');
      } else {
        showAlertMessage("Failed to add employee. Please check the console for details.", 'error');
      }
    }


  };

  // const paginatedData = employees; 

  const fetchEmployees = async () => {
    setLoading1(true);
    try {
      const response = await axios.get(`${port}/admin_web/employee_get/`, {
        headers: {
          Authorization: `Bearer ${effectiveToken}`, // Replace with actual token variable
        },
      });

      const employeeData = response.data.map(emp => {
        const stateName = states.find(state => state.state_id === emp.state_id)?.state_name || "Unknown";

        return {
          empName: emp.emp_name,
          empContact: emp.emp_contact_no,
          empDOJ: dayjs(emp.emp_doj).format("DD-MM-YY"),
          groupID: emp.grp_name,
          state: stateName,
          fullData: emp,
        };
      });
      console.log(`${port}/admin_web/employee_get/`);

      setEmployees(employeeData);

    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading1(false);
    }
  };


  useEffect(() => {
    fetchEmployees();
  }, []);

  const validateName = (value) => {
    // Only letters and spaces allowed, no numbers or special characters
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(value);
  };

  const validateContact = (value) => {
    // Only numbers, exactly 10 digits
    const contactRegex = /^[0-9]{10}$/;
    return contactRegex.test(value);
  };

  const validateEmail = (value) => {
    // Standard email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Replace the validateForm function with this:
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!empName.trim()) {
      errors.empName = 'Employee name is required';
    } else if (!validateName(empName)) {
      errors.empName = 'Name should contain only letters and spaces';
    }

    // Contact validation
    if (!empContact.trim()) {
      errors.empContact = 'Contact number is required';
    } else if (!validateContact(empContact)) {
      errors.empContact = 'Contact must be exactly 10 digits';
    }

    // Email validation
    if (!empEmail.trim()) {
      errors.empEmail = 'Email is required';
    } else if (!validateEmail(empEmail)) {
      errors.empEmail = 'Please enter a valid email address';
    }

    // State validation
    if (!selectedStateId) {
      errors.selectedStateId = 'Please select a state';
    }

    // District validation
    if (!selectedDistrictId) {
      errors.selectedDistrictId = 'Please select a district';
    }

    // Tehsil validation
    if (!selectedTehsilId) {
      errors.selectedTehsilId = 'Please select a tehsil';
    }

    // City validation
    if (!selectedCityID) {
      errors.selectedCityID = 'Please select a city';
    }
    //ward validation
    if (!selectedWardId) {
      errors.selectedWardId = 'Please select a ward';
    }

    // Group validation
    if (!groupId) {
      errors.groupId = 'Please select a group';
    }

    // DOJ validation
    if (!empDOJ) {
      errors.empDOJ = 'Please select date of joining';
    }

    // DOB validation
    if (!empDOB) {
      errors.empDOB = 'Please select date of birth';
    } else {
      // Check if DOB is not in future
      const today = new Date();
      const dobDate = new Date(empDOB);
      if (dobDate > today) {
        errors.empDOB = 'Date of birth cannot be in future';
      }

      // Check minimum age (e.g., 18 years)
      const age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        // age--;
      }
      if (age < 18) {
        errors.empDOB = 'Employee must be at least 18 years old';
      }
    }



    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 2. Add new state for form validation
  const [formErrors, setFormErrors] = useState({
    empName: '',
    empContact: '',
    empEmail: ''
  });



  // / 4. Add new function to handle button click
  const handleAddNewEmployee = () => {
    // Reset form
    setEmpName('');
    setEmpContact('');
    setEmpEmail('');
    setEmpDOJ('');
    setEmpDOB('');
    setGroupId('');
    setSelectedStateId('');
    setSelectedDistrictId('');
    setSelectedTehsilId('');
    setSelectedCityId('');

    // Reset editing state
    setIsEditing(false);
    setEditingEmployeeId(null);

    // Clear form errors
    setFormErrors({
      empName: '',
      empContact: '',
      empEmail: ''
    });
  };

  const handleUpdate = async () => {

    if (!validateForm()) {
      showAlertMessage("Please fix the form errors before updating.", 'error');
      return;
    }

    if (password || password2) {
      if (password !== password2) {
        setFormErrors(prev => ({
          ...prev,
          password: "Passwords do not match",
          password2: "Passwords do not match",
        }));
        showAlertMessage("Passwords do not match", 'error');
        return;
      }

      if (!validatePassword(password)) {
        setFormErrors(prev => ({
          ...prev,
          password: "Weak password",
        }));
        showAlertMessage(
          "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
          'error'
        );
        return;
      }
    }


    // Create payload with only fields that have values
    const payload = {};

    if (empName) payload.emp_name = empName;
    if (groupId) payload.grp_id = groupId;
    if (empEmail) payload.emp_email = empEmail;
    if (empContact) payload.emp_contact_no = empContact;
    if (empDOJ) payload.emp_doj = formatDate(empDOJ);
    if (empDOB) payload.emp_dob = formatDate(empDOB);
    if (selectedStateId) payload.state_id = selectedStateId;
    if (selectedDistrictId) payload.dist_id = selectedDistrictId;
    if (selectedTehsilId) payload.tahsil_id = selectedTehsilId;
    if (selectedCityID) payload.city_id = selectedCityID;
    if (selectedWardId) payload.ward_id = selectedWardId;
    if (password) payload.password = password;
    if (password2) payload.password2 = password2;

    payload.emp_modified_by = userName;


    try {
      const res = await axios.put(`${port}/admin_web/employee_put/${editingEmployeeId}/`, payload, {
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
        },
      });

      console.log("Employee Updated:", res.data);

      // Show success message
      setShowUpdateAlert(true);
      setTimeout(() => setShowUpdateAlert(false), 3000);

      // Reset form and editing state
      handleCancel();

      // Refresh employee list
      await fetchEmployees();

    } catch (err) {
      console.error("Error updating employee:", err.response?.data || err.message);

      const errorMsg = err.response?.data?.detail || "Failed to update employee.";
      showAlertMessage(errorMsg, 'error');
    }

  };


  // 7. Add handleCancel function
  const handleCancel = () => {
    // Reset all form fields
    setEmpName('');
    setEmpContact('');
    setEmpEmail('');
    setEmpDOJ('');
    setEmpDOB('');
    setGroupId('');
    setPassword('');
    setPassword2('');
    setSelectedStateId('');
    setSelectedDistrictId('');
    setSelectedTehsilId('');
    setSelectedCityId('');
    setSelectedWardId(''); // Add this line

    // Reset editing state
    setIsEditing(false);
    setEditingEmployeeId(null);

    setFormErrors({
      empName: '',
      empContact: '',
      empEmail: ''
    });
  };


  // 1. Add this useEffect after your existing useEffects to handle dependent dropdowns in edit mode
  useEffect(() => {
    if (isEditing && selectedStateId) {
      // This will trigger district loading when state is selected in edit mode
      console.log("State selected in edit mode:", selectedStateId);
    }
  }, [selectedStateId, isEditing]);

  useEffect(() => {
    if (isEditing && selectedDistrictId) {
      // This will trigger tehsil loading when district is selected in edit mode
      console.log("District selected in edit mode:", selectedDistrictId);
    }
  }, [selectedDistrictId, isEditing]);

  useEffect(() => {
    if (isEditing && selectedTehsilId) {
      // This will trigger city loading when tehsil is selected in edit mode
      console.log("Tehsil selected in edit mode:", selectedTehsilId);
    }
  }, [selectedTehsilId, isEditing]);

  useEffect(() => {
    if (isEditing && selectedCityID) {
      // This will ensure city is properly selected in edit mode
      console.log("City selected in edit mode:", selectedCityID);
    }
  }, [selectedCityID, isEditing]);



  const fetchGroups = async () => {
    try {
      setLoading1(true);
      console.log("Using token:", effectiveToken);

      const response = await axios.get(`${port}/admin_web/Group_get/`, {
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
        },
      });

      console.log(" Groups fetched:", response.data);
      setGroupList(response.data);
    } catch (err) {
      console.error(" Error fetching groups:", err);
      if (err.response) {
        console.error("Server Response:", err.response.data);
      }
    } finally {
      setLoading1(false);
    }
  };

  useEffect(() => {
    if (effectiveToken) {
      fetchGroups();
    } else {
      console.warn("No token found for department fetch.");
    }
  }, [effectiveToken]);


  const filteredEmployees = employees.filter(employee =>
    employee.empName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredEmployees;
  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/.test(password);
  };

  const fetchDistrictsByState = async (stateId) => {
    setSelectedStateId(stateId);
  };

  const fetchTehsilsByDistrict = async (districtId) => {
    setSelectedDistrictId(districtId);
  };

  const fetchCitiesByTehsil = async (tehsilId) => {
    setSelectedTehsilId(tehsilId);
  };

  const fetchWardsByCity = async (cityId) => {
    setSelectedCityId(cityId);
  };

  // Password Change

  const [resetPassword, setResetPassword] = useState('');
  const [resetPassword2, setResetPassword2] = useState('');
  const [resetPasswordErrors, setResetPasswordErrors] = useState({});

  const handlePasswordReset = async () => {
    let errors = {};
    if (resetPassword !== resetPassword2) {
      errors.password = "Passwords do not match";
      errors.password2 = "Passwords do not match";
    } else if (!validatePassword(resetPassword)) {
      errors.password = "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.";
    }
    setResetPasswordErrors(errors);
    if (Object.keys(errors).length > 0) {
      showAlertMessage(Object.values(errors)[0], 'error');
      return;
    }
    try {
      await axios.post(
        `${port}/admin_web/emp_forgotpassword/`,
        {
          user_id: editingEmployeeId,
          new_password: resetPassword,
          confirm_password: resetPassword2
        },
        { headers: { Authorization: `Bearer ${effectiveToken}` } }
      );
      showAlertMessage("Password updated successfully!", "success");
      setResetPassword('');
      setResetPassword2('');
      setResetPasswordErrors({});
      setPasswordValue('');
      setIsEditing(false);
      setAddFormShow(false);
      await fetchEmployees();
    } catch (err) {
      showAlertMessage("Failed to update password.", "error");
    }
  };
  

  return (
    <div style={{ marginLeft: "4rem" }}>
      <Snackbar
        open={showAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity={alertType} // "success" or "error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>


      <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 1, mt: 2 }}>

        {/* Back Arrow */}
        {/* <IconButton size="small" sx={{
          backgroundColor: "#00f0c0",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#00d8ac",
          },
          width: 30,
          height: 30,
        }}>
          <ArrowBackIosIcon sx={{ fontSize: 20, color: darkMode ? "#fff" : "#000", }} />
        </IconButton> */}

        {/* Label */}

        <Typography
          sx={{
            color: "#5FC8EC",
            fontWeight: 600,
            fontSize: 18,
            fontFamily,
            marginLeft: "2em",
          }}
        >
          {isEditing ? "Edit Employee" : "Add Employee"}
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by Emp Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "gray", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "200px",
            ml: 5,
            "& .MuiOutlinedInput-root": {
              borderRadius: "25px",
              backgroundColor: darkMode ? "#1e293b" : "#fff",
              color: darkMode ? "#fff" : "#000",
              px: 1,
              py: 0.2,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: darkMode ? "#444" : "#ccc",
            },
            "& input": {
              color: darkMode ? "#fff" : "#000",
              padding: "6px 8px",
              fontSize: "13px",
            },
          }}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ padding: 2, borderRadius: 3, backgroundColor: paper, mt: 1, mb: 1, height: "auto" }}>
            <TableContainer >
              <Table >
                <TableHead>
                  <TableRow>
                    <EnquiryCard sx={{
                      backgroundColor: bgColor,
                      color: "#000",
                      display: "flex",
                      width: "100%",
                      borderRadius: 2,
                      position: "sticky",
                      p: 3,
                    }}>
                      <StyledCardContent
                        sx={{
                          flex: 0.9,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Sr. No
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 1.9,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">
                          Emp  Name
                        </Typography>
                      </StyledCardContent>
                      <StyledCardContent
                        sx={{
                          flex: 2.5,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">
                          Emp Contact
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 2,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">
                          Group Name
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 1.2,
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">
                          Action
                        </Typography>
                      </StyledCardContent>
                    </EnquiryCard>
                  </TableRow>
                </TableHead>

                <TableBody
                  sx={{
                    display: "block",
                    // height:"90%",
                    maxHeight: "50vh",
                    overflowY: "auto",
                    scrollBehavior: "smooth",
                    width: "100%",
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: darkMode ? "#5FC8EC" : "#888",
                      borderRadius: 3,
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      backgroundColor: darkMode ? "#5FC8EC" : "#555",
                    },
                  }}>
                  {loading1 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={30} sx={{ color: "rgb(95,200,236)" }} />
                      </TableCell>
                    </TableRow>
                  ) :
                    filteredEmployees.length === 0 ? (
                      <Box p={2}>
                        <Typography align="center" color="textSecondary">
                          {searchTerm ? "No employees found matching your search." : "No employees available."}
                        </Typography>
                      </Box>
                    ) : (
                      filteredEmployees
                        .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                        .map((item, index) => (

                          <EnquiryCardBody
                            key={index}
                            sx={{
                              backgroundColor: tableRow,
                              p: 2,
                              borderRadius: 2,
                              color: textColor,
                              display: "flex",
                              width: "100%",
                              mb: 1,
                              border:
                                item.emp_id === editSelectedRowId
                                  ? "2px solid #5FC8EC"
                                  : "1px solid transparent",

                            }}
                          >
                            <StyledCardContent
                              sx={{ flex: 0.6, justifyContent: "center" }}
                            >
                              <Typography variant="subtitle2" sx={fontsTableBody}>
                                {(page - 1) * rowsPerPage + index + 1}
                              </Typography>
                            </StyledCardContent>

                            <StyledCardContent
                              sx={{
                                flex: 2,
                                justifyContent: "center",
                                ...fontsTableBody,
                              }}
                            >
                              <Tooltip title={item.empName} arrow placement="top">
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 150, // adjust as needed
                                  }}
                                >
                                  {item.empName.length > 35 ? item.empName.slice(0, 35) + "..." : item.empName}
                                </Typography>
                              </Tooltip>

                            </StyledCardContent>
                            <StyledCardContent
                              sx={{
                                flex: 2,
                                justifyContent: "center",
                                ...fontsTableBody,
                              }}
                            >
                              <Typography variant="subtitle2">
                                {item.empContact}
                              </Typography>
                            </StyledCardContent>

                            <StyledCardContent
                              sx={{
                                flex: 2,
                                justifyContent: "center",
                                ...fontsTableBody,
                              }}
                            >
                              <Tooltip title={item.groupID} arrow placement="top">
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 150, // adjust based on layout
                                  }}
                                >
                                  {item.groupID.length > 35 ? item.groupID.slice(0, 35) + "..." : item.groupID}
                                </Typography>
                              </Tooltip>

                            </StyledCardContent>

                            <StyledCardContent
                              sx={{
                                flex: 1,
                                justifyContent: "center",
                                // ...fontsTableBody,
                              }}
                            >
                              <MoreHorizIcon
                                onClick={(e) => {
                                  console.log(item.fullData?.emp_id, 'empyyyyyy');
                                  handleOpen(e, item);
                                }}
                                sx={{
                                  color: "rgb(95,200,236)",
                                  cursor: "pointer",
                                  fontSize: 20,
                                  justifyContent: "center",
                                  // ...fontsTableBody,
                                }}
                              />
                            </StyledCardContent>
                          </EnquiryCardBody>
                        ))
                    )}

                </TableBody>
              </Table>
            </TableContainer>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
              px={1}
            >
              {/* Records Per Page */}
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ color: textColor }}>
                  Records per page:
                </Typography>
                <Select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setPage(1); // Reset to first page on limit change
                  }}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "13px",
                    color: textColor,
                    borderColor: borderColor,
                    height: "30px",
                    minWidth: "70px",
                    backgroundColor: darkMode ? "#202328" : "#FFFFFF",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: borderColor,
                    },
                    "& .MuiSvgIcon-root": { color: textColor },
                  }}
                >
                  {[5, 10, 25, 50].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Page Navigation */}
              <Box
                sx={{
                  border: "1px solid #ffffff",
                  borderRadius: "6px",
                  px: 2,
                  py: 0.5,
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: textColor,
                  fontSize: "13px",
                  backgroundColor: darkMode ? "#202328" : "#FFFFFF",
                }}
              >
                <Box
                  onClick={() => page > 1 && setPage(page - 1)}
                  sx={{
                    cursor: page > 1 ? "pointer" : "not-allowed",
                    userSelect: "none",
                  }}
                >
                  &#8249;
                </Box>
                <Box><Box>{page}/ {Math.ceil(filteredEmployees.length / rowsPerPage)}</Box></Box>
                <Box
                  onClick={() =>
                    page < Math.ceil(filteredEmployees.length / rowsPerPage) &&
                    setPage(page + 1)
                  }
                  sx={{
                    cursor:
                      page < Math.ceil(employees.length / rowsPerPage)
                        ? "pointer"
                        : "not-allowed",
                    userSelect: "none",
                  }}
                >
                  &#8250;
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "left",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          PaperProps={{
            sx: {
              p: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: 'flex-start',
              gap: 1,
              borderRadius: 2,
              minWidth: 120,
            },
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            color="error"
            sx={{ justifyContent: "flex-start" }}
            startIcon={<DeleteOutline />}
            onClick={async () => {
              if (selectedEmployee && selectedEmployee.fullData) {
                try {
                  await axios.delete(`${port}/admin_web/employee_delete/${selectedEmployee.fullData.emp_id}/`, {
                    headers: {
                      Authorization: `Bearer ${effectiveToken}`,
                    },
                  });

                  // Show success message
                  setShowDeleteAlert(true);
                  setTimeout(() => setShowDeleteAlert(false), 3000);

                  // Refresh employee list
                  await fetchEmployees();
                } catch (error) {
                  console.error("Error deleting employee:", error);
                  alert("Failed to delete employee");
                }
              }
              setPasswordValue('');
              handleClose();
            }}
          >
            Delete
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="warning"
            sx={{ justifyContent: "flex-start" }}
            startIcon={<EditOutlined />}
            onClick={async () => {
              if (selectedEmployee && selectedEmployee.fullData) {
                const empData = selectedEmployee.fullData;

                // Basic field values
                setEmpName(empData.emp_name);
                setEmpContact(empData.emp_contact_no);
                setEmpEmail(empData.emp_email);
                setEmpDOJ(empData.emp_doj);
                setEmpDOB(empData.emp_dob);
                setGroupId(empData.grp_id);

                // Keep existing passwords if they exist, don't reset to empty
                setPassword(empData.password || '');
                setPassword2(empData.password2 || '');

                // Set editing flags
                setIsEditing(true);
                setEditingEmployeeId(empData.emp_id );
                setEditSelectedRowId(empData.emp_id);

                // Set location data directly - make sure the context has this data loaded
                if (empData.state_id) {
                  setSelectedStateId(empData.state_id);
                }
                if (empData.dist_id) {
                  setSelectedDistrictId(empData.dist_id);
                }
                if (empData.tahsil_id) {
                  setSelectedTehsilId(empData.tahsil_id);
                }
                if (empData.city_id) {
                  setSelectedCityId(empData.city_id);
                }
                if (empData.ward_id) {
                  setSelectedWardId(empData.ward_id);
                }
                setPasswordValue('');
                handleClose();
              }
            }}

          >
            Edit
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<KeyIcon />}
            sx={{
              justifyContent: "flex-start",
              borderColor: "#1976d2",
              color: "#1976d2",
              '&:hover': {
                borderColor: "#1565c0",
                color: "#1565c0",
                backgroundColor: "rgba(25, 118, 210, 0.04)"
              }
            }}
            onClick={() => {
              setPasswordValue('1');
              setIsEditing(true);
              setAddFormShow(false);
              if (selectedEmployee && selectedEmployee.fullData?.emp_id) {
                setEditingEmployeeId(selectedEmployee.fullData.emp_id);
              }
            }}
          >
            Password
          </Button>
        </Popover>

        <Grid item xs={12} md={4.9}>
          <Paper elevation={3} sx={{ padding: 2, borderRadius: 3, backgroundColor: paper, mt: 1, mb: 5.9 }}>
            <Box
              display="flex"
              justifyContent={{ xs: "center", md: "flex-end" }}
              alignItems="center"
              mb={2}
              flexWrap="wrap"
            >
              <Button
                variant="contained"
                startIcon={<AddCircleOutline />}
                disabled={!isEditing}
                // onClick={handleAddNewEmployee}
                onClick={() => {
                  handleAddNewEmployee();
                  setAddFormShow(true);
                }}
                sx={{
                  backgroundColor: "rgb(223,76,76)",
                  color: "#fff",
                  fontWeight: 600,
                  fontFamily: "Roboto",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgb(223,76,76)",
                  },
                }}
              >
                Add New Employee
              </Button>
            </Box>

            {
              passwordValue === '1' && addFormShow === false ?
                (
                  <>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="password"
                          value={resetPassword}
                          onChange={(e) => {
                            setResetPassword(e.target.value);
                            if (resetPasswordErrors.password) {
                              setResetPasswordErrors(prev => ({ ...prev, password: '' }));
                            }
                          }}
                          placeholder="Password"
                          error={!!resetPasswordErrors.password}
                          // helperText={resetPasswordErrors.password}
                          InputLabelProps={{ shrink: false }}
                          sx={inputStyle}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="password"
                          value={resetPassword2}
                          onChange={(e) => {
                            setResetPassword2(e.target.value);
                            if (resetPasswordErrors.password2) {
                              setResetPasswordErrors(prev => ({ ...prev, password2: '' }));
                            }
                          }}
                          placeholder="Confirm Password"
                          error={!!resetPasswordErrors.password2}
                          helperText={resetPasswordErrors.password2}
                          InputLabelProps={{ shrink: false }}
                          sx={inputStyle}
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, mb: 1 }}>
                      <Button
                        variant="contained"
                        disabled={loading}
                        sx={{
                          mt: 1,
                          width: "40%",
                          backgroundColor: "rgb(18,166,95,0.8)",
                          color: "#fff",
                          fontWeight: "bold",
                          borderRadius: "12px",
                          textTransform: 'none',
                          "&:hover": {
                            backgroundColor: "rgb(18,166,95,0.8)",
                            color: "white !important",
                            textTransform: 'none',
                          },
                        }}
                        onClick={handlePasswordReset}
                      >
                        Set Password
                      </Button>
                    </Box>
                  </>
                )
                :
                (
                  <>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {/* Employee Name Field */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          value={empName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEmpName(value);
                            if (formErrors.empName) {
                              setFormErrors(prev => ({ ...prev, empName: '' }));
                            }
                          }}
                          placeholder="Employee Name"
                          error={!!formErrors.empName}
                          helperText={formErrors.empName}
                          InputLabelProps={{ shrink: false }}
                          sx={inputStyle}
                        />
                      </Grid>

                      {/* Employee Contact Number Field */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          placeholder="Emp Contact No"
                          value={empContact}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^[0-9]*$/.test(value) && value.length <= 10) {
                              setEmpContact(value);
                              if (formErrors.empContact) {
                                setFormErrors(prev => ({ ...prev, empContact: '' }));
                              }
                            }
                          }}
                          error={!!formErrors.empContact}
                          helperText={formErrors.empContact}
                          InputLabelProps={{ shrink: false }}
                          sx={inputStyle}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      {/* First TextField */}
                      <TextField
                        fullWidth
                        placeholder="Employee Email"
                        value={empEmail}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEmpEmail(value);
                          if (formErrors.empEmail) {
                            setFormErrors(prev => ({ ...prev, empEmail: '' }));
                          }
                        }}
                        error={!!formErrors.empEmail}
                        helperText={formErrors.empEmail}
                        sx={inputStyle}
                      />

                      {/* Second TextField */}

                      <TextField
                        fullWidth
                        type="date"
                        value={empDOJ}
                        onChange={(e) => {
                          setEmpDOJ(e.target.value);
                          if (formErrors.empDOJ) {
                            setFormErrors(prev => ({ ...prev, empDOJ: '' }));
                          }
                        }}
                        error={!!formErrors.empDOJ}
                        helperText={formErrors.empDOJ}
                        sx={{
                          ...selectStyles,
                          "& input[type='date']::-webkit-calendar-picker-indicator": {
                            opacity: 0,
                            cursor: "pointer"
                          },
                          "& input[type='date']": {
                            color: empDOJ ? (darkMode ? "#9e9e9e" : "#000") : "transparent",
                            fontSize: "13px",
                          },
                          "& input[type='date']:focus": {
                            color: darkMode ? "#000" : "#000",
                          },
                          "& input[type='date']:before": {
                            content: empDOJ ? '""' : '"Employee DOJ"',
                            color: "#9e9e9e",
                            position: "absolute",
                            fontSize: "13px",
                          }
                        }}
                        InputProps={{
                          placeholder: "Employee DOJ"
                        }}
                        onFocus={(e) => {
                          e.target.showPicker();
                        }}
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {/* Group Select */}
                      <Grid item xs={12} sm={6}>
                        <Select
                          value={groupId}
                          onChange={(e) => {
                            setGroupId(e.target.value);
                            if (formErrors.groupId) {
                              setFormErrors((prev) => ({ ...prev, groupId: '' }));
                            }
                          }}
                          fullWidth
                          displayEmpty
                          placeholder="Select Group"
                          defaultValue=""
                          error={!!formErrors.groupId}
                          inputProps={{
                            "aria-label": "Select Group",
                          }}
                          sx={{
                            ...selectStyles,
                            ...(formErrors.groupId && {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#d32f2f',
                              },
                            }),
                          }}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="" disabled sx={inputStyle}>
                            Group Name
                          </MenuItem>
                          {groupList.map((group) => (
                            <MenuItem key={group.grp_id} value={group.grp_id.toString()}>
                              {group.grp_name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.groupId && (
                          <Typography variant="caption" color="error" sx={{ ml: 1, fontSize: '0.75rem' }}>
                            {formErrors.groupId}
                          </Typography>
                        )}
                      </Grid>

                      {/* State Select */}
                      <Grid item xs={12} sm={6}>
                        <Select
                          value={selectedStateId}
                          onChange={(e) => {
                            handleStateChange(e);
                            if (formErrors.selectedStateId) {
                              setFormErrors((prev) => ({ ...prev, selectedStateId: '' }));
                            }
                          }}
                          fullWidth
                          displayEmpty
                          placeholder="Select State"
                          defaultValue=""
                          error={!!formErrors.selectedStateId}
                          inputProps={{
                            "aria-label": "Select State",
                          }}
                          sx={{
                            ...selectStyles,
                            ...(formErrors.selectedStateId && {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#d32f2f',
                              },
                            }),
                          }}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="" disabled sx={inputStyle}>
                            Select State
                          </MenuItem>
                          {states.map((state) => (
                            <MenuItem key={state.state_id} value={state.state_id}>
                              {state.state_name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.selectedStateId && (
                          <Typography variant="caption" color="error" sx={{ ml: 1, fontSize: '0.75rem' }}>
                            {formErrors.selectedStateId}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {/* District Select */}
                      <Grid item xs={12} sm={6}>
                        <Select
                          fullWidth
                          displayEmpty
                          placeholder="Select District"
                          defaultValue=""
                          value={selectedDistrictId}
                          onChange={(e) => {
                            handleDistrictChange(e);
                            if (formErrors.selectedDistrictId) {
                              setFormErrors(prev => ({ ...prev, selectedDistrictId: '' }));
                            }
                          }}
                          error={!!formErrors.selectedDistrictId}
                          inputProps={{ "aria-label": "Select District" }}
                          sx={{
                            ...selectStyles,
                            ...(formErrors.selectedDistrictId && {
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d32f2f' }
                            })
                          }}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="" disabled>Select District</MenuItem>
                          {districts.map((district) => (
                            <MenuItem key={district.dis_id} value={district.dis_id}>
                              {district.dis_name}
                            </MenuItem>
                          ))}
                        </Select>

                        {formErrors.selectedDistrictId && (
                          <Typography variant="caption" color="error" sx={{ ml: 1, fontSize: '0.75rem' }}>
                            {formErrors.selectedDistrictId}
                          </Typography>
                        )}
                      </Grid>

                      {/* Tehsil Select */}
                      <Grid item xs={12} sm={6}>
                        <Select
                          fullWidth
                          displayEmpty
                          placeholder="Select Tehsil"
                          defaultValue=""
                          value={selectedTehsilId}
                          onChange={(e) => {
                            handleTehsilChange(e);
                            if (formErrors.selectedTehsilId) {
                              setFormErrors(prev => ({ ...prev, selectedTehsilId: '' }));
                            }
                          }}
                          error={!!formErrors.selectedTehsilId}
                          inputProps={{ "aria-label": "Select Tehsil" }}
                          sx={{
                            ...selectStyles,
                            ...(formErrors.selectedTehsilId && {
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d32f2f' }
                            })
                          }}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="" disabled>Select Tehsil</MenuItem>
                          {Tehsils.map((tehsil) => (
                            <MenuItem key={tehsil.tah_id} value={tehsil.tah_id}>
                              {tehsil.tah_name}
                            </MenuItem>
                          ))}
                        </Select>

                        {formErrors.selectedTehsilId && (
                          <Typography variant="caption" color="error" sx={{ ml: 1, fontSize: '0.75rem' }}>
                            {formErrors.selectedTehsilId}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {/* City Select */}
                      <Grid item xs={12} sm={6}>
                        <Select
                          fullWidth
                          displayEmpty
                          value={selectedCityID}
                          onChange={(e) => {
                            handleCityChange(e);
                            if (formErrors.selectedCityID) {
                              setFormErrors(prev => ({ ...prev, selectedCityID: '' }));
                            }
                          }}
                          placeholder="Select City"
                          defaultValue=""
                          error={!!formErrors.selectedCityID}
                          inputProps={{
                            "aria-label": "Select City",
                          }}
                          sx={{
                            ...selectStyles,
                            ...(formErrors.selectedCityID && {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#d32f2f',
                              }
                            })
                          }}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="" disabled>
                            Select City
                          </MenuItem>
                          {Citys.map((city) => (
                            <MenuItem key={city.cit_id} value={city.cit_id}>
                              {city.cit_name}
                            </MenuItem>
                          ))}
                        </Select>

                        {formErrors.selectedCityID && (
                          <Typography variant="caption" color="error" sx={{ ml: 1, fontSize: '0.75rem' }}>
                            {formErrors.selectedCityID}
                          </Typography>
                        )}
                      </Grid>

                      {/* Ward Select  */}

                      <Grid item xs={12} sm={6}>
                        <Select
                          fullWidth
                          displayEmpty
                          value={selectedWardId}
                          onChange={handleWardChange}
                          placeholder="Select Ward"
                          defaultValue=""
                          error={!!formErrors.selectedWardId}
                          helperText={formErrors.empName}
                          inputProps={{
                            "aria-label": "Select Ward",
                          }}
                          sx={{
                            ...selectStyles,
                            ...(formErrors.selectedWardId && {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#d32f2f',
                              }
                            })
                          }}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="" disabled>
                            Select Ward
                          </MenuItem>
                          {Wards.map((ward) => (
                            <MenuItem key={ward.pk_id} value={ward.pk_id}>
                              {ward.ward_name}
                            </MenuItem>
                          ))}
                        </Select>

                        {formErrors.selectedWardId && (
                          <Typography variant="caption" color="error" sx={{ ml: 1, fontSize: '0.75rem' }}>
                            {formErrors.selectedWardId}
                          </Typography>
                        )}
                      </Grid>


                      {/* DOB TextField */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          value={empDOB}
                          onChange={(e) => {
                            setEmpDOB(e.target.value);
                            if (formErrors.empDOB) {
                              setFormErrors(prev => ({ ...prev, empDOB: '' }));
                            }
                          }}
                          error={!!formErrors.empDOB}
                          helperText={formErrors.empDOB}
                          sx={{
                            ...selectStyles,
                            "& input[type='date']::-webkit-calendar-picker-indicator": {
                              opacity: 0,
                              cursor: "pointer"
                            },
                            "& input[type='date']": {
                              color: empDOB ? (darkMode ? "#9e9e9e" : "#000") : "transparent",
                              fontSize: "13px",
                            },
                            "& input[type='date']:focus": {
                              color: darkMode ? "#000" : "#000",
                            },
                            "& input[type='date']:before": {
                              content: empDOB ? '""' : '"Employee DOB"',
                              color: "#9e9e9e",
                              position: "absolute",
                              fontSize: "13px",
                            }
                          }}
                          InputProps={{
                            placeholder: "Employee DOB"
                          }}
                          onFocus={(e) => {
                            e.target.showPicker();
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                        {isEditing ? (
                          <>
                            <Button
                              variant="contained"
                              onClick={handleUpdate}
                              disabled={loading}
                              sx={{
                                mt: 2,
                                width: "40%",
                                backgroundColor: "rgb(18,166,95,0.8)",
                                color: "#fff",
                                fontWeight: "bold",
                                borderRadius: "12px",
                                "&:hover": {
                                  backgroundColor: "rgb(18,166,95,0.8)",
                                  color: "white !important",
                                },
                              }}
                            >
                              Update
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{
                              mt: 1,
                              width: "40%",
                              backgroundColor: "rgb(18,166,95,0.8)",
                              color: "#fff",
                              fontWeight: "bold",
                              borderRadius: "12px",
                              textTransform: 'none',
                              "&:hover": {
                                backgroundColor: "rgb(18,166,95,0.8)",
                                color: "white !important",
                                textTransform: 'none',
                              },
                            }}
                          >
                            Submit
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </>
                )
            }
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default Add_employee
