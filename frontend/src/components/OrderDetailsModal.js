import React from "react";
import { X, Printer, Package, Calendar, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

function OrderDetailsModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>THBB Restaurant - Bill #${order.token}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }

            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 20px;
              background: white;
              color: #000;
              font-size: 14px;
              line-height: 1.4;
            }

            .bill-container {
              max-width: 400px;
              margin: 0 auto;
              border: 2px solid #000;
              padding: 20px;
              background: white;
            }

            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 15px;
              margin-bottom: 15px;
            }

            .restaurant-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
              letter-spacing: 2px;
            }

            .restaurant-tagline {
              font-size: 12px;
              margin-bottom: 10px;
              font-style: italic;
            }

            .bill-title {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
              text-decoration: underline;
            }

            .order-details {
              margin-bottom: 15px;
              border-bottom: 1px dashed #000;
              padding-bottom: 15px;
            }

            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }

            .detail-label {
              font-weight: bold;
              width: 120px;
            }

            .items-section {
              margin-bottom: 15px;
            }

            .items-header {
              font-weight: bold;
              text-align: center;
              margin-bottom: 10px;
              text-decoration: underline;
            }

            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }

            .items-table th {
              border-bottom: 2px solid #000;
              padding: 8px 4px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
            }

            .items-table td {
              border-bottom: 1px dotted #000;
              padding: 6px 4px;
              font-size: 12px;
            }

            .item-name {
              width: 50%;
            }

            .item-qty {
              width: 15%;
              text-align: center;
            }

            .item-price {
              width: 17.5%;
              text-align: right;
            }

            .item-total {
              width: 17.5%;
              text-align: right;
            }

            .totals-section {
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-bottom: 15px;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }

            .grand-total {
              border-top: 2px solid #000;
              padding-top: 8px;
              margin-top: 8px;
              font-weight: bold;
              font-size: 16px;
            }

            .qr-section {
              text-align: center;
              border-top: 2px dashed #000;
              padding-top: 15px;
              margin-top: 15px;
            }

            .qr-title {
              font-weight: bold;
              margin-bottom: 10px;
            }

            .qr-code {
              margin: 10px 0;
            }

            .token-display {
              font-family: 'Courier New', monospace;
              font-weight: bold;
              font-size: 16px;
              letter-spacing: 2px;
              margin-top: 10px;
            }

            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px dashed #000;
              padding-top: 15px;
              font-size: 12px;
            }

            .thank-you {
              font-weight: bold;
              margin-bottom: 5px;
            }

            .contact-info {
              margin-top: 10px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <!-- Header -->
            <div class="header">
              <div class="restaurant-name">THBB RESTAURANT</div>
              <div class="restaurant-tagline">Delicious Food Delivered</div>
              <div class="bill-title">FOOD BILL</div>
            </div>

            <!-- Order Details -->
            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">Bill No:</span>
                <span>#${order.token}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span>${new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span>${order.user_name || 'Walk-in Customer'}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Delivery To:</span>
                <span style="word-break: break-word;">${order.address}</span>
              </div>
            </div>

            <!-- Items Section -->
            <div class="items-section">
              <div class="items-header">ORDER ITEMS</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th class="item-name">ITEM</th>
                    <th class="item-qty">QTY</th>
                    <th class="item-price">RATE</th>
                    <th class="item-total">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.order_items.map(item => `
                    <tr>
                      <td class="item-name">${item.menu_item?.name || 'Unknown Item'}</td>
                      <td class="item-qty">${item.quantity}</td>
                      <td class="item-price">₹${item.price_at_time}</td>
                      <td class="item-total">₹${(item.quantity * item.price_at_time).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Totals Section -->
            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${order.total_price}</span>
              </div>
              <div class="total-row">
                <span>Delivery Charges:</span>
                <span>FREE</span>
              </div>
              <div class="total-row">
                <span>Taxes & Fees:</span>
                <span>INCLUDED</span>
              </div>
              <div class="total-row grand-total">
                <span>GRAND TOTAL:</span>
                <span>₹${order.total_price}</span>
              </div>
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
              <div class="qr-title">ORDER VERIFICATION</div>
              <div class="token-display">TOKEN: ${order.token}</div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="thank-you">THANK YOU FOR YOUR ORDER!</div>
              <div>Visit us again for more delicious food</div>
              <div class="contact-info">
                <div>THBB Restaurant</div>
                <div>For support: Contact Admin</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Add QR code after the document is loaded
    printWindow.onload = () => {
      const qrContainer = printWindow.document.getElementById("qr-code");
      if (qrContainer) {
        // Create a more detailed QR code representation
        const qrSvg = `
          <svg width="120" height="120" viewBox="0 0 120 120" style="border: 1px solid #000;">
            <rect width="120" height="120" fill="white"/>
            <!-- QR Code pattern simulation -->
            <rect x="10" y="10" width="20" height="20" fill="black"/>
            <rect x="35" y="10" width="5" height="5" fill="black"/>
            <rect x="45" y="10" width="5" height="5" fill="black"/>
            <rect x="55" y="10" width="5" height="5" fill="black"/>
            <rect x="90" y="10" width="20" height="20" fill="black"/>
            <rect x="10" y="35" width="5" height="5" fill="black"/>
            <rect x="25" y="35" width="5" height="5" fill="black"/>
            <rect x="45" y="35" width="10" height="10" fill="black"/>
            <rect x="85" y="35" width="5" height="5" fill="black"/>
            <rect x="105" y="35" width="5" height="5" fill="black"/>
            <rect x="10" y="90" width="20" height="20" fill="black"/>
            <rect x="35" y="90" width="5" height="5" fill="black"/>
            <rect x="55" y="90" width="15" height="5" fill="black"/>
            <rect x="90" y="90" width="20" height="20" fill="black"/>
            <!-- Center pattern -->
            <rect x="50" y="50" width="20" height="20" fill="black"/>
            <rect x="55" y="55" width="10" height="10" fill="white"/>
            <rect x="58" y="58" width="4" height="4" fill="black"/>
            <!-- Token text -->
            <text x="60" y="115" text-anchor="middle" font-family="Courier New" font-size="8" fill="black">
              ${order.token}
            </text>
          </svg>
        `;
        qrContainer.innerHTML = qrSvg;
      }

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            Order Details - #{order.token}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
            {/* Order Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Order #{order.token}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500"
                        : order.status === "out_for_delivery"
                        ? "bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500"
                        : order.status === "delivered"
                        ? "bg-green-500 bg-opacity-20 text-green-400 border border-green-500"
                        : "bg-red-500 bg-opacity-20 text-red-400 border border-red-500"
                    }`}
                  >
                    {order.status.replace("_", " ").charAt(0).toUpperCase() + order.status.replace("_", " ").slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-500 mb-3">
                  ₹{order.total_price}
                </p>
                <button
                  onClick={handlePrint}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Printer className="w-5 h-5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-300 mb-3">Customer Information</h4>
              <div className="bg-gray-600 p-4 rounded-lg">
                <p className="text-white font-medium">{order.user_name || 'Unknown Customer'}</p>
                <div className="flex items-start space-x-2 text-sm text-gray-400 mt-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{order.address}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-300 mb-3">Order Items</h4>
              <div className="bg-gray-600 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-500">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-200">Item</th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-200">Qty</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-200">Price</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-200">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-500">
                    {order.order_items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4 text-white">
                          {item.menu_item?.name || "Unknown Item"}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-300">
                          ₹{item.price_at_time}
                        </td>
                        <td className="py-3 px-4 text-right text-orange-400 font-medium">
                          ₹{(item.quantity * item.price_at_time).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-300 mb-3">Order Verification QR Code</h4>
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG
                  value={order.token}
                  size={150}
                  className="w-[150px] h-[150px]"
                />
              </div>
              <p className="text-gray-400 mt-2 text-sm">Token: {order.token}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
