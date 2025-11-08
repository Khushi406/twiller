import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputField from './InputField';

describe('InputField', () => {
  it('renders input with placeholder and value', () => {
    const handleChange = jest.fn();
    render(
      <InputField
        type="text"
        name="test"
        placeholder="Test Placeholder"
        value=""
        onChange={handleChange}
      />
    );
    const input = screen.getByPlaceholderText('Test Placeholder') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('');
  });

  it('displays error message', () => {
    const handleChange = jest.fn();
    render(
      <InputField
        type="text"
        name="test"
        placeholder="Test Placeholder"
        value=""
        onChange={handleChange}
        error="This is an error"
      />
    );
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(
      <InputField
        type="text"
        name="test"
        placeholder="Test Placeholder"
        value=""
        onChange={handleChange}
      />
    );
    const input = screen.getByPlaceholderText('Test Placeholder') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
