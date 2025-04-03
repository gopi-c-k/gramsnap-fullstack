import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Modal, Backdrop, IconButton } from '@mui/material';
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CloseIcon from '@mui/icons-material/Close';

const AddStory = () => {
    const [open, setOpen] = useState(false);  // State to open/close modal
    const [image, setImage] = useState(null);
    const [cropData, setCropData] = useState(null);
    const cropperRef = useRef(null);

    // Open Modal
    const handleOpen = () => setOpen(true);
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
            setCropData(croppedCanvas.toDataURL());  // Convert to base64
        }
    };

    return (
        <>
            {/* Parent UI: Add Story Button */}
            <Box
                onClick={handleOpen}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: "#f0f0f0",
                    color: "#000",
                    transition: "background 0.3s",
                    "&:hover": { backgroundColor: "#e0e0e0" },
                }}
            >
                <AddAPhotoIcon />
                <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: "bold" }}>Add Story</Typography>
            </Box>

            {/* Modal for Upload UI */}
            <Modal open={open} onClose={handleClose}>
                <Backdrop open={open} sx={{ zIndex: 1300 }}>
                    <Box sx={{
                        width: 400, 
                        backgroundColor: "#fff", 
                        borderRadius: "12px",
                        padding: "20px",
                        textAlign: "center",
                        position: "relative"
                    }}>
                        {/* Close (X) Button */}
                        <IconButton onClick={handleClose} sx={{ position: "absolute", top: 10, left: 10 }}>
                            <CloseIcon />
                        </IconButton>

                        {/* Choose Image */}
                        {!image && (
                            <>
                                <Typography variant="h6">Choose a Photo</Typography>
                                <AddAPhotoIcon sx={{ fontSize: "100px", color: "#777" }} />
                                <input
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    id="upload-photo"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="upload-photo">
                                    <Button variant="contained" component="span" sx={{ marginTop: 2 }}>
                                        Select from device
                                    </Button>
                                </label>
                            </>
                        )}

                        {/* Image Cropper */}
                        {image && !cropData && (
                            <>
                                <Typography variant="h6" sx={{ marginBottom: 2 }}>Crop Image</Typography>
                                <Cropper
                                    src={image}
                                    style={{ height: 300, width: "100%" }}
                                    aspectRatio={1}
                                    viewMode={1}
                                    guides={false}
                                    ref={cropperRef}
                                    background={false}
                                    autoCropArea={1}
                                />
                                <Button variant="contained" onClick={cropImage} sx={{ marginTop: 2 }}>
                                    Crop & Proceed
                                </Button>
                            </>
                        )}

                        {/* Show Cropped Image & Upload */}
                        {cropData && (
                            <>
                                <Typography variant="h6" sx={{ marginBottom: 2 }}>Final Image</Typography>
                                <img src={cropData} alt="Cropped" style={{ maxWidth: "100%", borderRadius: "12px" }} />
                                <Button variant="contained" sx={{ marginTop: 2 }} onClick={handleClose}>
                                    Upload
                                </Button>
                            </>
                        )}
                    </Box>
                </Backdrop>
            </Modal>
        </>
    );
};

export default AddStory;
