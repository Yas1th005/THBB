// Thermal Printer Service for TVS RP 3230
// Handles thermal printing using browser APIs and ESC/POS commands

class ThermalPrinterService {
  constructor() {
    this.printer = null;
    this.isConnected = false;
    this.printerWidth = 48; // 80mm paper = ~48 characters
  }

  // ESC/POS Commands
  ESC = '\x1B';
  GS = '\x1D';
  
  // Command constants
  COMMANDS = {
    INIT: this.ESC + '@',
    ALIGN_LEFT: this.ESC + 'a0',
    ALIGN_CENTER: this.ESC + 'a1',
    ALIGN_RIGHT: this.ESC + 'a2',
    FONT_NORMAL: this.ESC + '!0',
    FONT_BOLD: this.ESC + '!8',
    FONT_LARGE: this.ESC + '!16',
    FONT_LARGE_BOLD: this.ESC + '!24',
    LINE_FEED: '\n',
    CUT_PAPER: this.GS + 'V1',
    DRAWER_OPEN: this.ESC + 'p048',
    BARCODE_HEIGHT: this.GS + 'h100',
    BARCODE_WIDTH: this.GS + 'w2',
    PRINT_BARCODE: this.GS + 'kA',
  };

  // Check if Web Serial API is supported
  isWebSerialSupported() {
    return 'serial' in navigator;
  }

  // Connect to thermal printer via Web Serial API
  async connectPrinter() {
    if (!this.isWebSerialSupported()) {
      throw new Error('Web Serial API is not supported in this browser. Please use Chrome/Edge.');
    }

    try {
      // Request a port and open a connection
      this.printer = await navigator.serial.requestPort();
      await this.printer.open({ 
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });
      
      this.isConnected = true;
      console.log('Thermal printer connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect to thermal printer:', error);
      throw error;
    }
  }

  // Disconnect from printer
  async disconnectPrinter() {
    if (this.printer && this.isConnected) {
      await this.printer.close();
      this.printer = null;
      this.isConnected = false;
      console.log('Thermal printer disconnected');
    }
  }

