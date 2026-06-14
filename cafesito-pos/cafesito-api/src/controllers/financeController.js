import FinanceReport from '../models/FinanceReport.js';

export const crearReporte = async (req, res) => {
    try {
        const { ventasHoy, ventasMes, ventasHistoricas, ordenesTotales } = req.body;
        
        const nuevoReporte = new FinanceReport({
            ventasHoy,
            ventasMes,
            ventasHistoricas,
            ordenesTotales,
            registradoPor: req.usuario._id
        });
        
        await nuevoReporte.save();
        res.status(201).json({ mensaje: 'Reporte financiero guardado exitosamente', reporte: nuevoReporte });
    } catch (error) {
        console.error("Error al guardar reporte financiero:", error);
        res.status(400).json({ error: 'Error al guardar el reporte financiero' });
    }
};

export const obtenerReportes = async (req, res) => {
    try {
        const reportes = await FinanceReport.find()
            .populate('registradoPor', 'nombre email')
            .sort({ fechaReporte: -1 });
        res.json(reportes);
    } catch (error) {
        console.error("Error al obtener reportes financieros:", error);
        res.status(500).json({ error: 'Error al obtener los reportes financieros' });
    }
};

export default {
    crearReporte,
    obtenerReportes
};
