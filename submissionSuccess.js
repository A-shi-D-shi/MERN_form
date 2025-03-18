import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const SubmissionSuccess = () => {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/users/${id}`);
                setUserData(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch user data');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="success-container">
            <div className="success-header">
                <h1>Submission Successful!</h1>
                <p>Your information has been successfully submitted.</p>
            </div>

            {userData && (
                <div className="user-details">
                    <h2>Submitted Information</h2>

                    <div className="detail-section">
                        <h3>Personal Details</h3>
                        <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <p><strong>Mobile:</strong> {userData.mobile}</p>
                        <p><strong>Date of Birth:</strong> {new Date(userData.dob).toLocaleDateString()}</p>
                    </div>

                    <div className="detail-section">
                        <h3>Residential Address</h3>
                        <p>{userData.residentialAddress.street1}</p>
                        {userData.residentialAddress.street2 && (
                            <p>{userData.residentialAddress.street2}</p>
                        )}
                        <p>
                            {userData.residentialAddress.city},
                            {userData.residentialAddress.state} -
                            {userData.residentialAddress.pincode}
                        </p>
                    </div>

                    <div className="detail-section">
                        <h3>Permanent Address</h3>
                        {userData.sameAsResidential ? (
                            <p>Same as Residential Address</p>
                        ) : (
                            <>
                                <p>{userData.permanentAddress.street1}</p>
                                {userData.permanentAddress.street2 && (
                                    <p>{userData.permanentAddress.street2}</p>
                                )}
                                <p>
                                    {userData.permanentAddress.city},
                                    {userData.permanentAddress.state} -
                                    {userData.permanentAddress.pincode}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>Uploaded Documents</h3>
                        <p>Number of documents: {userData.documents.length}</p>
                        <ul className="document-list">
                            {userData.documents.map((doc, index) => (
                                <li key={index}>
                                    {doc.fileName} ({doc.fileType})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="actions">
                <Link to="/" className="button">Submit New Form</Link>
            </div>
        </div>
    );
};

export default SubmissionSuccess;