  // Send raw data to printer
  async sendToPrinter(data) {
    if (!this.isConnected || !this.printer) {
      throw new Error('Printer not connected');
    }

    try {
      const writer = this.printer.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(data));
      writer.releaseLock();
    } catch (error) {
      console.error('Failed to send data to printer:', error);
      throw error;
    }
  }

  // Format text to fit printer width
  formatText(text, align = 'left') {
    const lines = [];
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= this.printerWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(this.alignText(currentLine, align));
          currentLine = word;
        } else {
          // Word is too long, split it
          lines.push(this.alignText(word.substring(0, this.printerWidth), align));
          currentLine = word.substring(this.printerWidth);
        }
      }
    }
    
    if (currentLine) {
      lines.push(this.alignText(currentLine, align));
    }

    return lines.join('\n');
  }

  // Align text within printer width
  alignText(text, align) {
    const padding = this.printerWidth - text.length;
    
    switch (align) {
      case 'center':
        const leftPad = Math.floor(padding / 2);
        return ' '.repeat(leftPad) + text;
      case 'right':
        return ' '.repeat(padding) + text;
      default:
        return text;
    }
  }

  // Create a line separator
  createSeparator(char = '-') {
    return char.repeat(this.printerWidth);
  }

  // Format price with proper alignment
  formatPriceLine(item, price, quantity = null) {
    const priceStr = `₹${price}`;
    const qtyStr = quantity ? `x${quantity}` : '';
    
    let itemText = item;
    if (quantity) {
      itemText = `${item} ${qtyStr}`;
    }
    
    const maxItemLength = this.printerWidth - priceStr.length - 1;
    if (itemText.length > maxItemLength) {
      itemText = itemText.substring(0, maxItemLength - 3) + '...';
    }
    
    const spaces = this.printerWidth - itemText.length - priceStr.length;
    return itemText + ' '.repeat(spaces) + priceStr;
  }

  // Generate QR code data for ESC/POS (simplified)
  generateQRCode(data) {
    // For actual QR code printing, you would need to implement
    // the full ESC/POS QR code commands. This is a placeholder.
    return `${this.GS}(k${String.fromCharCode(4, 0, 49, 65, 50, 0)}${data}${this.GS}(k${String.fromCharCode(3, 0, 49, 81, 48)}`;
  }

  // Print thermal receipt
  async printReceipt(orderData) {
    if (!this.isConnected) {
      throw new Error('Printer not connected. Please connect to thermal printer first.');
    }

    try {
      let receipt = '';
      
      // Initialize printer
      receipt += this.COMMANDS.INIT;
      
      // Header
      receipt += this.COMMANDS.ALIGN_CENTER;
      receipt += this.COMMANDS.FONT_LARGE_BOLD;
      receipt += 'THBB RESTAURANT\n';
      receipt += this.COMMANDS.FONT_NORMAL;
      receipt += 'Delicious Food Delivered\n';
      receipt += this.createSeparator('=') + '\n';
      
      // Order details
      receipt += this.COMMANDS.ALIGN_LEFT;
      receipt += this.COMMANDS.FONT_BOLD;
      receipt += `Bill No: #${orderData.token}\n`;
      receipt += this.COMMANDS.FONT_NORMAL;
      receipt += `Date: ${new Date(orderData.created_at).toLocaleString()}\n`;
      receipt += `Customer: ${orderData.user_name || 'Walk-in Customer'}\n`;
      receipt += `Address: ${this.formatText(orderData.address)}\n`;
      receipt += this.createSeparator('-') + '\n';
      
      // Items
      receipt += this.COMMANDS.FONT_BOLD;
      receipt += 'ITEMS:\n';
      receipt += this.COMMANDS.FONT_NORMAL;
      
      orderData.items.forEach(item => {
        const itemName = item.menu_item?.name || 'Unknown Item';
        const itemPrice = item.price_at_time;
        const quantity = item.quantity;
        const total = (quantity * itemPrice).toFixed(2);
        
        receipt += `${itemName}\n`;
        receipt += this.formatPriceLine(`  ${quantity} x ₹${itemPrice}`, total) + '\n';
      });
      
      receipt += this.createSeparator('-') + '\n';
      
      // Totals
      receipt += this.COMMANDS.FONT_BOLD;
      receipt += this.formatPriceLine('Subtotal:', orderData.total_price) + '\n';
      receipt += this.formatPriceLine('Delivery:', 'FREE') + '\n';
      receipt += this.formatPriceLine('Taxes:', 'INCLUDED') + '\n';
      receipt += this.createSeparator('=') + '\n';
      receipt += this.COMMANDS.FONT_LARGE_BOLD;
      receipt += this.formatPriceLine('TOTAL:', `₹${orderData.total_price}`) + '\n';
      receipt += this.COMMANDS.FONT_NORMAL;
      receipt += this.createSeparator('=') + '\n';
      
      // QR Code section
      receipt += this.COMMANDS.ALIGN_CENTER;
      receipt += 'ORDER VERIFICATION\n';
      receipt += `TOKEN: ${orderData.token}\n`;
      // Note: Actual QR code printing would require more complex implementation
      receipt += '[QR CODE PLACEHOLDER]\n';
      receipt += this.createSeparator('-') + '\n';
      
      // Footer
      receipt += this.COMMANDS.ALIGN_CENTER;
      receipt += this.COMMANDS.FONT_BOLD;
      receipt += 'THANK YOU FOR YOUR ORDER!\n';
      receipt += this.COMMANDS.FONT_NORMAL;
      receipt += 'Visit us again for more delicious food\n';
      receipt += 'THBB Restaurant\n';
      receipt += 'For support: Contact Admin\n';
      receipt += '\n\n\n';
      
      // Cut paper
      receipt += this.COMMANDS.CUT_PAPER;
      
      // Send to printer
      await this.sendToPrinter(receipt);
      console.log('Receipt printed successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to print receipt:', error);
      throw error;
    }
  }

  // Test print function
  async testPrint() {
    if (!this.isConnected) {
      throw new Error('Printer not connected');
    }

    const testData = `${this.COMMANDS.INIT}${this.COMMANDS.ALIGN_CENTER}${this.COMMANDS.FONT_LARGE_BOLD}THBB RESTAURANT\n${this.COMMANDS.FONT_NORMAL}Test Print Successful\n${new Date().toLocaleString()}\n\n\n${this.COMMANDS.CUT_PAPER}`;
    
    await this.sendToPrinter(testData);
    return true;
  }
}

// Create singleton instance
const thermalPrinter = new ThermalPrinterService();

export default thermalPrinter;
