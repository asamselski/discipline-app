import { writeFile } from 'node:fs/promises';

const toBase64Url = (buffer) => Buffer.from(buffer)
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

const keyPair = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify'],
);
const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
const rawPublicKey = await crypto.subtle.exportKey('raw', keyPair.publicKey);
const publicKey = toBase64Url(rawPublicKey);

await writeFile('.vapid-private.json', JSON.stringify(privateJwk), { mode: 0o600 });
await writeFile('.vapid-public.txt', publicKey);

console.log('Klucze utworzone.');
console.log('VAPID_PUBLIC_KEY do wrangler.jsonc:');
console.log(publicKey);
console.log('\nNastępnie wykonaj: npx wrangler secret put VAPID_PRIVATE_JWK');
console.log('i wklej jedną linię z pliku .vapid-private.json.');
