# Thermal Printing Setup Guide for THBB Restaurant

This guide explains how to set up and use thermal printing with your TVS RP 3230 thermal printer.

## Overview

The THBB restaurant application now supports thermal printing through multiple methods:

1. **Direct Web Serial Connection** (Recommended for Chrome/Edge)
2. **Thermal-Optimized Browser Printing** (Fallback for all browsers)
3. **ESC/POS Command Download** (For external thermal printer software)

## Hardware Requirements

- **Printer**: TVS RP 3230 Thermal Printer
- **Connection**: USB cable
- **Paper**: 80mm thermal paper rolls
- **Power**: Ensure printer is powered on and ready

## Browser Requirements

### Primary Method (Web Serial API)
- **Chrome** 89+ or **Edge** 89+
- **HTTPS connection** (required for Web Serial API)
- **USB connection** to thermal printer

### Fallback Method (Browser Printing)
- Any modern browser (Chrome, Firefox, Safari, Edge)
- Works with any printer (thermal or regular)

## Setup Instructions

### Step 1: Connect Your Printer
1. Connect TVS RP 3230 to your computer via USB
2. Power on the printer
3. Ensure printer drivers are installed (Windows should auto-detect)

### Step 2: Configure in Application
1. Open any order in the Order Details modal
2. Click **"Printer Settings"** button
3. Click **"Connect Thermal Printer"**
4. Select your TVS RP 3230 from the device list
5. Click **"Test Print"** to verify connection

### Step 3: Print Receipts
Once connected, you have several printing options:

#### Option 1: Direct Thermal Print
- Click **"Thermal Print"** button
- Receipt prints directly to thermal printer
- Uses ESC/POS commands for optimal formatting

#### Option 2: Thermal-Optimized Print
- If direct connection fails, system automatically uses browser printing
- Optimized layout for 80mm thermal paper
- Works with any printer

#### Option 3: Download ESC/POS Commands
- Click **"Download ESC/POS"** button
- Downloads a text file with printer commands
- Use with external thermal printer software

## Thermal Receipt Format

The thermal receipts include:

### Header Section
- Restaurant name (THBB RESTAURANT)
- Tagline
- Separator line

### Order Information
- Bill number (order token)
- Date and time
- Customer name
- Delivery address

### Items Section
- Item names
- Quantities and individual prices
- Line totals

### Totals Section
- Subtotal
- Delivery charges (FREE)
- Taxes (INCLUDED)
- Grand total (highlighted)

### Verification Section
- Order verification token
- QR code placeholder
- Instructions for delivery verification

### Footer
- Thank you message
- Restaurant branding
- Contact information

## Troubleshooting

### Connection Issues

**Problem**: "Web Serial API not supported"
- **Solution**: Use Chrome or Edge browser
- **Alternative**: Use "Thermal Print" button (falls back to browser printing)

**Problem**: "Printer not found"
- **Solution**: 
  1. Check USB connection
  2. Ensure printer is powered on
  3. Try different USB port
  4. Restart browser

**Problem**: "Permission denied"
- **Solution**: 
  1. Allow serial port access when prompted
  2. Check browser permissions in settings
  3. Try HTTPS connection

### Printing Issues

**Problem**: "Nothing prints"
- **Solution**:
  1. Check printer paper
  2. Verify printer is online
  3. Try test print from printer settings
  4. Use "Download ESC/POS" as alternative

**Problem**: "Formatting looks wrong"
- **Solution**:
  1. Ensure using 80mm thermal paper
  2. Check printer settings (font size, margins)
  3. Try thermal-optimized browser printing

**Problem**: "Characters appear garbled"
- **Solution**:
  1. Check printer encoding settings
  2. Verify ESC/POS command compatibility
  3. Update printer drivers

## Alternative Methods

### Method 1: Browser Printing with Thermal Layout
If Web Serial doesn't work:
1. Click "Thermal Print" button
2. System automatically opens thermal-optimized print dialog
3. Select your thermal printer
4. Print with these settings:
   - Paper size: 80mm or Custom
   - Margins: Minimum
   - Scale: 100%

### Method 2: External Thermal Software
1. Click "Download ESC/POS" button
2. Save the .txt file
3. Use thermal printer software like:
   - **PrintNode**
   - **Thermal Printer Driver**
   - **ESC/POS Print Service**
4. Load the file and print

### Method 3: Manual Setup
1. Copy ESC/POS commands from downloaded file
2. Use terminal/command prompt:
   ```bash
   # Windows
   copy receipt.txt COM3
   
   # Linux/Mac
   cat receipt.txt > /dev/ttyUSB0
   ```

## Technical Details

### ESC/POS Commands Used
- `ESC @` - Initialize printer
- `ESC a` - Text alignment (0=left, 1=center, 2=right)
- `ESC !` - Font selection (0=normal, 8=bold, 16=large, 24=large+bold)
- `GS V` - Paper cut
- Character encoding: ASCII/UTF-8

### Paper Specifications
- **Width**: 80mm (thermal paper)
- **Character width**: ~48 characters per line
- **Font**: Monospace (Courier New equivalent)
- **Line spacing**: 1.2x for readability

### Browser API Used
- **Web Serial API** for direct printer communication
- **Blob API** for file downloads
- **Print API** for browser printing fallback

## Security Considerations

- Web Serial API requires HTTPS in production
- User must grant permission for each printer connection
- No automatic connections for security
- Printer access is session-based

## Support

For technical support:
1. Check browser console for error messages
2. Verify printer compatibility with ESC/POS
3. Test with different browsers
4. Contact system administrator for network printer setup

## Future Enhancements

Planned improvements:
- Automatic printer detection
- Multiple printer support
- Custom receipt templates
- QR code printing integration
- Network printer support
- Mobile device compatibility
