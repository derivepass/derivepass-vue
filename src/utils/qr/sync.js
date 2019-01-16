import * as BloomFilter from 'bloom-filter';

export const VERSION = 1;
export const FILTER_COUNT = 1000;
export const FILTER_FALSE_POS = 1e-4;

export default class QRSync {
  constructor(io, options) {
    this.version = VERSION;
    this.io = io;
    this.options = options;
  }

  async run(applications) {
    const entries = applications.map((app) => {
      return JSON.stringify(app);
    });

    const tweak = (Math.random() * 0xffffffff) >>> 0;
    const bloom = BloomFilter.create(FILTER_COUNT, FILTER_FALSE_POS, tweak);

    for (const json of entries) {
      bloom.insert(json);
    }

    await this.io.send('init', {
      version: this.verison,
      bloom: bloom.toObject(),
    });

    const initResponse = await this.io.receive('init');
    if (initResponse.version !== this.version) {
      throw new Error('Devices are running different protocol versions');
    }

    const remoteBloom = new BloomFilter(initResponse);

    const missing = [];
    for (const json of entries) {
      if (!remoteBloom.contains(json)) {
        missing.push(json);
      }
    }

    if (remoteBloom.nTweak > bloom.nTweak) {
      await this.send(missing);
      return await this.receive();
    } else {
      const entries = await this.receive();
      await this.send(missing);
      return entries;
    }
  }

  async send(missing) {
    await this.io.send('allocate', {
      count: missing.length,
    });

    for (const json of missing) {
      await this.io.send('json', json);
    }
  }

  async receive() {
    const allocate = await this.io.receive('allocate');

    if (typeof allocate.count !== 'number') {
      throw new Error('Invalid remote entry count');
    }

    const result = [];
    for (let i = 0; i < allocate.count; i++) {
      const json = await this.io.receive('json');
      const entry = JSON.parse(json);

      result.push(entry);
      if (this.options.onProgress) {
        this.onProgress(i, allocate.count);
      }
      if (this.options.onEntry) {
        this.onEntry(entry);
      }
    }
    return result;
  }
}
