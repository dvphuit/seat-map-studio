import { getStageRef } from './canvasRef';
import { useActivityLogStore } from '../stores/activityLogStore';

export const exportToPNG = () => {
    const stage = getStageRef();
    if (!stage) {
        useActivityLogStore.getState().addLog('Could not find canvas to export.', 'error');
        return;
    }

    try {
        // High resolution export
        const dataURL = stage.toDataURL({
            pixelRatio: 3, // 3x for high quality
            mimeType: 'image/png'
        });

        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.download = `seat-layout-${timestamp}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        useActivityLogStore.getState().addLog('Successfully exported layout as PNG.', 'success');
    } catch (error) {
        console.error('PNG Export failed:', error);
        useActivityLogStore.getState().addLog('Failed to export image.', 'error');
    }
};
