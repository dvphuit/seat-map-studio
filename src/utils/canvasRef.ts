import Konva from 'konva';

let stageRef: Konva.Stage | null = null;

export const setStageRef = (ref: Konva.Stage | null) => {
    stageRef = ref;
};

export const getStageRef = () => stageRef;
