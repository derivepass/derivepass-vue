const ENV = process.env === 'development' ? 'development' : 'production';
const API_TOKENS = {
  'development':
    '30bf89337751af96bf704397f1936a412551ec9f24b91819c07400cd7f6c4324',
  'production': 
    '3f90a4ad293a3e4b7005dfe5c4b3872eb9d5cc91041843a297750d047888f824',
};

export default new Promise((resolve, reject) => {
  // Development
  if (window.CloudKit) {
    resolve(window.CloudKit);
    return;
  }

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

    resolve(CloudKit);
  });
  script.addEventListener('error', (err) => reject(err));

  script.src = 'https://cdn.apple-cloudkit.com/ck/2/cloudkit.js';
  document.body.appendChild(script);
});
