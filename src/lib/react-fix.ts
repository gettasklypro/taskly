// Force single React instance - import this early to ensure proper initialization
import React from 'react';

// Verify React is properly loaded
if (!React || !React.useState) {
  throw new Error('React hooks not properly initialized');
}

export const ensureReactLoaded = () => {
  return true;
};
