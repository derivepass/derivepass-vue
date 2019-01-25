extern crate dumb_crypto;
extern crate wasm_bindgen;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
pub fn derive(
    r: usize,
    n: usize,
    p: usize,
    passphrase: &[u8],
    salt: &[u8],
    out_size: usize,
) -> Vec<u8> {
    let mut out: Vec<u8> = vec![0; out_size];

    let s = dumb_crypto::scrypt::Scrypt::new(r, n, p);

    s.derive(passphrase, salt, &mut out).unwrap();

    out
}
