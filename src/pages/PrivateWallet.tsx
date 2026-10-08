import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import GlassNavbar from '../components/GlassNavbar';
import NoiseOverlay from '../components/NoiseOverlay';
import BrutalistFooter from '../components/BrutalistFooter';
import ScrollProgress from '../components/ScrollProgress';

const CHAINS = [
  { name: 'Stellar (XLM)', desc: 'Native Stellar privacy payments using SEP-0041 confidential assets and memo-free stealth addresses.' },
  { name: 'Monero (XMR)', desc: 'Ring signatures and stealth addresses provide mandatory sender and receiver privacy on every transaction.' },
  { name: 'Zcash (ZEC)', desc: 'zk-SNARKs enable fully shielded transactions where sender, receiver, and amount are all hidden.' },
  { name: 'Ethereum (ETH)', desc: "EIP-5564 stealth addresses bring privacy to the world's largest smart contract platform." },
  { name: 'Solana (SOL)', desc: 'High-speed stealth addressing with sub-second finality and near-zero fees.' },
  { name: 'Base', desc: "L2 privacy through stealth addresses on Coinbase's Ethereum rollup." },
  { name: 'Arbitrum', desc: "Private payments on Ethereum's leading optimistic rollup with low gas costs." },
];

const FAQS = [
  {
    q: 'What is a private crypto wallet?',
    a: 'A private crypto wallet uses cryptographic techniques like stealth addresses and zero-knowledge proofs to hide transaction details (sender, receiver, amount) from public view on the blockchain. Unlike traditional wallets where all transactions are publicly visible, a privacy wallet ensures your financial activity remains confidential.',
  },
  {
    q: 'How are stealth addresses different from regular wallet addresses?',
    a: 'Regular wallet addresses are static — anyone who knows your address can track all incoming and outgoing transactions on a block explorer. Stealth addresses generate a unique, one-time address for every incoming payment using EIP-5564 dual-key cryptography. Only the recipient can discover and spend funds sent to these addresses, breaking on-chain linkability.',
  },
  {
    q: 'Is Veilpay custodial or non-custodial?',
    a: 'Veilpay is fully non-custodial. Your private keys are generated on your device and never leave it. We cannot access, freeze, or seize your funds. You maintain complete sovereignty over your crypto assets at all times.',
  },
  {
    q: 'Does Veilpay require KYC (Know Your Customer) verification?',
    a: 'No. Veilpay does not require KYC to create a vault or receive payments. Your master privacy key is generated locally. For fiat on-ramp features, third-party partners may have their own KYC requirements.',
  },
  {
    q: 'Which blockchains does Veilpay support?',
    a: 'Veilpay supports 7+ chains including Stellar, Monero, Zcash, Ethereum, Solana, Base, and Arbitrum. New chains are added regularly based on community demand and privacy capabilities.',
  },
  {
    q: 'What are zero-knowledge proofs and how does Veilpay use them?',
    a: 'Zero-knowledge proofs (ZK proofs) are cryptographic methods that allow one party to prove a statement is true without revealing any underlying information. Veilpay uses ZK proofs to verify payment validity — confirming a transaction is legitimate without exposing the sender, receiver, or amount to the public blockchain.',
  },
];

