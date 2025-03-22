import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Dummy data object with updated bank statement URL
const dummyData = {
    name: "Nabh Patodi",
    age: "20",
    dob: "10/05/2004",
    address: "84, GUMASTA NAGAR, Indore, Indore, Madhya Pradesh, 452009",
    aadhaarNumber: "9121 6383 6438",
    panNumber: "HBOPP3747M",
    monthlyIncome: "100000",
    monthlyExpense: "5000",
    loanAmount: "1000000",
    loanPurpose: "Education",
    creditScore: "800",
    employmentStatus: "Part-time Employee",
    photograph: "https://iili.io/3zeozdP.png",
    bankStatement: "https://example.com/bank-statement.pdf" // Changed from "#" to a URL
};

const Preview = ({ data = dummyData }) => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    
    // Check for system preference on initial load
    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
        }
    }, []);

    const handleSubmit = () => {
        navigate('/manager');
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const openDocumentModal = () => {
        setIsDocumentModalOpen(true);
    };

    const closeDocumentModal = () => {
        setIsDocumentModalOpen(false);
    };

    const fields = [
        { label: "Name", value: data.name, icon: "👤" },
        { label: "Age", value: data.age, icon: "🎂" },
        { label: "Date of Birth", value: data.dob, icon: "📅" },
        { label: "Address", value: data.address, icon: "🏠" },
        { label: "Aadhaar Number", value: data.aadhaarNumber, icon: "🪪" },
        { label: "PAN Number", value: data.panNumber, icon: "📄" },
        { label: "Monthly Income", value: `₹${data.monthlyIncome}`, icon: "💰" },
        { label: "Monthly Expense", value: `₹${data.monthlyExpense}`, icon: "💸" },
        { label: "Loan Amount", value: `₹${data.loanAmount}`, icon: "🏦" },
        { label: "Loan Purpose", value: data.loanPurpose, icon: "🎯" },
        { label: "Credit Score", value: data.creditScore, icon: "📊" },
        { label: "Employment Status", value: data.employmentStatus, icon: "💼" }
    ];

    // Simple document viewer modal
    const DocumentModal = () => (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDocumentModalOpen ? 'block' : 'hidden'}`}>
            <div className="absolute inset-0 bg-black opacity-50" onClick={closeDocumentModal}></div>
            <div className={`relative w-full max-w-3xl rounded-lg shadow-xl transition-all ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bank Statement</h3>
                        <button 
                            onClick={closeDocumentModal}
                            className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            ×
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className={`h-96 overflow-auto rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="p-6 text-center">
                            <div className="mb-4">
                                <span className="text-4xl">📄</span>
                            </div>
                            <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Bank Statement - Last 6 Months
                            </h4>
                            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Statement period: Sep 2024 - Feb 2025
                            </p>
                            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                This is a placeholder for the actual bank statement document that would normally be displayed or embedded here.
                            </p>
                            <button 
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                                    darkMode 
                                        ? 'bg-blue-700 text-white hover:bg-blue-600' 
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                Download Document
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-end">
                        <button 
                            onClick={closeDocumentModal}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                darkMode 
                                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen py-10 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto">
                {/* Theme Toggle */}
                <div className="flex justify-end px-6 mb-4">
                    <button 
                        onClick={toggleTheme} 
                        className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-700'}`}
                        aria-label="Toggle theme"
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
                
                <div className={`p-8 shadow-lg rounded-xl transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            Loan Application Preview
                        </h2>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            Under Review
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {fields.map((field, index) => (
                            <div 
                                key={index} 
                                className={`p-4 rounded-lg transition-all duration-300 hover:shadow-md ${
                                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{field.icon}</span>
                                    <div>
                                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{field.label}</div>
                                        <div className="font-medium">{field.value || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-700' : 'border border-gray-200'}`}>
                            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                <span className="mr-2">📷</span>Photograph
                            </h3>
                            {data.photograph ? (
                                <div className="overflow-hidden rounded-lg border-2 border-blue-500">
                                    <img 
                                        src={data.photograph} 
                                        alt="Applicant" 
                                        className="w-32 h-32 object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className={`w-32 h-32 flex items-center justify-center rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>No image</span>
                                </div>
                            )}
                        </div>
                        
                        <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-700' : 'border border-gray-200'}`}>
                            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                <span className="mr-2">📑</span>Bank Statement
                            </h3>
                            <div className={`px-4 py-3 rounded-md ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <span className="mr-2">✅</span>Document uploaded
                                    </span>
                                    <button 
                                        onClick={openDocumentModal}
                                        className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-300 ${
                                            darkMode 
                                                ? 'bg-blue-700 text-white hover:bg-blue-600' 
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        View Document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <button className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                            darkMode 
                                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}>
                            Edit Application
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Submit Application
                        </button>
                    </div>
                </div>
                
                <div className="mt-6 text-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Your application data is securely encrypted and will be reviewed within 24 hours
                    </p>
                </div>
            </div>
            
            {/* Document Viewer Modal */}
            {isDocumentModalOpen && <DocumentModal />}
        </div>
    );
};

export default Preview;