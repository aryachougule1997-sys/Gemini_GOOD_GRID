import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ColorPicker from '../ColorPicker';
import { ColorScheme } from '../../../../../shared/types';

const mockColorScheme: ColorScheme = {
  primary: '#FFB6C1',
  secondary: '#87CEEB',
  accent: '#98FB98'
};

const mockOnColorChange = jest.fn();

beforeEach(() => {
  mockOnColorChange.mockClear();
});

describe('ColorPicker', () => {
  it('renders all color sections', () => {
    render(<ColorPicker colorScheme={mockColorScheme} onColorChange={mockOnColorChange} />);
    
    expect(screen.getByText('Character Colors')).toBeInTheDocument();
    expect(screen.getByText('Skin Color:')).toBeInTheDocument();
    expect(screen.getByText('Shirt Color:')).toBeInTheDocument();
    expect(screen.getByText('Pants Color:')).toBeInTheDocument();
  });

  it('displays current color values in inputs', () => {
    render(<ColorPicker colorScheme={mockColorScheme} onColorChange={mockOnColorChange} />);
    
    const primaryInput = screen.getByLabelText(/skin color/i);
    const secondaryInput = screen.getByLabelText(/shirt color/i);
    const accentInput = screen.getByLabelText(/pants color/i);
    
    expect(primaryInput).toHaveValue('#FFB6C1');
    expect(secondaryInput).toHaveValue('#87CEEB');
    expect(accentInput).toHaveValue('#98FB98');
  });

  it('calls onColorChange when color input changes', () => {
    render(<ColorPicker colorScheme={mockColorScheme} onColorChange={mockOnColorChange} />);
    
    const primaryColorInput = screen.getByLabelText(/skin color/i);
    fireEvent.change(primaryColorInput, { target: { value: '#FF0000' } });
    
    expect(mockOnColorChange).toHaveBeenCalledWith({
      primary: '#FF0000',
      secondary: '#87CEEB',
      accent: '#98FB98'
    });
  });

  it('calls onColorChange when preset color is clicked', () => {
    render(<ColorPicker colorScheme={mockColorScheme} onColorChange={mockOnColorChange} />);
    
    const presetButtons = screen.getAllByRole('button');
    const firstPresetButton = presetButtons[0];
    
    fireEvent.click(firstPresetButton);
    
    expect(mockOnColorChange).toHaveBeenCalled();
  });

  it('renders preset color buttons with correct styles', () => {
    render(<ColorPicker colorScheme={mockColorScheme} onColorChange={mockOnColorChange} />);
    
    const presetButtons = screen.getAllByRole('button');
    
    // Should have multiple preset buttons (5 per color section * 3 sections = 15)
    expect(presetButtons.length).toBeGreaterThan(10);
    
    // Check that buttons have background colors
    presetButtons.forEach(button => {
      expect(button).toHaveStyle({ backgroundColor: expect.any(String) });
    });
  });

  it('updates secondary color correctly', () => {
    render(<ColorPicker colorScheme={mockColorScheme} onColorChange={mockOnColorChange} />);
    
    const secondaryColorInput = screen.getByLabelText(/shirt color/i);
    fireEvent.change(secondaryColorInput, { target: { value: '#00FF00' } });
    
    expect(mockOnColorChange).toHaveBeenCalledWith({
      primary: '#FFB6C1',
      secondary: '#00FF00',
      accent: '#98FB98'
    });
  });

  it('updates accent color correctly', () => {
    render(<ColorPicker colorScheme={mockColorScheme} onColorChange={mockOnColorChange} />);
    
    const accentColorInput = screen.getByLabelText(/pants color/i);
    fireEvent.change(accentColorInput, { target: { value: '#0000FF' } });
    
    expect(mockOnColorChange).toHaveBeenCalledWith({
      primary: '#FFB6C1',
      secondary: '#87CEEB',
      accent: '#0000FF'
    });
  });

  it('has accessible labels for color inputs', () => {
    render(<ColorPicker colorScheme={mockColorScheme} onColorChange={mockOnColorChange} />);
    
    expect(screen.getByLabelText(/skin color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shirt color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pants color/i)).toBeInTheDocument();
  });
});