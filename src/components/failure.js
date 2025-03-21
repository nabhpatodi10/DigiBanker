import React from 'react';
import { Link } from 'react-router-dom';

const Failure = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <div className="text-center text-red-500 mb-4">
                    <i className="fas fa-times-circle text-6xl"></i>
                </div>
                <h1 className="text-2xl font-bold text-center mb-4">Application Submission Failed</h1>
                <p className="text-gray-700 mb-2">We're sorry, but there was an error processing your loan application.</p>
                <p className="text-gray-700 mb-2">This could be due to:</p>
                <ul className="list-disc pl-6 mb-6 text-gray-700">
                    <li className="mb-1">Network connectivity issues</li>
                    <li className="mb-1">Missing or invalid information</li>
                    <li className="mb-1">System temporary unavailability</li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center">Try Again</Link>
                    <Link to="/" className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded text-center">Contact Support</Link>
                </div>
                <div className="text-center">
                    <Link to="/" className="text-blue-600 hover:text-blue-800">Return to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default Failure;
