// Thermal Print Helper - Alternative methods for thermal printing
// This provides fallback options when Web Serial API is not available

export class ThermalPrintHelper {
  
  // Generate thermal-optimized HTML for printing
  static generateThermalHTML(orderData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>THBB Restaurant - Bill #${orderData.token}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    
    body {
      font-family: 'Courier New', monospace;
      margin: 0;
      padding: 8px;
      background: white;
      color: #000;
      font-size: 12px;
      line-height: 1.2;
      width: 80mm;
      max-width: 80mm;
    }
    
    .receipt {
      width: 100%;
      max-width: 80mm;
    }
    
    .center { text-align: center; }
    .left { text-align: left; }
    .right { text-align: right; }
    
    .bold { font-weight: bold; }
    .large { font-size: 16px; }
    
    .header {
      text-align: center;
      border-bottom: 1px dashed #000;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    
    .separator {
      border-top: 1px dashed #000;
      margin: 8px 0;
      height: 1px;
    }
    
    .separator-solid {
      border-top: 1px solid #000;
      margin: 8px 0;
      height: 1px;
    }
    
    .item-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
    }
    
    .item-name {
      flex: 1;
      text-align: left;
    }
    
    .item-price {
      text-align: right;
      min-width: 60px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
    }
    
    .grand-total {
      font-weight: bold;
      font-size: 14px;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 4px 0;
      margin: 8px 0;
    }
    
    .qr-section {
      text-align: center;
      margin: 12px 0;
    }
    
    .footer {
      text-align: center;
      margin-top: 12px;
      font-size: 10px;
    }
    
    .token-box {
      border: 1px solid #000;
      padding: 4px;
      margin: 8px 0;
      text-align: center;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <div class="large bold">THBB RESTAURANT</div>
      <div>Delicious Food Delivered</div>
    </div>
    
    <!-- Order Details -->
    <div class="left">
      <div class="bold">Bill No: #${orderData.token}</div>
      <div>Date: ${new Date(orderData.created_at).toLocaleString()}</div>
      <div>Customer: ${orderData.user_name || 'Walk-in Customer'}</div>
      <div>Address: ${orderData.address}</div>
    </div>
    
    <div class="separator"></div>
    
    <!-- Items -->
    <div class="bold">ITEMS:</div>
    ${orderData.items.map(item => {
      const itemName = item.menu_item?.name || 'Unknown Item';
      const itemPrice = item.price_at_time;
      const quantity = item.quantity;
      const total = (quantity * itemPrice).toFixed(2);
      
      return `
      <div class="item-row">
        <div class="item-name">${itemName}</div>
      </div>
      <div class="item-row">
        <div class="item-name">  ${quantity} x ₹${itemPrice}</div>
        <div class="item-price">₹${total}</div>
      </div>`;
    }).join('')}
    
    <div class="separator"></div>
    
    <!-- Totals -->
    <div class="total-row">
      <div>Subtotal:</div>
      <div>₹${orderData.total_price}</div>
    </div>
    <div class="total-row">
      <div>Delivery:</div>
      <div>FREE</div>
    </div>
    <div class="total-row">
      <div>Taxes:</div>
      <div>INCLUDED</div>
    </div>
    
    <div class="total-row grand-total">
      <div>TOTAL:</div>
      <div>₹${orderData.total_price}</div>
    </div>
    
    <!-- QR Code Section -->
    <div class="qr-section">
      <div class="bold">ORDER VERIFICATION</div>
      <div class="token-box">TOKEN: ${orderData.token}</div>
      <div style="font-size: 10px;">[Scan QR code for verification]</div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="bold">THANK YOU FOR YOUR ORDER!</div>
      <div>Visit us again for more delicious food</div>
      <div>THBB Restaurant</div>
      <div>For support: Contact Admin</div>
    </div>
    
    <br><br><br>
  </div>
  
  <script>
    // Auto-print when page loads
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 500);
    };
  </script>
</body>
</html>`;
  }

  // Print using optimized thermal layout
  static printThermalReceipt(orderData) {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    const htmlContent = this.generateThermalHTML(orderData);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    return new Promise((resolve) => {
      printWindow.onload = () => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      };
    });
  }

  // Generate ESC/POS commands as text (for copy-paste to thermal printer software)
  static generateESCPOSCommands(orderData) {
    const ESC = '\x1B';
    const GS = '\x1D';
    
    let commands = '';
    
    // Initialize
    commands += ESC + '@'; // Initialize printer
    
    // Header
    commands += ESC + 'a1'; // Center align
    commands += ESC + '!24'; // Large bold font
    commands += 'THBB RESTAURANT\n';
    commands += ESC + '!0'; // Normal font
    commands += 'Delicious Food Delivered\n';
    commands += '================================\n';
    
    // Order details
    commands += ESC + 'a0'; // Left align
    commands += ESC + '!8'; // Bold font
    commands += `Bill No: #${orderData.token}\n`;
    commands += ESC + '!0'; // Normal font
    commands += `Date: ${new Date(orderData.created_at).toLocaleString()}\n`;
    commands += `Customer: ${orderData.user_name || 'Walk-in Customer'}\n`;
    commands += `Address: ${orderData.address}\n`;
    commands += '--------------------------------\n';
    
