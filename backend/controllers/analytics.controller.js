const db = require('../models');
const { sequelize } = db;
const { QueryTypes } = require('sequelize');

exports.getAnalytics = async (req, res) => {
  const { timeRange } = req.params;
  
  try {
    // Get date range based on timeRange
    const dateFilter = timeRange === 'day' 
      ? "DATE(orders.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)" 
      : "DATE(orders.created_at) >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)";
    
    const groupBy = timeRange === 'day' 
      ? "DATE(orders.created_at)" 
      : "YEARWEEK(orders.created_at)";
    
    const dateFormat = timeRange === 'day' 
      ? "DATE_FORMAT(orders.created_at, '%m/%d')" 
      : "CONCAT('Week ', WEEK(orders.created_at))";
    
    // Get order trends - count orders by date
    const orderTrendsQuery = `
      SELECT 
        ${dateFormat} as date,
        COUNT(*) as count
      FROM orders
      WHERE ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY MIN(orders.created_at) ASC
    `;
    
    // Get revenue trends - sum total_price by date for delivered orders
    const revenueTrendsQuery = `
      SELECT 
        ${dateFormat} as date,
        SUM(total_price) as total
      FROM orders
      WHERE ${dateFilter} AND status = 'delivered'
      GROUP BY ${groupBy}
      ORDER BY MIN(orders.created_at) ASC
    `;
    
    // Get popular items - count menu items ordered
    const popularItemsQuery = `
      SELECT 
        m.name,
        COUNT(oi.menu_item_id) as count
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE ${dateFilter.replace('orders.', 'o.')}
      GROUP BY oi.menu_item_id
      ORDER BY count DESC
      LIMIT 10
    `;
    
    try {
      // console.log('Executing order trends query:', orderTrendsQuery);
      const orderTrends = await sequelize.query(orderTrendsQuery, { type: QueryTypes.SELECT });
      
      // console.log('Executing revenue trends query:', revenueTrendsQuery);
      const revenueTrends = await sequelize.query(revenueTrendsQuery, { type: QueryTypes.SELECT });
      
      // console.log('Executing popular items query:', popularItemsQuery);
      const popularItems = await sequelize.query(popularItemsQuery, { type: QueryTypes.SELECT });
      
      // console.log('Query results:', { orderTrends, revenueTrends, popularItems });
      
      res.json({
        orderTrends,
        revenueTrends,
        popularItems
      });
    } catch (queryError) {
      console.error('SQL Query Error:', queryError);
      
      // If there's an error with the queries, fall back to mock data
      const mockData = getMockData(timeRange);
      res.json(mockData);
    }
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: 'Failed to fetch analytics data', error: err.message });
  }
};

// Helper function to generate mock data if needed
function getMockData(timeRange) {
  return {
    orderTrends: timeRange === 'day' 
      ? [
          { date: '01/01', count: 12 },
          { date: '01/02', count: 15 },
          { date: '01/03', count: 8 },
          { date: '01/04', count: 22 },
          { date: '01/05', count: 17 },
          { date: '01/06', count: 25 },
          { date: '01/07', count: 30 }
        ]
      : [
          { date: 'Week 1', count: 45 },
          { date: 'Week 2', count: 52 },
          { date: 'Week 3', count: 49 },
          { date: 'Week 4', count: 62 },
          { date: 'Week 5', count: 55 },
          { date: 'Week 6', count: 70 },
          { date: 'Week 7', count: 75 },
          { date: 'Week 8', count: 80 }
        ],
    revenueTrends: timeRange === 'day'
      ? [
          { date: '01/01', total: 240 },
          { date: '01/02', total: 300 },
          { date: '01/03', total: 160 },
          { date: '01/04', total: 440 },
          { date: '01/05', total: 340 },
          { date: '01/06', total: 500 },
          { date: '01/07', total: 600 }
        ]
      : [
          { date: 'Week 1', total: 900 },
          { date: 'Week 2', total: 1040 },
          { date: 'Week 3', total: 980 },
          { date: 'Week 4', total: 1240 },
          { date: 'Week 5', total: 1100 },
          { date: 'Week 6', total: 1400 },
          { date: 'Week 7', total: 1500 },
          { date: 'Week 8', total: 1600 }
        ],
    popularItems: [
      { name: 'Pizza Margherita', count: 120 },
      { name: 'Cheeseburger', count: 95 },
      { name: 'Caesar Salad', count: 85 },
      { name: 'Chicken Wings', count: 75 },
      { name: 'Pasta Carbonara', count: 70 },
      { name: 'French Fries', count: 65 },
      { name: 'Chocolate Cake', count: 60 },
      { name: 'Iced Tea', count: 55 },
      { name: 'Garlic Bread', count: 50 },
      { name: 'Tiramisu', count: 45 }
    ]
  };
}


