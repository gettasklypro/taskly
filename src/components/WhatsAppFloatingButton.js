// WhatsAppFloatingButton.js
// Floating WhatsApp button for published sites
import React from 'react';

/**
 * Floating WhatsApp button component
 * Only renders if whatsapp_full_number is provided
 */
export default function WhatsAppFloatingButton({ whatsapp_full_number }) {
  if (!whatsapp_full_number) return null;
  return (
    <button
      onClick={() => window.open(`https://api.whatsapp.com/send?phone=${whatsapp_full_number}&text=Hello`, '_blank')}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: '#25D366',
        borderRadius: '50%',
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        border: 'none',
        cursor: 'pointer',
      }}
      aria-label="Chat on WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.693 4.607 2.01 6.553L4 29l7.684-2.01A11.96 11.96 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.933 0-3.77-.56-5.34-1.61l-.38-.24-4.56 1.19 1.22-4.44-.25-.39A9.94 9.94 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.03-7.47c-.276-.138-1.63-.805-1.882-.897-.252-.092-.435-.138-.618.138-.184.276-.71.897-.87 1.083-.161.184-.322.207-.598.069-.276-.138-1.165-.429-2.22-1.366-.82-.73-1.374-1.63-1.535-1.906-.161-.276-.017-.425.121-.563.124-.123.276-.322.414-.483.138-.161.184-.276.276-.46.092-.184.046-.345-.023-.483-.069-.138-.618-1.492-.847-2.043-.223-.536-.45-.463-.618-.471l-.527-.009c-.184 0-.483.069-.737.345-.253.276-.965.945-.965 2.303s.988 2.672 1.126 2.857c.138.184 1.944 2.97 4.716 4.048.66.285 1.174.456 1.575.583.661.211 1.263.181 1.737.11.53-.079 1.63-.666 1.862-1.308.23-.643.23-1.194.161-1.308-.069-.115-.253-.184-.529-.322z"/>
      </svg>
    </button>
  );
}