const PrivateWallet: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <ScrollProgress />
      <Helmet>
        <title>Private Crypto Wallet | Anonymous Non-Custodial Crypto Vault | Veilpay</title>
        <meta name="description" content="Veilpay is the most advanced private crypto wallet. Non-custodial vault with EIP-5564 stealth addresses, zero-knowledge proofs, and multi-chain privacy across Stellar, Monero, Zcash, Ethereum, and Solana." />
        <link rel="canonical" href="https://veilpayapp.com/private-wallet" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://veilpayapp.com/private-wallet" />
        <meta property="og:title" content="Private Crypto Wallet | Veilpay" />
        <meta property="og:description" content="The most advanced private crypto wallet with stealth addresses and ZK proofs across 7+ chains." />
        <meta property="og:image" content="https://veilpayapp.com/og.jpg" />
        <meta property="og:site_name" content="Veilpay" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Private Crypto Wallet | Veilpay" />
        <meta name="twitter:description" content="Non-custodial privacy vault with stealth addresses and ZK proofs across 7+ chains." />
        <meta name="twitter:image" content="https://veilpayapp.com/og.jpg" />
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Private Crypto Wallet — Veilpay",
              "description": "Veilpay is the most advanced private crypto wallet with EIP-5564 stealth addresses, zero-knowledge proofs, and multi-chain privacy.",
              "url": "https://veilpayapp.com/private-wallet",
              "publisher": {
                "@type": "Organization",
                "name": "Veilpay",
                "logo": { "@type": "ImageObject", "url": "https://veilpayapp.com/logo.webp" }
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": FAQS.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a }
              }))
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veilpayapp.com/" },
                { "@type": "ListItem", "position": 2, "name": "Private Wallet", "item": "https://veilpayapp.com/private-wallet" }
              ]
            }
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
              The Private Crypto Wallet
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              That Keeps You Anonymous
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-3xl leading-relaxed mx-auto md:mx-0">
            Veilpay is a <strong>non-custodial crypto vault</strong> that uses <strong>EIP-5564 stealth addresses</strong> and <strong>zero-knowledge proofs</strong> to make every transaction private by default. Send, receive, and hold crypto across 7+ blockchains without ever exposing your wallet address or financial history.
          </p>
        </header>

        {/* Why Privacy Matters */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">Why You Need a Private Crypto Wallet</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-amber-400 mb-3">Public Wallets Expose Everything</h3>
              <p className="text-neutral-400 leading-relaxed">
                Every Bitcoin, Ethereum, and Solana transaction is permanently recorded on a public blockchain. Anyone with your wallet address can see your entire financial history: how much you hold, who you've paid, and who has paid you. This creates serious privacy, security, and safety risks.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-amber-400 mb-3">Stealth Addresses Solve This</h3>
              <p className="text-neutral-400 leading-relaxed">
                Veilpay generates a unique, cryptographically derived <strong>one-time address for every incoming payment</strong>. Even if someone knows your public identifier, they cannot link any transaction to your vault. This is the same EIP-5564 standard being adopted across the Ethereum ecosystem.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">How Veilpay's Privacy Wallet Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Generate Your Privacy Key', desc: 'Create a master spending key and viewing key. These never leave your device. Your vault is fully non-custodial — only you control your crypto.' },
              { step: '02', title: 'Stealth Address Per Payment', desc: 'Every incoming payment generates a fresh one-time stealth address using EIP-5564 dual-key cryptography. No address reuse, no on-chain linkability.' },
              { step: '03', title: 'ZK Proof Verification', desc: 'Zero-knowledge proofs mathematically verify each payment is valid without revealing sender, receiver, or amount to the public blockchain.' },
            ].map((item) => (
              <div key={item.step} className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
                <span className="absolute -top-6 -left-2 text-6xl font-black text-white/5">{item.step}</span>
                <h3 className="text-xl font-bold text-amber-400 mb-3 relative z-10">{item.title}</h3>
                <p className="text-neutral-400 relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Supported Chains */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">Supported Privacy Chains</h2>
          <p className="text-neutral-400 mb-8 max-w-3xl leading-relaxed">
            Veilpay is the first wallet to unify <strong>native privacy coins</strong> (Monero, Zcash) with <strong>stealth-addressed transparent chains</strong> (Ethereum, Solana, Stellar) in a single interface. One vault, full privacy, across every chain that matters.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {CHAINS.map((chain) => (
              <div key={chain.name} className="flex gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-1">{chain.name}</h3>
                  <p className="text-sm text-neutral-400">{chain.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <summary className="cursor-pointer p-6 font-bold text-white flex items-center justify-between">
                  <span>{faq.q}</span>
                  <span className="text-amber-400 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-6 pb-6 text-neutral-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Ready for Private Crypto Payments?</h2>
          <p className="text-neutral-400 mb-8">Join the waitlist for early access to the most private crypto wallet ever built.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/#waitlist" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase bg-amber-500 text-black hover:bg-amber-400 rounded-full transition-colors">
              Join Waitlist
            </a>
          </div>
        </div>

        {/* Internal Links */}
        <nav className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-neutral-500 pt-8 border-t border-white/10">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/how-it-works" className="hover:text-amber-400 transition-colors">How It Works</Link>
          <a href="https://docs.veilpayapp.com" className="hover:text-amber-400 transition-colors">Documentation</a>
          <Link to="/blogs" className="hover:text-amber-400 transition-colors">Blog</Link>
          <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
        </nav>
      </main>

      <BrutalistFooter />
    </div>
  );
};

export default PrivateWallet;
