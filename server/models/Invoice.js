const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'delivery', 'monthly'],
    required: true,
  },
  relatedTo: {
    type: String,
    enum: ['supplier', 'society'],
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  period: {
    startDate: Date,
    endDate: Date,
  },
  items: [{
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    date: Date,
    driverName: String,
    vehicleNumber: String,
    quantity: Number,
    rate: Number,
    amount: Number,
  }],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  dueDate: {
    type: Date,
  },
  paidDate: {
    type: Date,
  },
  pdfUrl: {
    type: String,
    default: null,
  },
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  }],
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const prefix = this.type === 'purchase' ? 'PUR' : this.type === 'delivery' ? 'DEL' : 'MON';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Invoice').countDocuments({ 
      type: this.type,
      createdAt: {
        $gte: new Date(year, new Date().getMonth(), 1),
        $lt: new Date(year, new Date().getMonth() + 1, 1),
      }
    });
    this.invoiceNumber = `${prefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);

