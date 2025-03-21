import React from 'react';

// Dummy data object
const dummyData = {
    name: "Jane Doe",
    age: "32",
    dob: "15/04/1991",
    address: "123 Main Street, Mumbai, Maharashtra",
    aadhaarNumber: "1234 5678 9012",
    panNumber: "ABCDE1234F",
    monthlyIncome: "85000",
    monthlyExpense: "45000",
    loanAmount: "500000",
    loanPurpose: "Home Renovation",
    creditScore: "750",
    employmentStatus: "Full-time Employee",
    photograph: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    bankStatement: "#"
};

const Preview = ({ data = dummyData }) => {
    const fields = [
        { label: "Name", value: data.name },
        { label: "Age", value: data.age },
        { label: "Date of Birth", value: data.dob },
        { label: "Address", value: data.address },
        { label: "Aadhaar Number", value: data.aadhaarNumber },
        { label: "PAN Number", value: data.panNumber },
        { label: "Monthly Income", value: `₹${data.monthlyIncome}` },
        { label: "Monthly Expense", value: `₹${data.monthlyExpense}` },
        { label: "Loan Amount", value: `₹${data.loanAmount}` },
        { label: "Loan Purpose", value: data.loanPurpose },
        { label: "Credit Score", value: data.creditScore },
        { label: "Employment Status", value: data.employmentStatus }
    ];

    return (
        <div className='min-h-screen py-10 bg-gray-100 flex items-center justify-center'>
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-medium text-gray-800 mb-6">Application Preview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {fields.map((field, index) => (
                    <div key={index} className="p-4 border border-gray-100 rounded-md bg-gray-50">
                        <div className="text-sm text-gray-500">{field.label}</div>
                        <div className="font-medium text-gray-800">{field.value || 'N/A'}</div>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Photograph</h3>
                    {data.photograph ? (
                        <img 
                            src={data.photograph} 
                            alt="Applicant" 
                            className="w-32 h-32 object-cover rounded-md"
                        />
                    ) : (
                        <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-md">
                            <span className="text-gray-400 text-sm">No image</span>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Bank Statement</h3>
                    {data.bankStatement ? (
                        <a 
                            href={data.bankStatement} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            View Document
                        </a>
                    ) : (
                        <div className="text-gray-400 text-sm">No document uploaded</div>
                    )}
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
                <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Edit Application
                </button>
                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Submit Application
                </button>
            </div>
        </div>
        </div>
    );
};

export default Preview;
