import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Comprehensive Seed Data for 1Fi LMS Demo
 * Run: npx prisma db seed
 */
async function main() {
    console.log('🌱 Seeding database with comprehensive demo data...\n');

    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.marginCall.deleteMany();
    await prisma.eMISchedule.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.loanTransaction.deleteMany();
    await prisma.order.deleteMany();
    await prisma.collateral.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.loanApplication.deleteMany();
    await prisma.product.deleteMany();
    await prisma.loanProduct.deleteMany();
    await prisma.partner.deleteMany();
    await prisma.user.deleteMany();
    await prisma.customer.deleteMany();

    // ==========================================
    // 1. USERS
    // ==========================================
    console.log('\n👥 Creating users...');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@1fi.in',
            phone: '9876543210',
            pan: 'ADMIN1234A',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });

    const arpit = await prisma.user.create({
        data: {
            name: 'Arpit Rajput',
            email: 'arpit@example.com',
            phone: '9876543211',
            pan: 'ABCDE1234F',
            passwordHash: userPassword,
            role: 'BORROWER',
        },
    });

    const priya = await prisma.user.create({
        data: {
            name: 'Priya Patel',
            email: 'priya@example.com',
            phone: '9876543212',
            pan: 'FGHIJ5678K',
            passwordHash: userPassword,
            role: 'BORROWER',
        },
    });

    const amit = await prisma.user.create({
        data: {
            name: 'Amit Kumar',
            email: 'amit@example.com',
            phone: '9876543213',
            pan: 'LMNOP9012Q',
            passwordHash: userPassword,
            role: 'BORROWER',
        },
    });

    const neha = await prisma.user.create({
        data: {
            name: 'Neha Gupta',
            email: 'neha@example.com',
            phone: '9876543214',
            pan: 'RSTUV3456W',
            passwordHash: userPassword,
            role: 'BORROWER',
        },
    });

    console.log('   ✅ Created 5 users');

    // ==========================================
    // 1.5 CUSTOMERS (KYC Data)
    // ==========================================
    console.log('\n👤 Creating customers with KYC data...');

    await prisma.customer.create({
        data: {
            firstName: 'Arpit',
            lastName: 'Rajput',
            email: 'arpit@example.com',
            phone: '9876543211',
            dateOfBirth: new Date('1990-05-15'),
            aadhaarNumber: '123456789012',
            aadhaarVerified: true,
            aadhaarVerifiedAt: new Date(),
            panNumber: 'ABCDE1234F',
            panVerified: true,
            panVerifiedAt: new Date(),
            kycStatus: 'VERIFIED',
            addressLine1: '123 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            employmentType: 'SALARIED',
            monthlyIncome: 150000,
            companyName: 'TCS',
            creditScore: 780,
        },
    });

    await prisma.customer.create({
        data: {
            firstName: 'Priya',
            lastName: 'Patel',
            email: 'priya.patel@example.com',
            phone: '9876543212',
            dateOfBirth: new Date('1992-08-22'),
            aadhaarNumber: '234567890123',
            aadhaarVerified: true,
            aadhaarVerifiedAt: new Date(),
            panNumber: 'FGHIJ5678K',
            panVerified: true,
            panVerifiedAt: new Date(),
            kycStatus: 'VERIFIED',
            addressLine1: '45 Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500033',
            employmentType: 'SELF_EMPLOYED',
            monthlyIncome: 200000,
            creditScore: 720,
        },
    });

    await prisma.customer.create({
        data: {
            firstName: 'Amit',
            lastName: 'Kumar',
            email: 'amit.kumar@example.com',
            phone: '9876543213',
            dateOfBirth: new Date('1988-12-10'),
            aadhaarNumber: '345678901234',
            aadhaarVerified: false,
            panNumber: 'LMNOP9012Q',
            panVerified: true,
            panVerifiedAt: new Date(),
            kycStatus: 'IN_PROGRESS',
            addressLine1: '78 Connaught Place',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001',
            employmentType: 'BUSINESS',
            monthlyIncome: 500000,
            companyName: 'Kumar Enterprises',
            creditScore: 690,
        },
    });

    await prisma.customer.create({
        data: {
            firstName: 'Neha',
            lastName: 'Gupta',
            email: 'neha.gupta@example.com',
            phone: '9876543214',
            dateOfBirth: new Date('1995-03-08'),
            kycStatus: 'PENDING',
            addressLine1: '12 Marine Drive',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            employmentType: 'SALARIED',
            monthlyIncome: 80000,
            companyName: 'Wipro',
        },
    });

    await prisma.customer.create({
        data: {
            firstName: 'Vikram',
            lastName: 'Singh',
            email: 'vikram.singh@example.com',
            phone: '9876543215',
            dateOfBirth: new Date('1985-07-25'),
            aadhaarNumber: '456789012345',
            aadhaarVerified: false,
            panNumber: 'VIKRS1234V',
            panVerified: false,
            kycStatus: 'REJECTED',
            kycRejectionReason: 'Document verification failed - blurry Aadhaar copy',
            addressLine1: '56 Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700016',
            employmentType: 'SALARIED',
            monthlyIncome: 120000,
        },
    });

    console.log('   ✅ Created 5 customers with KYC data');

    // ==========================================
    // 2. PARTNERS (Fintech)
    // ==========================================
    console.log('\n🤝 Creating partners...');

    const apiKey1 = '1fi_pk_live_groww_abc123xyz';
    const apiKey2 = '1fi_pk_live_zerodha_def456uvw';

    const partner1 = await prisma.partner.create({
        data: {
            name: 'Groww',
            email: 'api@groww.in',
            apiKeyHash: await bcrypt.hash(apiKey1, 10),
            webhookUrl: 'https://groww.in/webhook/1fi',
            status: 'ACTIVE',
        },
    });

    const partner2 = await prisma.partner.create({
        data: {
            name: 'Zerodha',
            email: 'api@zerodha.com',
            apiKeyHash: await bcrypt.hash(apiKey2, 10),
            webhookUrl: 'https://zerodha.com/webhook/1fi',
            status: 'ACTIVE',
        },
    });

    console.log('   ✅ Created 2 partners');

    // ==========================================
    // 3. LOAN PRODUCTS
    // ==========================================
    console.log('\n💳 Creating loan products...');

    const lamfStandard = await prisma.loanProduct.create({
        data: {
            name: 'LAMF Standard',
            description: 'Standard Loan Against Mutual Funds with competitive rates',
            interestRate: 10.5,
            processingFeePercent: 1.0,
            minAmount: 25000,
            maxAmount: 5000000,
            minTenureMonths: 3,
            maxTenureMonths: 60,
            equityLtv: 0.5,
            debtLtv: 0.8,
            status: 'ACTIVE',
        },
    });

    const lamfPremium = await prisma.loanProduct.create({
        data: {
            name: 'LAMF Premium',
            description: 'Premium loan product for high-value portfolios',
            interestRate: 9.5,
            processingFeePercent: 0.75,
            minAmount: 500000,
            maxAmount: 20000000,
            minTenureMonths: 6,
            maxTenureMonths: 84,
            equityLtv: 0.55,
            debtLtv: 0.85,
            status: 'ACTIVE',
        },
    });

    const noCostEmi = await prisma.loanProduct.create({
        data: {
            name: '1Fi No-Cost EMI',
            description: 'Zero interest EMI for shopping - use your MF as collateral',
            interestRate: 0,
            processingFeePercent: 0,
            minAmount: 5000,
            maxAmount: 500000,
            minTenureMonths: 3,
            maxTenureMonths: 24,
            equityLtv: 0.5,
            debtLtv: 0.8,
            status: 'ACTIVE',
        },
    });

    console.log('   ✅ Created 3 loan products');

    // ==========================================
    // 4. PRODUCTS (Shopping Catalog)
    // ==========================================
    console.log('\n🛒 Creating shopping products...');

    const iphone = await prisma.product.create({
        data: {
            name: 'iPhone 15 Pro Max',
            description: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
            category: 'Electronics',
            brand: 'Apple',
            price: 159900,
            imageUrl: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-256gb-natural-titanium',
            availableTenures: [3, 6, 12, 24],
            stockQuantity: 50,
            status: 'ACTIVE',
        },
    });

    await prisma.product.create({
        data: {
            name: 'MacBook Pro 14"',
            description: 'Apple MacBook Pro M3 Pro 18GB RAM 512GB SSD',
            category: 'Electronics',
            brand: 'Apple',
            price: 199900,
            availableTenures: [6, 12, 24, 36],
            stockQuantity: 30,
            status: 'ACTIVE',
        },
    });

    await prisma.product.create({
        data: {
            name: 'Sony WH-1000XM5',
            description: 'Premium Wireless Noise Cancelling Headphones',
            category: 'Electronics',
            brand: 'Sony',
            price: 29990,
            availableTenures: [3, 6],
            stockQuantity: 100,
            status: 'ACTIVE',
        },
    });

    await prisma.product.create({
        data: {
            name: 'LG 65" OLED TV',
            description: 'LG OLED65C3 4K Smart TV with AI ThinQ',
            category: 'Electronics',
            brand: 'LG',
            price: 189990,
            availableTenures: [6, 12, 24, 36],
            stockQuantity: 20,
            status: 'ACTIVE',
        },
    });

    await prisma.product.create({
        data: {
            name: 'Royal Enfield Classic 350',
            description: 'Classic 350 Signals Series - Halcyon Black',
            category: 'Vehicles',
            brand: 'Royal Enfield',
            price: 215000,
            availableTenures: [12, 24, 36, 48],
            stockQuantity: 15,
            status: 'ACTIVE',
        },
    });

    console.log('   ✅ Created 5 products');

    // ==========================================
    // 5. LOAN APPLICATIONS (Various States)
    // ==========================================
    console.log('\n📝 Creating loan applications...');

    // Application 1: DISBURSED (Arpit - Standard LAMF)
    const app1 = await prisma.loanApplication.create({
        data: {
            applicationNumber: 'LA-2024-00001',
            userId: arpit.id,
            loanProductId: lamfStandard.id,
            requestedAmount: 500000,
            approvedAmount: 500000,
            selectedTenure: 24,
            status: 'DISBURSED',
            createdVia: 'PLATFORM',
        },
    });

    // Application 2: DISBURSED (Priya - No-Cost EMI for iPhone)
    const app2 = await prisma.loanApplication.create({
        data: {
            applicationNumber: 'LA-2024-00002',
            userId: priya.id,
            loanProductId: noCostEmi.id,
            productId: iphone.id,
            requestedAmount: 159900,
            approvedAmount: 159900,
            selectedTenure: 12,
            status: 'DISBURSED',
            createdVia: 'PLATFORM',
        },
    });

    // Application 3: APPROVED (Amit - Premium LAMF)
    const app3 = await prisma.loanApplication.create({
        data: {
            applicationNumber: 'LA-2024-00003',
            userId: amit.id,
            loanProductId: lamfPremium.id,
            requestedAmount: 1000000,
            approvedAmount: 900000,
            selectedTenure: 36,
            status: 'APPROVED',
            createdVia: 'PLATFORM',
        },
    });

    // Application 4: UNDER_REVIEW (Neha)
    await prisma.loanApplication.create({
        data: {
            applicationNumber: 'LA-2024-00004',
            userId: neha.id,
            loanProductId: lamfStandard.id,
            requestedAmount: 300000,
            selectedTenure: 18,
            status: 'UNDER_REVIEW',
            createdVia: 'PLATFORM',
        },
    });

    // Application 5: SUBMITTED (Partner - Groww)
    await prisma.loanApplication.create({
        data: {
            applicationNumber: 'LA-2024-00005',
            userId: arpit.id,
            partnerId: partner1.id,
            loanProductId: lamfStandard.id,
            requestedAmount: 200000,
            selectedTenure: 12,
            status: 'SUBMITTED',
            createdVia: 'PARTNER_API',
        },
    });

    // Application 6: REJECTED
    await prisma.loanApplication.create({
        data: {
            applicationNumber: 'LA-2024-00006',
            userId: amit.id,
            loanProductId: lamfStandard.id,
            requestedAmount: 5000000,
            selectedTenure: 60,
            status: 'REJECTED',
            rejectionReason: 'Insufficient collateral value',
            createdVia: 'PLATFORM',
        },
    });

    // Application 7: DRAFT
    await prisma.loanApplication.create({
        data: {
            applicationNumber: 'LA-2024-00007',
            userId: neha.id,
            loanProductId: noCostEmi.id,
            requestedAmount: 29990,
            selectedTenure: 6,
            status: 'DRAFT',
            createdVia: 'PLATFORM',
        },
    });

    console.log('   ✅ Created 7 loan applications');

    // ==========================================
    // 6. COLLATERALS
    // ==========================================
    console.log('\n🔒 Creating collaterals...');

    // Collateral for Arpit's loan (App 1)
    const col1 = await prisma.collateral.create({
        data: {
            loanApplicationId: app1.id,
            fundName: 'HDFC Mid-Cap Opportunities Fund',
            fundType: 'EQUITY',
            isin: 'INF179K01AA8',
            units: 5000,
            nav: 156.78,
            pledgedValue: 783900,
            currentValue: 810000,
            ltvApplied: 0.5,
            eligibleAmount: 405000,
            registrar: 'CAMS',
            lienStatus: 'MARKED',
        },
    });

    const col2 = await prisma.collateral.create({
        data: {
            loanApplicationId: app1.id,
            fundName: 'ICICI Prudential Bluechip Fund',
            fundType: 'EQUITY',
            isin: 'INF109K01BE9',
            units: 3000,
            nav: 89.45,
            pledgedValue: 268350,
            currentValue: 275000,
            ltvApplied: 0.5,
            eligibleAmount: 137500,
            registrar: 'CAMS',
            lienStatus: 'MARKED',
        },
    });

    // Collateral for Priya's loan (App 2)
    const col3 = await prisma.collateral.create({
        data: {
            loanApplicationId: app2.id,
            fundName: 'SBI Magnum Gilt Fund',
            fundType: 'DEBT',
            isin: 'INF200K01RV2',
            units: 4000,
            nav: 62.50,
            pledgedValue: 250000,
            currentValue: 255000,
            ltvApplied: 0.8,
            eligibleAmount: 204000,
            registrar: 'KFINTECH',
            lienStatus: 'MARKED',
        },
    });

    // Collateral for Amit's approved app (App 3)
    await prisma.collateral.create({
        data: {
            loanApplicationId: app3.id,
            fundName: 'Axis Nifty 50 Index Fund',
            fundType: 'EQUITY',
            isin: 'INF846K01DP8',
            units: 10000,
            nav: 210.25,
            pledgedValue: 2102500,
            currentValue: 2150000,
            ltvApplied: 0.5,
            eligibleAmount: 1075000,
            registrar: 'CAMS',
            lienStatus: 'PENDING',
        },
    });

    console.log('   ✅ Created 4 collaterals');

    // ==========================================
    // 7. LOANS (Disbursed)
    // ==========================================
    console.log('\n💰 Creating disbursed loans...');

    const loan1 = await prisma.loan.create({
        data: {
            loanNumber: 'LN-2024-00001',
            loanApplicationId: app1.id,
            principal: 500000,
            interestRate: 10.5,
            tenureMonths: 24,
            emiAmount: 23265,
            outstandingPrincipal: 425000,
            outstandingInterest: 3542,
            nextEmiDate: new Date('2025-01-15'),
            status: 'ACTIVE',
            disbursedAt: new Date('2024-10-15'),
        },
    });

    // Link collaterals to loan
    await prisma.collateral.update({
        where: { id: col1.id },
        data: { loanId: loan1.id },
    });
    await prisma.collateral.update({
        where: { id: col2.id },
        data: { loanId: loan1.id },
    });

    const loan2 = await prisma.loan.create({
        data: {
            loanNumber: 'LN-2024-00002',
            loanApplicationId: app2.id,
            principal: 159900,
            interestRate: 0,
            tenureMonths: 12,
            emiAmount: 13325,
            outstandingPrincipal: 133250,
            outstandingInterest: 0,
            nextEmiDate: new Date('2025-01-01'),
            status: 'ACTIVE',
            disbursedAt: new Date('2024-11-01'),
        },
    });

    await prisma.collateral.update({
        where: { id: col3.id },
        data: { loanId: loan2.id },
    });

    console.log('   ✅ Created 2 active loans');

    // ==========================================
    // 8. LOAN TRANSACTIONS
    // ==========================================
    console.log('\n📊 Creating transactions...');

    // Disbursement for Loan 1
    await prisma.loanTransaction.create({
        data: {
            loanId: loan1.id,
            type: 'DISBURSEMENT',
            amount: 500000,
            principalComponent: 500000,
            interestComponent: 0,
            balanceAfter: 500000,
            reference: 'NEFT/1FI/DIS/001',
        },
    });

    // EMI Payments for Loan 1
    for (let i = 1; i <= 3; i++) {
        await prisma.loanTransaction.create({
            data: {
                loanId: loan1.id,
                type: 'EMI_PAYMENT',
                amount: 23265,
                principalComponent: 18890 + (i * 100),
                interestComponent: 4375 - (i * 100),
                balanceAfter: 500000 - (i * 25000),
                reference: `NACH/1FI/EMI/${i.toString().padStart(3, '0')}`,
            },
        });
    }

    // Disbursement for Loan 2
    await prisma.loanTransaction.create({
        data: {
            loanId: loan2.id,
            type: 'DISBURSEMENT',
            amount: 159900,
            principalComponent: 159900,
            interestComponent: 0,
            balanceAfter: 159900,
            reference: 'NEFT/1FI/DIS/002',
        },
    });

    // EMI Payments for Loan 2
    for (let i = 1; i <= 2; i++) {
        await prisma.loanTransaction.create({
            data: {
                loanId: loan2.id,
                type: 'EMI_PAYMENT',
                amount: 13325,
                principalComponent: 13325,
                interestComponent: 0,
                balanceAfter: 159900 - (i * 13325),
                reference: `NACH/1FI/EMI/${(100 + i).toString()}`,
            },
        });
    }

    console.log('   ✅ Created 8 transactions');

    // ==========================================
    // 9. ORDERS (for No-Cost EMI)
    // ==========================================
    console.log('\n🛍️ Creating orders...');

    await prisma.order.create({
        data: {
            orderNumber: 'ORD-2024-00001',
            loanId: loan2.id,
            productId: iphone.id,
            quantity: 1,
            shippingAddress: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pin: '560001' },
            deliveryStatus: 'DELIVERED',
        },
    });

    console.log('   ✅ Created 1 order');

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📋 Summary:');
    console.log('   • 5 Users (1 admin, 4 borrowers)');
    console.log('   • 5 Customers with KYC data');
    console.log('   • 2 Partners (Groww, Zerodha)');
    console.log('   • 3 Loan Products');
    console.log('   • 5 Shopping Products');
    console.log('   • 7 Loan Applications (various states)');
    console.log('   • 4 Collaterals');
    console.log('   • 2 Active Loans');
    console.log('   • 8 Transactions');
    console.log('   • 1 Order');

    console.log('\n🔑 Login Credentials:');
    console.log('   Admin:  admin@1fi.in / admin123');
    console.log('   User:   arpit@example.com / user123');
    console.log('   User:   priya@example.com / user123');

    console.log('\n🔐 Partner API Keys:');
    console.log(`   Groww:   ${apiKey1}`);
    console.log(`   Zerodha: ${apiKey2}`);
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
