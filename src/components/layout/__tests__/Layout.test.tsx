import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '../Header';
import { ToolDock } from '../../tools/ToolDock';
import { StageManager } from '../../stage-manager/StageManager';

describe('UI Components', () => {
    it('Header renders correctly', () => {
        render(<Header />);
        expect(screen.getByText('Seat Creator')).toBeDefined();
        // Check for zoom percentage (default 100%)
        expect(screen.getByText('100%')).toBeDefined();
    });

    it('ToolDock renders tools', () => {
        render(<ToolDock />);
        // Material symbols are rendered as text in span
        expect(screen.getByText('near_me')).toBeDefined();
        expect(screen.getByText('grid_on')).toBeDefined();
        expect(screen.getByText('event_seat')).toBeDefined();
    });

    it('StageManager shows default stage', () => {
        render(<StageManager />);
        expect(screen.getByText('Main Stage')).toBeDefined();
        expect(screen.getByText('Stage Manager')).toBeDefined();
    });
});
