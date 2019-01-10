import { ENV } from './common';

const API_TOKENS = {
  'development':
    'a549ed0b287668fdcef031438d4350e1e96ec12e758499bc1360a03564becaf8',
  'production': 
    'cd95e9dcb918b2d45b94a10416eaed02df8727d7b6fdde4669a5fbcacefafe1b',
};

export default async function createCloudKit() {
  const onCloudKit = async (CloudKit) => {
    const container = CloudKit.getDefaultContainer();
    const db = container.privateCloudDatabase;
    return { container, db };
  };

  // Development
  if (window.CloudKit) {
    return await onCloudKit(window.CloudKit);
  }

  return await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.addEventListener('load', () => {
      const CloudKit = window.CloudKit;

      CloudKit.configure({
        containers: [{
          containerIdentifier: 'iCloud.com.indutny.DerivePass',
          apiTokenAuth: {
            apiToken: API_TOKENS[ENV],
            persist: true,
          },
          environment: ENV,
        }]
      });
      document.body.removeChild(script);

      resolve(onCloudKit(CloudKit));
    });
    script.addEventListener('error', (err) => reject(err));

    script.src = 'https://cdn.apple-cloudkit.com/ck/2/cloudkit.js';
    document.body.appendChild(script);
  });
}
