const FEATURES = [
  {
    name: 'localStorage',
    test: () => window.localStorage,
  },
  {
    name: 'randomValues',
    test: () => window.crypto && window.crypto.getRandomValues,
  },
  {
    name: 'Web Workers',
    test: () => window.Worker,
  },
  {
    name: 'Web Assembly',
    test: () => window.WebAssembly && window.WebAssembly.instantiate,
  },
  {
    name: 'Promise',
    test: () => window.Promise,
  },
];

export default function missingFeatures() {
  const missing = [];
  for (const feature of FEATURES) {
    if (!feature.test()) {
      missing.push(feature.name);
    }
  }

  if (missing.length === 0) {
    return false;
  }

  return missing;
}
