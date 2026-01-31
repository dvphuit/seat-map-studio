import { useStageStore } from '../stores/stageStore';
import { ExportSchema, type ExportData } from './schema';

export const exportToJSON = () => {
    const stages = Object.values(useStageStore.getState().stages);

    const exportData: ExportData = {
        version: '1.2.0', // Bump version for new schema
        exportedAt: new Date().toISOString(),
        stages,
    };

    // Validate data before export
    const validation = ExportSchema.safeParse(exportData);
    if (!validation.success) {
        console.error('Export validation failed:', validation.error);
        throw new Error('Export data is invalid');
    }

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `seat-layout-${timestamp}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
