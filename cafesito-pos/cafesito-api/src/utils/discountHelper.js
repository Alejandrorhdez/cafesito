import Order from '../models/Order.js';

export const getDiscountPercentage = async (userId) => {
    if (!userId) return 0;
    
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    
    try {
        const purchasesCount = await Order.countDocuments({
            usuario: userId,
            createdAt: { $gte: seisMesesAtras },
            estado: { $nin: ['Cancelada'] }
        });
        
        if (purchasesCount === 0) return 0;
        if (purchasesCount >= 1 && purchasesCount <= 3) return 5;
        if (purchasesCount >= 4 && purchasesCount <= 7) return 10;
        if (purchasesCount >= 8) return 15;
    } catch (error) {
        console.error("Error al calcular el descuento:", error);
    }
    
    return 0;
};
