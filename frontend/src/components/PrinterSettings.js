import React, { useState, useEffect } from 'react';
import { Printer, Settings, Wifi, WifiOff, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import thermalPrinter from '../services/thermalPrinter';

const PrinterSettings = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setIsConnected(thermalPrinter.isConnected);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    setSuccess('');

    try {
      if (!thermalPrinter.isWebSerialSupported()) {
        throw new Error('Web Serial API is not supported. Please use Chrome or Edge browser.');
      }

      await thermalPrinter.connectPrinter();
      setIsConnected(true);
      setSuccess('Thermal printer connected successfully!');
    } catch (err) {
      setError(err.message || 'Failed to connect to thermal printer');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await thermalPrinter.disconnectPrinter();
      setIsConnected(false);
      setSuccess('Thermal printer disconnected');
      setError('');
    } catch (err) {
      setError('Failed to disconnect printer');
    }
  };

  const handleTestPrint = async () => {
    setIsTesting(true);
    setError('');
    setSuccess('');

    try {
      await thermalPrinter.testPrint();
      setSuccess('Test print sent successfully!');
    } catch (err) {
      setError(err.message || 'Failed to send test print');
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Printer Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Printer Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <Printer className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="text-white font-medium">TVS RP 3230</h3>
              <p className="text-gray-400 text-sm">Thermal Receipt Printer</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-red-500 text-sm">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Browser Compatibility */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium text-sm">Browser Requirements</h4>
              <p className="text-blue-300 text-xs mt-1">
                Thermal printing requires Chrome or Edge browser with Web Serial API support.
                Make sure your printer is connected via USB.
              </p>
            </div>
          </div>
        </div>

        {/* Connection Controls */}
        <div className="space-y-4 mb-6">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Connect Thermal Printer</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleTestPrint}
                disabled={isTesting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Printing...</span>
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    <span>Test Print</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <WifiOff className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Setup Instructions:</h4>
          <ol className="text-gray-300 text-sm space-y-1">
            <li>1. Connect your TVS RP 3230 printer via USB</li>
            <li>2. Make sure printer is powered on</li>
            <li>3. Use Chrome or Edge browser</li>
            <li>4. Click "Connect Thermal Printer"</li>
            <li>5. Select your printer from the list</li>
            <li>6. Test print to verify connection</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PrinterSettings;
