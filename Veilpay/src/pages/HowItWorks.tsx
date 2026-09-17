import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import GlassNavbar from '../components/GlassNavbar';
import NoiseOverlay from '../components/NoiseOverlay';
import BrutalistFooter from '../components/BrutalistFooter';
import ScrollProgress from '../components/ScrollProgress';

const STEPS = [
  {
    title: 'Key Generation',
    desc: 'When you create a Veilpay vault, a master spending key and a viewing key are generated on your device using industry-standard BIP-39 mnemonics and Ed25519 / secp256k1 curves (depending on the chain). These keys never leave your device and are never transmitted to Veilpay servers.',
    detail: 'The spending key controls fund access. The viewing key allows you to scan the blockchain for incoming payments without the ability to spend. This dual-key architecture is the foundation of EIP-5564 stealth addressing.',
  },
  {
    title: 'Stealth Meta-Address Publication',
    desc: 'Your vault publishes a stealth meta-address — a compressed public key pair that anyone can use to derive a one-time payment address for you. This meta-address is NOT your actual wallet address; it\'s a cryptographic generator that produces unlimited unique addresses.',
    detail: 'When someone wants to send you funds, they combine your stealth meta-address with a random ephemeral key to derive a fresh address that only you can discover. The ephemeral public key is posted on-chain as a tag, but reveals nothing about the recipient.',
  },
  {
    title: 'Payment Derivation',
    desc: 'The sender generates a one-time stealth address using Diffie-Hellman key exchange between their ephemeral key and your stealth meta-address. They send funds to this fresh address and publish the ephemeral public key on-chain.',
    detail: 'Each payment goes to a mathematically unique address. Even if the same person sends you 10 payments, each goes to a different address. On-chain observers see 10 unrelated addresses with no connection to each other or to your known identity.',
  },
  {
    title: 'Scanning & Discovery',
    desc: 'Your Veilpay vault periodically scans new on-chain ephemeral key announcements. Using your viewing key, it performs a trial computation on each announcement to determine if the resulting address belongs to you.',
    detail: 'This is computationally lightweight — a single elliptic curve multiplication per announcement. When a match is found, the vault derives the full spending key for that specific stealth address, adding the funds to your balance.',
  },
  {
    title: 'Zero-Knowledge Verification',
    desc: 'For chains that support it, Veilpay wraps outgoing payments in zero-knowledge proofs (zk-SNARKs or zk-STARKs). These proofs mathematically guarantee the transaction is valid — correct amounts, no double-spending — without revealing any details.',
    detail: 'On Zcash this uses the Sapling/Orchard circuits. On Ethereum L2s, Veilpay integrates with privacy pools and ZK-rollup frameworks. The result: validators confirm the transaction is legitimate without learning who sent what to whom.',
  },
];

