const Subscription = require("../Modals/Subscription");
const Config = {
  basePricePerModulePerMonth: 500, // ₹ — change as needed
  durationMonths: { '1month':1, '6month':6, '1year':12 },
  discounts: { '6month': 0.95, '1year': 0.9 }
};

function calcPrice(modulesCount, durationKey) {
  const months = Config.durationMonths[durationKey] || 1;
  const discount = Config.discounts[durationKey] || 1;
  return Math.round(modulesCount * Config.basePricePerModulePerMonth * months * discount);
}

exports.getPrice = (req, res) => {
  const modules = (req.query.modules || "").split(",").filter(Boolean);
  const duration = req.query.duration || "1month";
  const price = calcPrice(modules.length, duration);
  res.json({ success:true, price, modulesCount: modules.length, duration });
};

exports.subscribe = async (req, res) => {
  try {
    const { modules = [], duration = "1month", paymentRef } = req.body;
    const adminId = req.user.role === "admin" ? req.user.id : req.user.companyId;
    if (!adminId) return res.status(400).json({ success:false, message: "Admin/company not found" });

    const months = Config.durationMonths[duration] || 1;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + months*30*24*60*60*1000); // approximate months as 30 days

    const amount = calcPrice(modules.length, duration);

    // Create subscription (set previous active to expired)
    await Subscription.updateMany({ adminId, status: "active" }, { status: "expired" });

    const sub = await Subscription.create({
      adminId,
      modules,
      startDate,
      endDate,
      isTrial: false,
      planType: duration,
      amountPaid: amount,
      paymentRef: paymentRef || "manual"
    });

    res.json({ success:true, message: "Subscription activated", data: sub });
  } catch (err) {
    console.error("Subscribe error", err);
    res.status(500).json({ success:false, message: "Error creating subscription" });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const adminId =
      req.user.role === "admin" ? req.user.id : req.user.companyId;
    const sub = await Subscription.findOne({ adminId }).sort({ createdAt: -1 });

    // If no subscription found
    if (!sub) {
      const trialEnd = new Date("2025-10-20T00:00:00.000Z"); // ya dynamically set karo registration date se
      const now = new Date();
      const remainingDays = Math.max(
        0,
        Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
      );

      const isExpired = remainingDays <= 0;

      return res.json({
        success: true,
        data: {
          isTrial: true,
          status: isExpired ? "expired" : "active",
          remainingDays,
          endDate: trialEnd,
          message: isExpired
            ? "Trial expired"
            : `Trial active, ${remainingDays} days left`,
        },
      });
    }

    // If subscription exists
    const now = new Date();
    const end = new Date(sub.endDate);
    const isActive = end > now && sub.status === "active";
    const remainingDays = Math.max(
      0,
      Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    );

    return res.json({
      success: true,
      data: {
        ...sub.toObject(),
        active: isActive,
        remainingDays,
        status: isActive ? "active" : "expired",
      },
    });
  } catch (err) {
    console.error("Error fetching subscription status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

