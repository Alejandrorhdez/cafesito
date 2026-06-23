import Order from '../models/Order.js';

export const getDiscountPercentage = async (userId) => {
    if (!userId) return 0;
    
    try {
        const userOrders = await Order.find({
            usuario: userId,
            estado: { $nin: ['Cancelada'] }
        }).sort({ createdAt: -1 }).select('createdAt');
        
        if (userOrders.length === 0) return 0;

        const now = new Date();
        
        const isMoreThan6Months = (newerDate, olderDate) => {
            const limitDate = new Date(olderDate);
            limitDate.setMonth(limitDate.getMonth() + 6);
            return newerDate > limitDate;
        };

        if (isMoreThan6Months(now, userOrders[0].createdAt)) {
            return 0;
        }

        let purchasesCount = 1;

        for (let i = 1; i < userOrders.length; i++) {
            const newerOrderDate = userOrders[i - 1].createdAt;
            const olderOrderDate = userOrders[i].createdAt;

            if (isMoreThan6Months(newerOrderDate, olderOrderDate)) {
                break;
            }
            purchasesCount++;
        }
        
        if (purchasesCount === 0) return 0;
        if (purchasesCount >= 1 && purchasesCount <= 3) return 5;
        if (purchasesCount >= 4 && purchasesCount <= 7) return 10;
        if (purchasesCount >= 8) return 15;
    } catch (error) {
        console.error("Error al calcular el descuento:", error);
    }
    
    return 0;
};
