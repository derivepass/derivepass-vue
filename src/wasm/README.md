This can be compiled with `wasm-pack`. Just run:

```sh
wasm-pack build
```

...and copy:

```sh
cp -rf src/wasm/pkg/derivepass_bg.wasm \
  src/store/derivepass/wasm/binding.wasm.bin
```
