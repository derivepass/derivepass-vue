# DerivePass

*Compute secure passwords without storing them anywhere*

## About

DerivePass - is Password Manager that never stores your passwords anywhere: not
in the Cloud, and not even locally! Instead, the passwords are generated
on-the-fly by using the Master Password and the combination of domain-name and
login. This way, the passwords are unique for each website and at the same time
compromising a single password does not compromise others.

The project is a [VueJS](https://vuejs.org/) application, written in a
JavaScript language. The online version is hosted on [Now][now],
while the standalone version is an [Electron](https://electronjs.org/) app.

## Project setup

You'll need to download the dependencies to run DerivePass locally:

```
npm install
```

### Development

This command will start a local web-server, and will update the application
through hot-reload mechanism.

```
npm run serve
```

### Publishing

Every build is automatically deployed to [Now][now], and the latest master
commit lives at https://dev.derivepass.com/.

Manual builds could be triggered by:

```
npm run build
```

Electron builds:

```
npm run electron:build
```

...or just electron app (using the latest build output):

```
npm run electron
```

New releases of electron app could be published with:
```
npm run electron:publish
```

NOTE: requires `GH_TOKEN` env variable and appropriate developer certificates
in the Keychain for macOS builds.

### Running tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Credits

* [Òscar Casajuana](https://github.com/elboletaire) - Catalan translation

#### LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2019.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

[now]: https://zeit.co/now
