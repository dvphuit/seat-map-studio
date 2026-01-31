import { useStageStore } from '../stores/stageStore';
import { useActivityLogStore } from '../stores/activityLogStore';
import { ExportSchema } from './schema';

export const importFromJSON = async (file: File): Promise<boolean> => {
    try {
        const text = await file.text();
        const rawData = JSON.parse(text);

        const validation = ExportSchema.safeParse(rawData);
        if (!validation.success) {
            console.error('Import validation failed:', validation.error);
            useActivityLogStore.getState().addLog('Invalid file format. Please select a valid JSON file.', 'error');
            return false;
        }

        const { stages } = validation.data;

        // Convert stages array back to Record
        const stagesRecord = stages.reduce((acc, stage) => {
            acc[stage.id] = stage;
            return acc;
        }, {} as Record<string, any>);

        const stageOrder = stages.map(s => s.id);

        // Update Store
        useStageStore.getState().setStages(stagesRecord, stageOrder);

        const totalElements = stages.reduce((acc, s) => acc + s.elements.length, 0);
        useActivityLogStore.getState().addLog(`Successfully imported layout. Loaded ${totalElements} elements.`, 'success');
        return true;
    } catch (error) {
        console.error('Import failed:', error);
        useActivityLogStore.getState().addLog('Failed to import layout. Is the file corrupted?', 'error');
        return false;
    }
};