const HowItWorks: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <ScrollProgress />
      <Helmet>
        <title>How Stealth Addresses & ZK Proofs Work | Veilpay Privacy Technology</title>
        <meta name="description" content="Learn how Veilpay uses EIP-5564 stealth addresses and zero-knowledge proofs to make crypto payments private. Technical deep-dive into privacy wallet architecture." />
        <link rel="canonical" href="https://veilpayapp.com/how-it-works" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://veilpayapp.com/how-it-works" />
        <meta property="og:title" content="How Stealth Addresses & ZK Proofs Work | Veilpay" />
        <meta property="og:description" content="Technical deep-dive into EIP-5564 stealth addresses and ZK proofs powering Veilpay's private payments." />
        <meta property="og:image" content="https://veilpayapp.com/og.jpg" />
        <meta property="og:site_name" content="Veilpay" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How Stealth Addresses & ZK Proofs Work | Veilpay" />
        <meta name="twitter:description" content="Technical deep-dive into stealth addresses and zero-knowledge proofs for private crypto payments." />
        <meta name="twitter:image" content="https://veilpayapp.com/og.jpg" />
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "How Private Crypto Payments Work with Stealth Addresses",
              "description": "Step-by-step explanation of how Veilpay uses EIP-5564 stealth addresses and zero-knowledge proofs to ensure private cryptocurrency payments.",
              "step": STEPS.map((s, i) => ({
                "@type": "HowToStep",
                "position": i + 1,
                "name": s.title,
                "text": s.desc,
              })),
              "tool": [
                { "@type": "HowToTool", "name": "Veilpay Privacy Wallet" },
                { "@type": "HowToTool", "name": "EIP-5564 Stealth Addresses" },
                { "@type": "HowToTool", "name": "Zero-Knowledge Proofs" },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "TechArticle",
              "headline": "How Stealth Addresses & ZK Proofs Work",
              "description": "Technical deep-dive into EIP-5564 stealth addresses and zero-knowledge proofs powering Veilpay's private crypto payments.",
              "url": "https://veilpayapp.com/how-it-works",
              "author": { "@type": "Organization", "name": "Veilpay", "url": "https://veilpayapp.com/" },
              "publisher": {
                "@type": "Organization",
                "name": "Veilpay",
                "logo": { "@type": "ImageObject", "url": "https://veilpayapp.com/logo.webp" },
              },
              "datePublished": "2025-06-01",
              "dateModified": "2026-07-19",
              "image": "https://veilpayapp.com/og.jpg",
              "keywords": "stealth addresses, EIP-5564, zero-knowledge proofs, ZK proofs, private crypto payments, non-custodial wallet",
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veilpayapp.com/" },
                { "@type": "ListItem", "position": 2, "name": "How It Works", "item": "https://veilpayapp.com/how-it-works" },
              ],
            },
          ])}
        </script>
      </Helmet>

      <NoiseOverlay />
      <GlassNavbar />

      <main className="mx-auto max-w-5xl px-6 pt-32 pb-24 md:pt-48">
        {/* Hero */}
        <header className="mb-16 md:mb-24 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              How Stealth Addresses
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              & ZK Proofs Work
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-3xl leading-relaxed mx-auto md:mx-0">
            A technical deep-dive into how Veilpay uses <strong>EIP-5564 stealth addresses</strong> and <strong>zero-knowledge proofs</strong> to make cryptocurrency payments truly private across 7+ blockchains.
          </p>
        </header>

        {/* What is EIP-5564 */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">What is EIP-5564?</h2>
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10 backdrop-blur-sm">
            <p className="text-neutral-400 leading-relaxed mb-4">
              <strong className="text-white">EIP-5564</strong> (Ethereum Improvement Proposal 5564) defines a standard for <strong>stealth addresses</strong> on EVM-compatible blockchains. It was authored by Vitalik Buterin and others as a way to bring receiver privacy to Ethereum without requiring a separate privacy chain.
            </p>
            <p className="text-neutral-400 leading-relaxed mb-4">
              The core idea: instead of publishing a single static receiving address, you publish a <strong>stealth meta-address</strong> — a pair of public keys that anyone can use to generate a unique, one-time payment address for you. Only you, with your corresponding private keys, can discover and spend funds sent to these derived addresses.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              Veilpay extends EIP-5564 beyond Ethereum to work across <strong>Stellar, Solana, and other chains</strong> using equivalent elliptic curve operations, creating the first truly multi-chain stealth address implementation.
            </p>
          </div>
        </section>

        {/* Step by Step */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">The Privacy Payment Lifecycle</h2>
          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8 md:p-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-black text-amber-400/30">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="text-2xl font-bold text-amber-400">{step.title}</h3>
                </div>
                <p className="text-neutral-300 leading-relaxed mb-4">{step.desc}</p>
                <p className="text-neutral-500 leading-relaxed text-sm border-l-2 border-amber-400/30 pl-4">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ZK Proofs Deep Dive */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Zero-Knowledge Proofs Explained</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-amber-400 mb-3">What Are ZK Proofs?</h3>
              <p className="text-neutral-400 leading-relaxed">
                A zero-knowledge proof is a cryptographic protocol where a <strong>prover</strong> can convince a <strong>verifier</strong> that a statement is true without revealing any information beyond the truth of the statement itself. In crypto payments, this means proving a transaction is valid (correct amounts, no double-spending) without revealing who sent what to whom.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-amber-400 mb-3">How Veilpay Uses ZK Proofs</h3>
              <p className="text-neutral-400 leading-relaxed">
                Veilpay combines <strong>zk-SNARKs</strong> (on Zcash) and <strong>Bulletproofs</strong> (on Monero-style chains) with stealth addresses to create a layered privacy system. Stealth addresses hide the recipient. ZK proofs hide the amount and validate the transaction. Together, they make every payment fully private.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">Veilpay vs. Other Privacy Solutions</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.05]">
                <tr>
                  <th className="p-4 font-bold text-white">Feature</th>
                  <th className="p-4 font-bold text-amber-400">Veilpay</th>
                  <th className="p-4 font-bold text-neutral-400">Mixers/Tumblers</th>
                  <th className="p-4 font-bold text-neutral-400">Single-Chain Privacy</th>
                </tr>
              </thead>
              <tbody className="text-neutral-400">
                <tr className="border-t border-white/5">
                  <td className="p-4 font-medium text-white">Multi-Chain</td>
                  <td className="p-4 text-green-400">✓ 7+ chains</td>
                  <td className="p-4 text-red-400">✗ Usually 1</td>
                  <td className="p-4 text-red-400">✗ 1 chain</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="p-4 font-medium text-white">Non-Custodial</td>
                  <td className="p-4 text-green-400">✓ Always</td>
                  <td className="p-4 text-red-400">✗ Custodial risk</td>
                  <td className="p-4 text-green-400">✓ Varies</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="p-4 font-medium text-white">Stealth Addresses</td>
                  <td className="p-4 text-green-400">✓ EIP-5564</td>
                  <td className="p-4 text-red-400">✗ No</td>
                  <td className="p-4 text-amber-400">~ Some</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="p-4 font-medium text-white">ZK Proofs</td>
                  <td className="p-4 text-green-400">✓ Multi-scheme</td>
                  <td className="p-4 text-red-400">✗ No</td>
                  <td className="p-4 text-amber-400">~ Chain-specific</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="p-4 font-medium text-white">No KYC Required</td>
                  <td className="p-4 text-green-400">✓</td>
                  <td className="p-4 text-amber-400">~ Varies</td>
                  <td className="p-4 text-green-400">✓</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="p-4 font-medium text-white">Fiat On-Ramps</td>
                  <td className="p-4 text-green-400">✓ Built-in</td>
                  <td className="p-4 text-red-400">✗ No</td>
                  <td className="p-4 text-red-400">✗ Rare</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Experience Private Crypto Payments</h2>
          <p className="text-neutral-400 mb-8">Join thousands already on the waitlist for the most private multi-chain wallet.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/#waitlist" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase bg-amber-500 text-black hover:bg-amber-400 rounded-full transition-colors">
              Join Waitlist
            </a>
            <Link to="/private-wallet" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase border border-white/20 text-white hover:border-amber-400 hover:text-amber-400 rounded-full transition-colors">
              Explore Privacy Features
            </Link>
          </div>
        </div>

        {/* Internal Links */}
        <nav className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-neutral-500 pt-8 border-t border-white/10">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/private-wallet" className="hover:text-amber-400 transition-colors">Private Wallet</Link>
          <a href="https://docs.veilpayapp.com" className="hover:text-amber-400 transition-colors">Documentation</a>
          <Link to="/blogs" className="hover:text-amber-400 transition-colors">Blog</Link>
          <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
        </nav>
      </main>

      <BrutalistFooter />
    </div>
  );
};

export default HowItWorks;
