import React, { useState } from 'react';
import { Printer, TestTube, Download, Settings } from 'lucide-react';
import thermalPrinter from '../services/thermalPrinter';
import ThermalPrintHelper from '../utils/thermalPrintHelper';
import PrinterSettings from './PrinterSettings';

const ThermalPrintTest = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');

  // Sample order data for testing
  const sampleOrder = {
    token: '123',
    created_at: new Date().toISOString(),
    user_name: 'Test Customer',
    address: '123 Test Street, Test City, Test State 12345',
    total_price: '299.50',
    items: [
      {
        menu_item: { name: 'Chicken Biryani' },
        quantity: 2,
        price_at_time: 149.75
      },
      {
        menu_item: { name: 'Paneer Butter Masala' },
        quantity: 1,
        price_at_time: 179.00
      }
    ]
  };

  const handleThermalTest = async () => {
    setTesting(true);
    setMessage('');

    try {
      if (thermalPrinter.isConnected) {
        await thermalPrinter.printReceipt(sampleOrder);
        setMessage('✅ Thermal print test successful!');
      } else {
        await ThermalPrintHelper.printThermalReceipt(sampleOrder);
        setMessage('✅ Thermal-optimized browser print test successful!');
      }
    } catch (error) {
      setMessage(`❌ Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleDownloadTest = () => {
    ThermalPrintHelper.downloadESCPOSFile(sampleOrder);
    setMessage('✅ ESC/POS commands downloaded successfully!');
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
        <TestTube className="w-6 h-6 text-orange-500" />
        <span>Thermal Print Test</span>
      </h2>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Thermal Printer:</span>
            <span className={`text-sm ${thermalPrinter.isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {thermalPrinter.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Test Buttons */}
        <button
          onClick={handleThermalTest}
          disabled={testing}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {testing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Testing...</span>
            </>
          ) : (
            <>
              <Printer className="w-5 h-5" />
              <span>Test Thermal Print</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownloadTest}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Test ESC/POS Download</span>
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Settings className="w-5 h-5" />
          <span>Printer Settings</span>
        </button>

        {/* Status Message */}
        {message && (
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-white text-sm">{message}</p>
          </div>
        )}

        {/* Sample Data Preview */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Sample Order Data:</h3>
          <div className="text-gray-300 text-sm space-y-1">
            <div>Token: {sampleOrder.token}</div>
            <div>Customer: {sampleOrder.user_name}</div>
            <div>Items: {sampleOrder.items.length}</div>
            <div>Total: ₹{sampleOrder.total_price}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium text-sm mb-2">Test Instructions:</h4>
          <ol className="text-blue-300 text-xs space-y-1">
            <li>1. Connect your TVS RP 3230 via USB</li>
            <li>2. Click "Printer Settings" to connect</li>
            <li>3. Click "Test Thermal Print" to print sample receipt</li>
            <li>4. Use "Test ESC/POS Download" for file-based printing</li>
          </ol>
        </div>
      </div>

      {/* Printer Settings Modal */}
      <PrinterSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export default ThermalPrintTest;
