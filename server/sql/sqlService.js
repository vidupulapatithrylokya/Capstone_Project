// server/sql/sqlService.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Real Prisma ACID Transactional SQL Operation:
 * Creates UserRecord + Payment + PaymentTransaction + AuditLog atomically in a single Prisma transaction.
 * If any step fails, the entire transaction rolls back.
 */
const createPaymentWithTransaction = async ({ email, name, amount, currency = "usd", gatewayTxId, description }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Find or create UserRecord table entry (PK: id, Index: email)
    let user = await tx.userRecord.findUnique({ where: { email } });
    if (!user) {
      user = await tx.userRecord.create({
        data: {
          email,
          name: name || "Customer",
          role: "student",
        },
      });
    }

    // 2. Create Payment record (PK: id, FK: userId -> UserRecord.id)
    const payment = await tx.payment.create({
      data: {
        userId: user.id,
        amount: Number(amount),
        currency: currency.toLowerCase(),
        status: "completed",
        description: description || "Course purchase",
      },
    });

    // 3. Create PaymentTransaction record (PK: id, FK: paymentId -> Payment.id)
    const transaction = await tx.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        transactionId: gatewayTxId || `stripe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        gateway: "stripe",
        status: "succeeded",
      },
    });

    // 4. Create AuditLog record (PK: id, Index: action)
    const audit = await tx.auditLog.create({
      data: {
        action: "PAYMENT_SUCCESS",
        entity: "Payment",
        entityId: payment.id,
        performedBy: user.email,
        details: `Processed payment of $${amount} ${currency.toUpperCase()}`,
      },
    });

    return { user, payment, transaction, audit };
  });
};

/**
 * Advanced Relational SQL Query Engine using Prisma ORM:
 * Implements JOINs (include user & transactions), WHERE filtering, ORDER BY, GROUP BY, and HAVING
 */
const getPaymentAnalytics = async () => {
  // 1. Relational JOINs (Payment -> UserRecord & PaymentTransaction) + WHERE filtering + ORDER BY sorting
  const recentPayments = await prisma.payment.findMany({
    where: { status: "completed" },
    include: {
      user: true,
      transactions: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // 2. Aggregate Query (Sum & Avg)
  const aggregate = await prisma.payment.aggregate({
    _sum: { amount: true },
    _avg: { amount: true },
    _count: { id: true },
  });

  // 3. Group By & Having Filtering (GROUP BY currency)
  const groupedByCurrency = await prisma.payment.groupBy({
    by: ["currency"],
    _sum: { amount: true },
    _count: { id: true },
    having: {
      amount: {
        _sum: {
          gt: 0,
        },
      },
    },
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    totalRevenue: Number((aggregate._sum.amount || 0).toFixed(2)),
    averagePayment: Number((aggregate._avg.amount || 0).toFixed(2)),
    totalCount: aggregate._count.id || 0,
    groupedByCurrency: groupedByCurrency.map((g) => ({
      currency: g.currency,
      count: g._count.id,
      totalAmount: g._sum.amount || 0,
    })),
    recentPayments,
    auditLogs,
  };
};

module.exports = {
  prisma,
  createPaymentWithTransaction,
  getPaymentAnalytics,
};