    // Items
    commands += ESC + '!8'; // Bold
    commands += 'ITEMS:\n';
    commands += ESC + '!0'; // Normal
    
    orderData.items.forEach(item => {
      const itemName = item.menu_item?.name || 'Unknown Item';
      const itemPrice = item.price_at_time;
      const quantity = item.quantity;
      const total = (quantity * itemPrice).toFixed(2);
      
      commands += `${itemName}\n`;
      commands += `  ${quantity} x ₹${itemPrice}`;
      
      // Right align price
      const spaces = 48 - (`  ${quantity} x ₹${itemPrice}`).length - (`₹${total}`).length;
      commands += ' '.repeat(Math.max(0, spaces)) + `₹${total}\n`;
    });
    
    commands += '--------------------------------\n';
    
    // Totals
    commands += ESC + '!8'; // Bold
    const subtotalLine = `Subtotal:`;
    const subtotalSpaces = 48 - subtotalLine.length - (`₹${orderData.total_price}`).length;
    commands += subtotalLine + ' '.repeat(Math.max(0, subtotalSpaces)) + `₹${orderData.total_price}\n`;
    
    const deliveryLine = `Delivery:`;
    const deliverySpaces = 48 - deliveryLine.length - 'FREE'.length;
    commands += deliveryLine + ' '.repeat(Math.max(0, deliverySpaces)) + 'FREE\n';
    
    const taxLine = `Taxes:`;
    const taxSpaces = 48 - taxLine.length - 'INCLUDED'.length;
    commands += taxLine + ' '.repeat(Math.max(0, taxSpaces)) + 'INCLUDED\n';
    
    commands += '================================\n';
    commands += ESC + '!24'; // Large bold
    const totalLine = `TOTAL:`;
    const totalSpaces = 48 - totalLine.length - (`₹${orderData.total_price}`).length;
    commands += totalLine + ' '.repeat(Math.max(0, totalSpaces)) + `₹${orderData.total_price}\n`;
    commands += ESC + '!0'; // Normal
    commands += '================================\n';
    
    // QR Code section
    commands += ESC + 'a1'; // Center
    commands += 'ORDER VERIFICATION\n';
    commands += `TOKEN: ${orderData.token}\n`;
    commands += '[QR CODE PLACEHOLDER]\n';
    commands += '--------------------------------\n';
    
    // Footer
    commands += ESC + '!8'; // Bold
    commands += 'THANK YOU FOR YOUR ORDER!\n';
    commands += ESC + '!0'; // Normal
    commands += 'Visit us again for more delicious food\n';
    commands += 'THBB Restaurant\n';
    commands += 'For support: Contact Admin\n';
    commands += '\n\n\n';
    
    // Cut paper
    commands += GS + 'V1';
    
    return commands;
  }

  // Download ESC/POS commands as file
  static downloadESCPOSFile(orderData) {
    const commands = this.generateESCPOSCommands(orderData);
    const blob = new Blob([commands], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `thermal-receipt-${orderData.token}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default ThermalPrintHelper;
