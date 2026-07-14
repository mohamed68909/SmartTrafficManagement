import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Modal from './Modal';

// Mock the translation hook
vi.mock('../i18n/LanguageContext', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('Modal Component', () => {
  test('does not render when open is false', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Test Modal')).toBeNull();
    expect(screen.queryByText('Modal Content')).toBeNull();
  });

  test('renders when open is true', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  test('calls onClose when close button (x) is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    const closeButton = screen.getByRole('button', { name: /common.close/i });
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
