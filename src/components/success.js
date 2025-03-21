import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted Successfully!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for submitting your application. We have received your information and will review it shortly.
                </p>
                <p className="text-gray-600 mb-6">
                    You will receive a confirmation email with further details.
                </p>
                <Link 
                    to="/"
                    className="inline-block bg-blue-500 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-600 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
};

export default SuccessPage;