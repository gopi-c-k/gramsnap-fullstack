import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Modal, Backdrop, IconButton, useTheme, CircularProgress } from '@mui/material';
import Cropper from "react-cropper";
import axios from "axios";
import "cropperjs/dist/cropper.css";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CloseIcon from '@mui/icons-material/Close';

const AddStory = ({ open, setOpen, prefersDarkMode }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const { userId, name, email, profilePicture } = userInfo;
    const [image, setImage] = useState(null);
    const [cropData, setCropData] = useState(null);
    const cropperRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    // Close Modal
    const handleClose = () => {
        setOpen(false);
        setImage(null);
        setCropData(null);
    };

    // Handle File Upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Crop Image
    const cropImage = () => {
        if (cropperRef.current) {
            const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
            setCropData(croppedCanvas.toDataURL());
        }
    };

    const handleStoryUpload = async () => {
        setLoading(true);

        if (!cropData) {
            alert("Please crop the image before uploading!");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("userId", userId); // Convert userId to a string
        console.log("Upload function called, userId:", userId);

        try {
            // Convert base64 image to Blob and append it as 'image'
            const blob = await fetch(cropData).then(res => res.blob());
            const file = new File([blob], "story-image.png", { type: "image/png" });
            formData.append("image", file);

            const response = await axios.post(
                "https://gramsnap-backend-bj65.onrender.com/story/create",
                formData, { withCredentials: true }, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 201) {
                alert("Story created successfully!");
                handleClose(); // Close modal on success
            } else {
                console.error("Unexpected response:", response);
            }
        } catch (error) {
            console.error("Error Uploading Story:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to upload story.");
        } finally {
            setLoading(false);
            setCropData(null);
        }
    };



    return (
        <Modal open={open} onClose={handleClose}>
            <Backdrop open={open} sx={{ zIndex: 1300, backgroundColor: prefersDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.6)" }}>
                <Box sx={{
                    width: 400,
                    backgroundColor: prefersDarkMode ? "#222" : "#fff",
                    color: prefersDarkMode ? "#fff" : "#000",
                    borderRadius: "16px",
                    padding: "20px",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: prefersDarkMode
                        ? "0px 10px 20px rgba(255, 255, 255, 0.1)"
                        : "0px 10px 20px rgba(0, 0, 0, 0.2)"
                }}>
                    {/* X Close Button (Top Left) */}
                    <IconButton onClick={handleClose} sx={{ position: "absolute", top: 10, left: 10, color: prefersDarkMode ? "#fff" : "#444" }}>
                        <CloseIcon sx={{ fontSize: 30 }} />
                    </IconButton>

                    {/* Choose Image */}
                    {!image && (
                        <>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Choose a Photo</Typography>
                            <AddAPhotoIcon sx={{ fontSize: "100px", color: prefersDarkMode ? "#bbb" : "#777", margin: "20px 0" }} />
                            <input
                                accept="image/*"
                                style={{ display: "none" }}
                                id="upload-photo"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="upload-photo">
                                <Button
                                    variant="contained"
                                    component="span"
                                    sx={{
                                        marginTop: 2,
                                        backgroundColor: prefersDarkMode ? "#444" : "#1976D2",
                                        color: "#fff",
                                        "&:hover": { backgroundColor: prefersDarkMode ? "#555" : "#155A9D" }
                                    }}
                                >
                                    Select from Device
                                </Button>
                            </label>
                        </>
                    )}

                    {/* Image Cropper */}
                    {image && !cropData && (
                        <>
                            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>Crop Image</Typography>
                            <Cropper
                                src={image}
                                style={{ height: 300, width: "100%", borderRadius: "8px" }}
                                aspectRatio={NaN} // 🔹 Free Crop Mode
                                viewMode={1}
                                guides={true}
                                ref={cropperRef}
                                background={false}
                                autoCropArea={1}
                            />
                            <Button
                                variant="contained"
                                onClick={cropImage}
                                sx={{
                                    marginTop: 2,
                                    backgroundColor: prefersDarkMode ? "#444" : "#1976D2",
                                    color: "#fff",
                                    "&:hover": { backgroundColor: prefersDarkMode ? "#555" : "#155A9D" }
                                }}
                            >
                                Crop & Proceed
                            </Button>
                        </>
                    )}

                    {/* Show Cropped Image & Upload */}
                    {cropData && (
                        <>
                            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>Final Image</Typography>
                            <Backdrop sx={{ color: "#fff", zIndex: 1300 }} open={loading}>
                                <CircularProgress color="inherit" />
                            </Backdrop>
                            <img
                                src={cropData}
                                alt="Cropped"
                                style={{
                                    maxWidth: "100%",
                                    borderRadius: "12px",
                                    boxShadow: prefersDarkMode
                                        ? "0px 5px 15px rgba(255, 255, 255, 0.1)"
                                        : "0px 5px 15px rgba(0, 0, 0, 0.2)"
                                }}
                            />
                            <Button
                                variant="contained"
                                sx={{
                                    marginTop: 2,
                                    backgroundColor: prefersDarkMode ? "#444" : "#1976D2",
                                    color: "#fff",
                                    "&:hover": { backgroundColor: prefersDarkMode ? "#555" : "#155A9D" }
                                }}
                                onClick={handleStoryUpload}
                            >
                                Upload
                            </Button>
                        </>
                    )}
                </Box>
            </Backdrop>
        </Modal>
    );
};

export default AddStory;
