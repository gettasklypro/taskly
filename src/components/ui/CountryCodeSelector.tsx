import React from 'react';

/**
 * Country code selector dropdown for WhatsApp input
 */
export default function CountryCodeSelector({ value, onChange, options }:{ value: string, onChange: (code: string) => void, options: { code: string, label: string }[] }) {
  return (
    <select
      className="border rounded px-2 py-1 bg-white"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt.code} value={opt.code}>{opt.code} {opt.label}</option>
      ))}
    </select>
  );
}
