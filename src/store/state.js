import DerivePass from './derivepass';

export default () => {
  return {
    derivepass: new DerivePass(),
    cryptoKeys: null,
    emoji: '',
    master: '',
    applications: [],
    decryptedApps: [],
    settings: {
      cloudKitReady: false,
    }
  };
};
