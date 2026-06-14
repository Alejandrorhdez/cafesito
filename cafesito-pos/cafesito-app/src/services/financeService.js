import { http } from './http';

export const saveFinanceReport = async (reportData) => {
    try {
        const response = await http.post('/finance', reportData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al guardar el reporte financiero';
    }
};

export const getFinanceReports = async () => {
    try {
        const response = await http.get('/finance');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al obtener los reportes financieros';
    }
};

export default {
    saveFinanceReport,
    getFinanceReports
};
