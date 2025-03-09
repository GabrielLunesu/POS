'use client';

import { useState } from 'react';

export default function TestModalPage() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Modal Test Page</h1>
      
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Open Test Modal
      </button>
      
      <div className="mt-4">
        <p>Modal state: {showModal ? 'Open' : 'Closed'}</p>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Test Modal</h2>
            <p className="mb-4">This is a test modal to verify that modals are working correctly in the application.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 