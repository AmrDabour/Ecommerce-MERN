const { OrderModel } = require("../models/orderModel.js");
const { UserModel } = require("../models/userModel.js");
const { ProductModel } = require("../models/productModel.js");
const { CategoryModel } = require("../models/categoryModel.js");

async function getDashboardStats(req, res) {
  try {
    // 1. Total active users (non-admin could be filtered if needed, but let's count all non-banned or all users)
    const totalUsers = await UserModel.countDocuments({ role: "user" });

    // 2. Total Orders and Revenue
    const orders = await OrderModel.find({ isPaid: true });
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // 3. Monthly Sales (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySales = await OrderModel.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format monthly sales for frontend
    const formattedMonthlySales = monthlySales.map(item => {
      const date = new Date(item._id.year, item._id.month - 1, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      return {
        month: `${monthName} ${item._id.year}`,
        revenue: item.revenue,
        ordersCount: item.count
      };
    });

    // 4. Products by Category
    const productsByCategory = await ProductModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories", // MongoDB collection name for CategoryModel
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $unwind: "$categoryInfo"
      },
      {
        $project: {
          categoryName: "$categoryInfo.name",
          count: 1,
          _id: 0
        }
      }
    ]);

    // 5. Top 5 Most Purchased Products
    const topProducts = await ProductModel.find()
      .sort({ sold: -1 })
      .limit(5)
      .select("name imageCover price sold quantity");

    res.status(200).json({
      msg: "Stats fetched successfully",
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        monthlySales: formattedMonthlySales,
        productsByCategory,
        topProducts
      }
    });

  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ msg: "Error fetching dashboard stats", error: err.message });
  }
}

module.exports = { getDashboardStats };
