import { EditorCanvas } from './components/canvas/EditorCanvas';
import { AppLayout } from './components/layout/AppLayout';
import { useActivityLogStore } from './stores/activityLogStore';
import { useEffect } from 'react';

function App() {
  const { addLog } = useActivityLogStore();

  useEffect(() => {
    addLog("Entered Single Stage Mode", "info", "system");
  }, [addLog]);

  return (
    <AppLayout>
      <EditorCanvas />
    </AppLayout>
  );
}

export default App;
