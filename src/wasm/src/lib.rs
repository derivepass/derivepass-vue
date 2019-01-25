extern crate dumb_crypto;
extern crate wasm_bindgen;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;
use dumb_crypto::{aes, aes_cbc, hmac, scrypt, sha256};

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

    let s = scrypt::Scrypt::new(r, n, p);

    s.derive(passphrase, salt, &mut out).expect("scrypt derivation to succeed");

    out
}

#[wasm_bindgen]
pub fn encrypt(
    aes_key: &[u8],
    mac_key: &[u8],
    iv: &[u8],
    payload: &[u8],
) -> Vec<u8> {
    let mut iv_arr = [0; aes::BLOCK_SIZE];
    iv_arr.copy_from_slice(iv);

    let mut cipher = aes_cbc::Cipher::new(iv_arr);
    cipher.init(aes_key).expect("cipher.init to succeed");

    let mut out = cipher.write(payload).expect("cipher.write to succeed");
    out.append(&mut cipher.flush().expect("cipher.flush to succed"));

    let mut hash = hmac::HMac::new(mac_key);
    hash.update(&out);
    out.append(&mut hash.digest().to_vec());

    out
}

#[wasm_bindgen]
pub fn decrypt(
    aes_key: &[u8],
    mac_key: &[u8],
    iv: &[u8],
    payload: &[u8],
) -> Vec<u8> {
    let mut iv_arr = [0; aes::BLOCK_SIZE];
    iv_arr.copy_from_slice(iv);

    if payload.len() < sha256::DIGEST_SIZE {
        panic!("Payload doesn't have enough bytes for MAC");
    }

    let mut content: Vec<u8> = payload.to_vec();
    let mac = content.split_off(content.len() - sha256::DIGEST_SIZE);

    let mut decipher = aes_cbc::Decipher::new(iv_arr);
    decipher.init(aes_key).expect("decipher.init to succeed");

    let mut out = decipher.write(&content).expect("cipher.write to succeed");
    out.append(&mut decipher.flush().expect("cipher.flush to succed"));

    let mut hash = hmac::HMac::new(mac_key);
    hash.update(&out);
    let digest = hash.digest().to_vec();

    let mut is_equal = 0;
    for (digest_elem, mac_elem) in digest.iter().zip(mac.iter()) {
        is_equal |= digest_elem ^ mac_elem;
    }
    if is_equal != 0 {
        panic!("Invalid digest");
    }

    out
}

#[wasm_bindgen]
pub fn decrypt_legacy(
    aes_key: &[u8],
    iv: &[u8],
    payload: &[u8],
) -> Vec<u8> {
    let mut iv_arr = [0; aes::BLOCK_SIZE];
    iv_arr.copy_from_slice(iv);

    let mut decipher = aes_cbc::Decipher::new(iv_arr);
    decipher.init(aes_key).expect("decipher.init to succeed");

    let mut out = decipher.write(payload).expect("cipher.write to succeed");
    out.append(&mut decipher.flush().expect("cipher.flush to succed"));

    out
}
