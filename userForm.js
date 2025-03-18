import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const UserForm = () => {
    const navigate = useNavigate();
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dob: '',
        mobile: '',
        residentialAddress: {
            street1: '',
            street2: '',
            city: '',
            state: '',
            pincode: ''
        },
        sameAsResidential: false,
        permanentAddress: {
            street1: '',
            street2: '',
            city: '',
            state: '',
            pincode: ''
        },
        documents: []
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Handle checkbox for same address
    const handleSameAddressChange = (e) => {
        setFormData({
            ...formData,
            sameAsResidential: e.target.checked,
            permanentAddress: e.target.checked ? { ...formData.residentialAddress } : {
                street1: '',
                street2: '',
                city: '',
                state: '',
                pincode: ''
            }
        });
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const fileType = e.target.dataset.filetype;

        if (!file) return;

        // Validate file type
        if (fileType === 'image' && !file.type.startsWith('image/')) {
            setFormErrors({
                ...formErrors,
                fileTypeError: 'Please select a valid image file'
            });
            return;
        }

        if (fileType === 'pdf' && file.type !== 'application/pdf') {
            setFormErrors({
                ...formErrors,
                fileTypeError: 'Please select a valid PDF file'
            });
            return;
        }

        // Clear any previous errors
        setFormErrors({
            ...formErrors,
            fileTypeError: null
        });

        // Convert file to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const newDocument = {
                fileName: file.name,
                fileType: fileType,
                fileData: reader.result
            };

            setFormData({
                ...formData,
                documents: [...formData.documents, newDocument]
            });
        };
    };

    // Remove a document
    const removeDocument = (index) => {
        const updatedDocuments = [...formData.documents];
        updatedDocuments.splice(index, 1);
        setFormData({
            ...formData,
            documents: updatedDocuments
        });
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        // Required fields
        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
        if (!formData.dob) errors.dob = 'Date of birth is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Mobile validation
        const mobileRegex = /^\d{10}$/;
        if (formData.mobile && !mobileRegex.test(formData.mobile)) {
            errors.mobile = 'Please enter a valid 10-digit mobile number';
        }

        // Age validation (18+)
        if (formData.dob) {
            const today = new Date();
            const birthDate = new Date(formData.dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                errors.dob = 'You must be at least 18 years old';
            }
        }

        // Residential address validation
        if (!formData.residentialAddress.street1.trim()) {
            errors.residentialStreet1 = 'Street 1 is required';
        }
        if (!formData.residentialAddress.city.trim()) {
            errors.residentialCity = 'City is required';
        }
        if (!formData.residentialAddress.state.trim()) {
            errors.residentialState = 'State is required';
        }
        if (!formData.residentialAddress.pincode.trim()) {
            errors.residentialPincode = 'Pincode is required';
        }

        // Permanent address validation (only if not same as residential)
        if (!formData.sameAsResidential) {
            if (!formData.permanentAddress.street1.trim()) {
                errors.permanentStreet1 = 'Street 1 is required';
            }
            if (!formData.permanentAddress.city.trim()) {
                errors.permanentCity = 'City is required';
            }
            if (!formData.permanentAddress.state.trim()) {
                errors.permanentState = 'State is required';
            }
            if (!formData.permanentAddress.pincode.trim()) {
                errors.permanentPincode = 'Pincode is required';
            }
        }

        // Document validation (minimum 2)
        if (formData.documents.length < 2) {
            errors.documents = 'At least two documents are required';
        }

        return errors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const errors = validateForm();
        setFormErrors(errors);

        // If there are errors, don't submit
        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:5000/api/users', formData);
            setIsSubmitting(false);
            navigate(`/success/${response.data.userId}`);
        } catch (error) {
            setIsSubmitting(false);

            if (error.response && error.response.data.errors) {
                setFormErrors({
                    ...formErrors,
                    serverErrors: error.response.data.errors
                });
            } else {
                setFormErrors({
                    ...formErrors,
                    serverError: 'Something went wrong. Please try again.'
                });
            }
        }
    };

    return (
        <div className="form-container">
            <h1>User Information Form</h1>

            {formErrors.serverError && (
                <div className="error-message">{formErrors.serverError}</div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Personal Details */}
                <div className="form-section">
                    <h2>Personal Details</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={formErrors.firstName ? 'error' : ''}
                            />
                            {formErrors.firstName && (
                                <span className="error-text">{formErrors.firstName}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={formErrors.lastName ? 'error' : ''}
                            />
                            {formErrors.lastName && (
                                <span className="error-text">{formErrors.lastName}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={formErrors.email ? 'error' : ''}
                            />
                            {formErrors.email && (
                                <span className="error-text">{formErrors.email}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobile">Mobile Number *</label>
                            <input
                                type="text"
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className={formErrors.mobile ? 'error' : ''}
                            />
                            {formErrors.mobile && (
                                <span className="error-text">{formErrors.mobile}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dob">Date of Birth * (Must be 18+)</label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className={formErrors.dob ? 'error' : ''}
                            />
                            {formErrors.dob && (
                                <span className="error-text">{formErrors.dob}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Residential Address */}
                <div className="form-section">
                    <h2>Residential Address</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="residentialAddress.street1">Street 1 *</label>
                            <input
                                type="text"
                                id="residentialAddress.street1"
                                name="residentialAddress.street1"
                                value={formData.residentialAddress.street1}
                                onChange={handleChange}
                                className={formErrors.residentialStreet1 ? 'error' : ''}
                            />
                            {formErrors.residentialStreet1 && (
                                <span className="error-text">{formErrors.residentialStreet1}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="residentialAddress.street2">Street 2</label>
                            <input
                                type="text"
                                id="residentialAddress.street2"
                                name="residentialAddress.street2"
                                value={formData.residentialAddress.street2}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="residentialAddress.city">City *</label>
                            <input
                                type="text"
                                id="residentialAddress.city"
                                name="residentialAddress.city"
                                value={formData.residentialAddress.city}
                                onChange={handleChange}
                                className={formErrors.residentialCity ? 'error' : ''}
                            />
                            {formErrors.residentialCity && (
                                <span className="error-text">{formErrors.residentialCity}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="residentialAddress.state">State *</label>
                            <input
                                type="text"
                                id="residentialAddress.state"
                                name="residentialAddress.state"
                                value={formData.residentialAddress.state}
                                onChange={handleChange}
                                className={formErrors.residentialState ? 'error' : ''}
                            />
                            {formErrors.residentialState && (
                                <span className="error-text">{formErrors.residentialState}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="residentialAddress.pincode">Pincode *</label>
                            <input
                                type="text"
                                id="residentialAddress.pincode"
                                name="residentialAddress.pincode"
                                value={formData.residentialAddress.pincode}
                                onChange={handleChange}
                                className={formErrors.residentialPincode ? 'error' : ''}
                            />
                            {formErrors.residentialPincode && (
                                <span className="error-text">{formErrors.residentialPincode}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Permanent Address */}
                <div className="form-section">
                    <h2>Permanent Address</h2>

                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <input
                                type="checkbox"
                                id="sameAsResidential"
                                name="sameAsResidential"
                                checked={formData.sameAsResidential}
                                onChange={handleSameAddressChange}
                            />
                            <label htmlFor="sameAsResidential">Same as Residential</label>
                        </div>
                    </div>

                    {!formData.sameAsResidential && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="permanentAddress.street1">Street 1 *</label>
                                    <input
                                        type="text"
                                        id="permanentAddress.street1"
                                        name="permanentAddress.street1"
                                        value={formData.permanentAddress.street1}
                                        onChange={handleChange}
                                        className={formErrors.permanentStreet1 ? 'error' : ''}
                                    />
                                    {formErrors.permanentStreet1 && (
                                        <span className="error-text">{formErrors.permanentStreet1}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="permanentAddress.street2">Street 2</label>
                                    <input
                                        type="text"
                                        id="permanentAddress.street2"
                                        name="permanentAddress.street2"
                                        value={formData.permanentAddress.street2}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="permanentAddress.city">City *</label>
                                    <input
                                        type="text"
                                        id="permanentAddress.city"
                                        name="permanentAddress.city"
                                        value={formData.permanentAddress.city}
                                        onChange={handleChange}
                                        className={formErrors.permanentCity ? 'error' : ''}
                                    />
                                    {formErrors.permanentCity && (
                                        <span className="error-text">{formErrors.permanentCity}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="permanentAddress.state">State *</label>
                                    <input
                                        type="text"
                                        id="permanentAddress.state"
                                        name="permanentAddress.state"
                                        value={formData.permanentAddress.state}
                                        onChange={handleChange}
                                        className={formErrors.permanentState ? 'error' : ''}
                                    />
                                    {formErrors.permanentState && (
                                        <span className="error-text">{formErrors.permanentState}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="permanentAddress.pincode">Pincode *</label>
                                    <input
                                        type="text"
                                        id="permanentAddress.pincode"
                                        name="permanentAddress.pincode"
                                        value={formData.permanentAddress.pincode}
                                        onChange={handleChange}
                                        className={formErrors.permanentPincode ? 'error' : ''}
                                    />
                                    {formErrors.permanentPincode && (
                                        <span className="error-text">{formErrors.permanentPincode}</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Document Upload */}
                <div className="form-section">
                    <h2>Document Upload * (Minimum 2 documents required)</h2>

                    {formErrors.documents && (
                        <div className="error-message">{formErrors.documents}</div>
                    )}

                    {formErrors.fileTypeError && (
                        <div className="error-message">{formErrors.fileTypeError}</div>
                    )}

                    <div className="form-row document-upload">
                        <div className="form-group">
                            <label>Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                data-filetype="image"
                                onChange={handleFileUpload}
                            />
                        </div>

                        <div className="form-group">
                            <label>Upload PDF</label>
                            <input
                                type="file"
                                accept=".pdf"
                                data-filetype="pdf"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    {formData.documents.length > 0 && (
                        <div className="uploaded-documents">
                            <h3>Uploaded Documents ({formData.documents.length})</h3>
                            <ul>
                                {formData.documents.map((doc, index) => (
                                    <li key={index}>
                                        <span>{doc.fileName} ({doc.fileType})</span>
                                        <button
                                            type="button"
                                            onClick={() => removeDocument(index)}
                                            className="remove-btn"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;