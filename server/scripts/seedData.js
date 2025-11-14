const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const {
  User,
  Vendor,
  Supplier,
  Society,
  Vehicle,
  Collection,
  Delivery,
  Expense,
  Invoice,
  Payment,
} = require('../models');

// Import database connection
const connectDB = require('../config/database');

// Seed data function
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out in production)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Supplier.deleteMany({});
    await Society.deleteMany({});
    await Vehicle.deleteMany({});
    await Collection.deleteMany({});
    await Delivery.deleteMany({});
    await Expense.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});

    // 1. Create Super Admin
    console.log('👤 Creating Super Admin...');
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@watertank.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'super_admin',
      phone: '+91-9876543210',
    });
    console.log('✅ Super Admin created:', superAdmin.email);

    // 2. Create Vendor
    console.log('🏢 Creating Vendor...');
    const vendor = await Vendor.create({
      businessName: 'Sharma Water Supply',
      ownerName: 'Rajesh Sharma',
      email: 'rajesh@sharmawater.com',
      phone: '+91-9876543211',
      address: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
      },
      isActive: true,
      subscription: {
        plan: 'premium',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    const vendorUser = await User.create({
      name: 'Rajesh Sharma',
      email: 'vendor@watertank.com',
      password: 'vendor123', // Will be hashed by pre-save hook
      role: 'vendor',
      vendorId: vendor._id,
      phone: '+91-9876543211',
    });
    console.log('✅ Vendor created:', vendorUser.email);

    // 3. Create Accountant
    console.log('💰 Creating Accountant...');
    const accountant = await User.create({
      name: 'Priya Patel',
      email: 'accountant@watertank.com',
      password: 'accountant123', // Will be hashed by pre-save hook
      role: 'accountant',
      vendorId: vendor._id,
      phone: '+91-9876543212',
    });
    console.log('✅ Accountant created:', accountant.email);

    // 4. Create Drivers
    console.log('🚛 Creating Drivers...');
    const driver1 = await User.create({
      name: 'Amit Kumar',
      email: 'driver1@watertank.com',
      password: 'driver123', // Will be hashed by pre-save hook
      role: 'driver',
      vendorId: vendor._id,
      phone: '+91-9876543213',
    });

    const driver2 = await User.create({
      name: 'Suresh Singh',
      email: 'driver2@watertank.com',
      password: 'driver123', // Will be hashed by pre-save hook
      role: 'driver',
      vendorId: vendor._id,
      phone: '+91-9876543214',
    });
    console.log('✅ Drivers created:', driver1.email, driver2.email);

    // 5. Create Suppliers
    console.log('🏭 Creating Suppliers...');
    const supplier1 = await Supplier.create({
      vendorId: vendor._id,
      name: 'Ganga Water Source',
      contactPerson: 'Ramesh Yadav',
      phone: '+91-9876543220',
      email: 'ganga@water.com',
      purchaseRate: 2.50, // ₹2.50 per liter
      paymentTerms: 'credit_15',
      address: {
        street: '456 Water Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400002',
      },
    });

    const supplier2 = await Supplier.create({
      vendorId: vendor._id,
      name: 'Yamuna Water Supply',
      contactPerson: 'Mohan Das',
      phone: '+91-9876543221',
      email: 'yamuna@water.com',
      purchaseRate: 2.75,
      paymentTerms: 'cash',
      address: {
        street: '789 Source Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400003',
      },
    });
    console.log('✅ Suppliers created:', supplier1.name, supplier2.name);

    // 6. Create Societies
    console.log('🏘️  Creating Societies...');
    const society1 = await Society.create({
      vendorId: vendor._id,
      name: 'Green Valley Society',
      contactPerson: 'Anil Mehta',
      phone: '+91-9876543230',
      email: 'greenvalley@society.com',
      deliveryRate: 5.00, // ₹5.00 per liter
      paymentTerms: 'credit_30',
      address: {
        street: '100 Society Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400010',
      },
    });

    const society2 = await Society.create({
      vendorId: vendor._id,
      name: 'Sunshine Apartments',
      contactPerson: 'Kavita Shah',
      phone: '+91-9876543231',
      email: 'sunshine@society.com',
      deliveryRate: 5.50,
      paymentTerms: 'credit_30',
      address: {
        street: '200 Apartment Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400011',
      },
    });

    const society3 = await Society.create({
      vendorId: vendor._id,
      name: 'Royal Heights',
      contactPerson: 'Vikram Malhotra',
      phone: '+91-9876543232',
      email: 'royal@society.com',
      deliveryRate: 6.00,
      paymentTerms: 'cash',
      address: {
        street: '300 Heights Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400012',
      },
    });

    // Create Society Admin Users
    const societyAdmin1 = await User.create({
      name: 'Anil Mehta',
      email: 'society1@watertank.com',
      password: 'society123', // Will be hashed by pre-save hook
      role: 'society_admin',
      societyId: society1._id,
      phone: '+91-9876543230',
    });

    const societyAdmin2 = await User.create({
      name: 'Kavita Shah',
      email: 'society2@watertank.com',
      password: 'society123', // Will be hashed by pre-save hook
      role: 'society_admin',
      societyId: society2._id,
      phone: '+91-9876543231',
    });
    console.log('✅ Societies created:', society1.name, society2.name, society3.name);

    // 7. Create Vehicles
    console.log('🚚 Creating Vehicles...');
    const vehicle1 = await Vehicle.create({
      vendorId: vendor._id,
      vehicleNumber: 'MH-01-AB-1234',
      vehicleType: 'tanker',
      capacity: 10000, // 10,000 liters
      driverId: driver1._id,
      isAvailable: true,
      currentLocation: {
        latitude: 19.0760,
        longitude: 72.8777,
      },
    });

    const vehicle2 = await Vehicle.create({
      vendorId: vendor._id,
      vehicleNumber: 'MH-01-CD-5678',
      vehicleType: 'tanker',
      capacity: 12000,
      driverId: driver2._id,
      isAvailable: true,
      currentLocation: {
        latitude: 19.0760,
        longitude: 72.8777,
      },
    });

    const vehicle3 = await Vehicle.create({
      vendorId: vendor._id,
      vehicleNumber: 'MH-01-EF-9012',
      vehicleType: 'tractor',
      capacity: 8000,
      isAvailable: false,
      currentLocation: {
        latitude: 19.0760,
        longitude: 72.8777,
      },
    });
    console.log('✅ Vehicles created:', vehicle1.vehicleNumber, vehicle2.vehicleNumber, vehicle3.vehicleNumber);

    // 8. Create Collections (Past 30 days)
    console.log('💧 Creating Collections...');
    const collections = [];
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const collectionDate = new Date();
      collectionDate.setDate(collectionDate.getDate() - daysAgo);
      
      const supplier = Math.random() > 0.5 ? supplier1 : supplier2;
      const vehicle = Math.random() > 0.5 ? vehicle1 : vehicle2;
      const quantity = Math.floor(Math.random() * 5000) + 5000; // 5000-10000 liters

      const collection = await Collection.create({
        vendorId: vendor._id,
        vehicleId: vehicle._id,
        driverId: vehicle.driverId,
        supplierId: supplier._id,
        quantity: quantity,
        purchaseRate: supplier.purchaseRate,
        totalAmount: quantity * supplier.purchaseRate, // Fixed: use totalAmount instead of totalCost
        location: {
          latitude: 19.0760 + (Math.random() - 0.5) * 0.1,
          longitude: 72.8777 + (Math.random() - 0.5) * 0.1,
        },
        meterPhoto: '/uploads/sample-meter.jpg',
        createdAt: collectionDate,
      });
      collections.push(collection);
    }
    console.log(`✅ Created ${collections.length} collections`);

    // 9. Create Deliveries (Past 30 days)
    console.log('🚚 Creating Deliveries...');
    const deliveries = [];
    for (let i = 0; i < 30; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() - daysAgo);
      
      const society = [society1, society2, society3][Math.floor(Math.random() * 3)];
      const vehicle = Math.random() > 0.5 ? vehicle1 : vehicle2;
      const quantity = Math.floor(Math.random() * 3000) + 2000; // 2000-5000 liters
      const relatedCollection = collections[Math.floor(Math.random() * collections.length)];

      const delivery = await Delivery.create({
        vendorId: vendor._id,
        vehicleId: vehicle._id,
        driverId: vehicle.driverId,
        societyId: society._id,
        collectionId: relatedCollection._id,
        quantity: quantity,
        deliveryRate: society.deliveryRate,
        totalAmount: quantity * society.deliveryRate,
        location: {
          latitude: 19.0760 + (Math.random() - 0.5) * 0.1,
          longitude: 72.8777 + (Math.random() - 0.5) * 0.1,
        },
        meterPhoto: '/uploads/sample-meter.jpg',
        signature: '/uploads/sample-signature.jpg',
        signedBy: society.contactPerson,
        createdAt: deliveryDate,
      });
      deliveries.push(delivery);
    }
    console.log(`✅ Created ${deliveries.length} deliveries`);

    // 10. Create Expenses
    console.log('💰 Creating Expenses...');
    const expenseCategories = ['fuel', 'toll', 'maintenance', 'food', 'medical', 'personal'];
    const expenses = [];
    
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const expenseDate = new Date();
      expenseDate.setDate(expenseDate.getDate() - daysAgo);
      
      const driver = Math.random() > 0.5 ? driver1 : driver2;
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const amount = Math.floor(Math.random() * 2000) + 100; // ₹100-₹2100
      const statuses = ['pending', 'approved', 'rejected', 'paid'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const expense = await Expense.create({
        vendorId: vendor._id,
        driverId: driver._id,
        category: category,
        amount: amount,
        description: `Expense for ${category}`,
        expenseDate: expenseDate,
        receipt: '/uploads/sample-receipt.jpg',
        status: status,
        approvedBy: status === 'approved' ? vendorUser._id : null,
        approvedAt: status === 'approved' ? expenseDate : null,
        rejectionReason: status === 'rejected' ? 'Invalid receipt' : null,
        createdAt: expenseDate,
      });
      expenses.push(expense);
    }
    console.log(`✅ Created ${expenses.length} expenses`);

    // 11. Create Invoices (Current Month)
    console.log('📄 Creating Invoices...');
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Invoice for Society 1
    const society1Deliveries = deliveries.filter(
      d => d.societyId.toString() === society1._id.toString() &&
      new Date(d.createdAt) >= lastMonth &&
      new Date(d.createdAt) < currentMonth
    );
    
    if (society1Deliveries.length > 0) {
      const totalAmount = society1Deliveries.reduce((sum, d) => sum + d.totalAmount, 0);
      const invoice1 = await Invoice.create({
        vendorId: vendor._id,
        invoiceNumber: `INV-${Date.now()}-001`,
        type: 'delivery',
        relatedTo: 'society',
        relatedId: society1._id,
        items: society1Deliveries.map(d => ({
          deliveryId: d._id,
          date: d.createdAt,
          quantity: d.quantity,
          rate: d.deliveryRate,
          amount: d.totalAmount,
        })),
        subtotal: totalAmount,
        tax: 0,
        total: totalAmount,
        status: 'sent',
        period: {
          startDate: lastMonth,
          endDate: new Date(currentMonth.getTime() - 1),
        },
        dueDate: new Date(currentMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
        pdfUrl: '/uploads/invoices/inv-001.pdf',
        createdAt: currentMonth,
      });
      console.log('✅ Created invoice for Society 1');
    }

    // Invoice for Society 2
    const society2Deliveries = deliveries.filter(
      d => d.societyId.toString() === society2._id.toString() &&
      new Date(d.createdAt) >= lastMonth &&
      new Date(d.createdAt) < currentMonth
    );
    
    if (society2Deliveries.length > 0) {
      const totalAmount = society2Deliveries.reduce((sum, d) => sum + d.totalAmount, 0);
      const invoice2 = await Invoice.create({
        vendorId: vendor._id,
        invoiceNumber: `INV-${Date.now()}-002`,
        type: 'delivery',
        relatedTo: 'society',
        relatedId: society2._id,
        items: society2Deliveries.map(d => ({
          deliveryId: d._id,
          date: d.createdAt,
          quantity: d.quantity,
          rate: d.deliveryRate,
          amount: d.totalAmount,
        })),
        subtotal: totalAmount,
        tax: 0,
        total: totalAmount,
        status: 'paid',
        period: {
          startDate: lastMonth,
          endDate: new Date(currentMonth.getTime() - 1),
        },
        dueDate: new Date(currentMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
        pdfUrl: '/uploads/invoices/inv-002.pdf',
        createdAt: currentMonth,
      });
      console.log('✅ Created invoice for Society 2');
    }

    // 12. Create Payments
    console.log('💳 Creating Payments...');
    const paymentMethods = ['cash', 'bank_transfer', 'upi', 'cheque', 'card'];
    
    for (let i = 0; i < 10; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - daysAgo);
      
      const paymentType = ['purchase', 'delivery', 'expense'][Math.floor(Math.random() * 3)];
      const amount = Math.floor(Math.random() * 50000) + 5000; // ₹5000-₹55000

      await Payment.create({
        vendorId: vendor._id,
        type: paymentType,
        relatedTo: paymentType === 'purchase' ? 'supplier' : paymentType === 'delivery' ? 'society' : 'driver',
        relatedId: paymentType === 'purchase' ? supplier1._id : paymentType === 'delivery' ? society1._id : driver1._id,
        amount: amount,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentDate: paymentDate,
        referenceNumber: `REF-${Date.now()}-${i}`,
        notes: `Payment for ${paymentType}`,
        status: 'completed',
        createdAt: paymentDate,
      });
    }
    console.log('✅ Created 10 payments');

    // Summary
    console.log('\n📊 Seed Data Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Users: ${await User.countDocuments()}`);
    console.log(`🏢 Vendors: ${await Vendor.countDocuments()}`);
    console.log(`🏭 Suppliers: ${await Supplier.countDocuments()}`);
    console.log(`🏘️  Societies: ${await Society.countDocuments()}`);
    console.log(`🚚 Vehicles: ${await Vehicle.countDocuments()}`);
    console.log(`💧 Collections: ${await Collection.countDocuments()}`);
    console.log(`🚛 Deliveries: ${await Delivery.countDocuments()}`);
    console.log(`💰 Expenses: ${await Expense.countDocuments()}`);
    console.log(`📄 Invoices: ${await Invoice.countDocuments()}`);
    console.log(`💳 Payments: ${await Payment.countDocuments()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Seed data created successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:');
    console.log('  Email: admin@watertank.com');
    console.log('  Password: admin123\n');
    console.log('Vendor:');
    console.log('  Email: vendor@watertank.com');
    console.log('  Password: vendor123\n');
    console.log('Accountant:');
    console.log('  Email: accountant@watertank.com');
    console.log('  Password: accountant123\n');
    console.log('Driver 1:');
    console.log('  Email: driver1@watertank.com');
    console.log('  Password: driver123\n');
    console.log('Driver 2:');
    console.log('  Email: driver2@watertank.com');
    console.log('  Password: driver123\n');
    console.log('Society Admin 1:');
    console.log('  Email: society1@watertank.com');
    console.log('  Password: society123\n');
    console.log('Society Admin 2:');
    console.log('  Email: society2@watertank.com');
    console.log('  Password: society123\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed function
seedData();

