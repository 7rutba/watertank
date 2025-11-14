const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF invoice
 * @param {Object} invoice - Invoice document with populated fields
 * @param {Object} vendor - Vendor document
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateInvoicePDF = async (invoice, vendor) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('INVOICE', { align: 'center' })
        .moveDown(0.5);

      // Invoice Number and Date
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' })
        .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, { align: 'right' })
        .moveDown();

      // Vendor Information
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('From:', 50, 120)
        .font('Helvetica')
        .fontSize(10)
        .text(vendor.businessName || vendor.ownerName, 50, 140)
        .text(vendor.address?.street || '', 50, 155)
        .text(`${vendor.address?.city || ''}${vendor.address?.state ? ', ' + vendor.address.state : ''}`, 50, 170)
        .text(vendor.address?.zipCode || '', 50, 185)
        .text(`Phone: ${vendor.phone}`, 50, 200)
        .text(`Email: ${vendor.email}`, 50, 215);

      // Customer Information
      const customer = invoice.relatedId;
      const customerY = 120;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('To:', 300, customerY)
        .font('Helvetica')
        .fontSize(10)
        .text(customer?.name || 'N/A', 300, customerY + 20)
        .text(customer?.address?.street || '', 300, customerY + 35)
        .text(`${customer?.address?.city || ''}${customer?.address?.state ? ', ' + customer.address.state : ''}`, 300, customerY + 50)
        .text(customer?.address?.zipCode || '', 300, customerY + 65)
        .text(`Phone: ${customer?.phone || 'N/A'}`, 300, customerY + 80)
        .text(`Email: ${customer?.email || 'N/A'}`, 300, customerY + 95);

      // Period (if monthly invoice)
      if (invoice.period && invoice.period.startDate && invoice.period.endDate) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(
            `Period: ${new Date(invoice.period.startDate).toLocaleDateString('en-IN')} to ${new Date(invoice.period.endDate).toLocaleDateString('en-IN')}`,
            50,
            250,
            { align: 'left' }
          )
          .moveDown();
      }

      // Items Table Header
      const tableTop = invoice.period ? 280 : 250;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Date', 50, tableTop)
        .text('Driver', 120, tableTop)
        .text('Vehicle', 200, tableTop)
        .text('Quantity', 280, tableTop, { width: 60, align: 'right' })
        .text('Rate', 350, tableTop, { width: 60, align: 'right' })
        .text('Amount', 420, tableTop, { width: 80, align: 'right' });

      // Draw line under header
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(500, tableTop + 15)
        .stroke();

      // Items
      let y = tableTop + 25;
      invoice.items.forEach((item, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        
        doc
          .fontSize(9)
          .font('Helvetica')
          .text(new Date(item.date).toLocaleDateString('en-IN'), 50, y, { width: 70 })
          .text(item.driverName || '-', 120, y, { width: 80 })
          .text(item.vehicleNumber || '-', 200, y, { width: 80 })
          .text(`${item.quantity || 0}L`, 280, y, { width: 60, align: 'right' })
          .text(`₹${(item.rate || 0).toFixed(2)}`, 350, y, { width: 60, align: 'right' })
          .text(`₹${(item.amount || 0).toFixed(2)}`, 420, y, { width: 80, align: 'right' });

        y += 20;
      });

      // Draw line before totals
      doc
        .moveTo(50, y + 5)
        .lineTo(500, y + 5)
        .stroke();

      // Totals
      y += 15;
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Subtotal:', 350, y, { width: 60, align: 'right' })
        .text(`₹${(invoice.subtotal || 0).toFixed(2)}`, 420, y, { width: 80, align: 'right' });

      if (invoice.tax > 0) {
        y += 15;
        doc
          .text('Tax:', 350, y, { width: 60, align: 'right' })
          .text(`₹${invoice.tax.toFixed(2)}`, 420, y, { width: 80, align: 'right' });
      }

      if (invoice.discount > 0) {
        y += 15;
        doc
          .text('Discount:', 350, y, { width: 60, align: 'right' })
          .text(`-₹${invoice.discount.toFixed(2)}`, 420, y, { width: 80, align: 'right' });
      }

      y += 20;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total:', 350, y, { width: 60, align: 'right' })
        .text(`₹${(invoice.total || 0).toFixed(2)}`, 420, y, { width: 80, align: 'right' });

      // Payment Status
      y += 30;
      // Calculate paid amount - handle both populated and unpopulated payments
      let paidAmount = 0;
      if (invoice.payments && invoice.payments.length > 0) {
        paidAmount = invoice.payments.reduce((sum, p) => {
          // If payment is populated object, use p.amount, otherwise it's just an ID
          return sum + (typeof p === 'object' && p.amount ? p.amount : 0);
        }, 0);
      }
      const outstanding = invoice.total - paidAmount;
      
      if (paidAmount > 0) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Paid: ₹${paidAmount.toFixed(2)}`, 350, y, { width: 60, align: 'right' })
          .text(`Outstanding: ₹${outstanding.toFixed(2)}`, 420, y, { width: 80, align: 'right' });
      } else if (outstanding > 0) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Outstanding: ₹${outstanding.toFixed(2)}`, 420, y, { width: 80, align: 'right' });
      }

      // Status
      y += 20;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Status: ${invoice.status.toUpperCase()}`, 50, y);

      // Due Date
      if (invoice.dueDate) {
        y += 15;
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 50, y);
      }

      // Notes
      if (invoice.notes) {
        y += 30;
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Notes:', 50, y)
          .text(invoice.notes, 50, y + 15, { width: 450 });
      }

      // Footer
      const pageHeight = doc.page.height;
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'Thank you for your business!',
          { align: 'center', y: pageHeight - 50 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF,
};

