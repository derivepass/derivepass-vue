import DerivePass from './derivepass';

export default () => {
  return {
    derivepass: new DerivePass(),
    cryptoKeys: null,
    master: '',
    applications: [],
    decryptedApps: [],
    settings: {
      cloudKitReady: false,
    }
  };
};
