import React from 'react';
import UpgradeButton from './UpgradeButton';

// PricingPage: displays available plans and UpgradeButton for each
export default function PricingPage() {
  const plans = [
    { id: 'starter', name: 'Starter', price: '$10/mo', features: ['Basic tasks', 'Email support'] },
    { id: 'pro', name: 'Pro', price: '$30/mo', features: ['All features', 'Priority support'] },
  ];

  return (
    <div>
      <h1>Pricing</h1>
      <div className="plans-grid">
        {plans.map((p) => (
          <div key={p.id} className="plan-card">
            <h2>{p.name}</h2>
            <p>{p.price}</p>
            <ul>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <UpgradeButton planId={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
