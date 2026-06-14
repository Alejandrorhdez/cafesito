import mongoose from 'mongoose';

const financeReportSchema = new mongoose.Schema({
    fechaReporte: { type: Date, default: Date.now, required: true },
    ventasHoy: { type: Number, required: true, default: 0 },
    ventasMes: { type: Number, required: true, default: 0 },
    ventasHistoricas: { type: Number, required: true, default: 0 },
    ordenesTotales: { type: Number, required: true, default: 0 },
    registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

const FinanceReport = mongoose.model('FinanceReport', financeReportSchema);
export default FinanceReport;
