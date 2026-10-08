import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import GlassNavbar from '../components/GlassNavbar';
import NoiseOverlay from '../components/NoiseOverlay';
import BrutalistFooter from '../components/BrutalistFooter';
import ScrollProgress from '../components/ScrollProgress';

const CryptoDonations: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <ScrollProgress />
      <Helmet>
        <title>Accept Crypto Donations Privately | Anonymous Crypto Donation Platform</title>
        <meta
          name="description"
          content="The premier anonymous crypto donation platform. Accept crypto donations privately using stealth addresses and zero-knowledge proofs. No setup fees."
        />
        <link rel="canonical" href="https://veilpayapp.com/crypto-donations" />
      </Helmet>

      <NoiseOverlay />
      <GlassNavbar />

      <main className="mx-auto max-w-5xl px-6 pt-32 pb-24 md:pt-48">
        <header className="mb-16 md:mb-24 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              The Anonymous Crypto
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              Donation Platform
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed mx-auto md:mx-0">
            Accept crypto donations privately without exposing your public wallet address. Protect your donors' financial privacy with cross-chain stealth addresses and zero-knowledge proofs.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Why Stealth Addresses Matter for Donors</h2>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Traditional crypto donations force you to post a static public address. Anyone can look up that address on a block explorer and see exactly how much you've raised, who donated, and where those funds go next.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              Veilpay uses <strong>EIP-5564 stealth addresses</strong> to generate a unique, one-time destination address for every single donation. Your donors get complete anonymity, and your financial history remains strictly yours.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Supported Chains for Donations</h2>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Never miss a donation because you don't support a specific network. Veilpay's secure Web3 payment gateway unifies privacy across the most popular blockchains.
            </p>
            <ul className="space-y-4">
              {['Ethereum (ETH)', 'Solana (SOL)', 'Stellar (XLM)', 'Monero (XMR)', 'Zcash (ZEC)'].map((chain) => (
                <li key={chain} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-neutral-200 font-medium">{chain}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">How to Accept Private Crypto Donations</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Vault',
                desc: 'Sign up and generate your master privacy key. No KYC required to start accepting private payments.'
              },
              {
                step: '02',
                title: 'Share Your Link',
                desc: 'Generate a Veilpay donation link. You can embed this on your website, stream, or social media.'
              },
              {
                step: '03',
                title: 'Receive Anonymously',
                desc: 'Donors send funds. Veilpay automatically routes them through a one-time stealth address directly to your vault.'
              }
            ].map((item) => (
              <div key={item.step} className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
                <span className="absolute -top-6 -left-2 text-6xl font-black text-white/5">{item.step}</span>
                <h3 className="text-xl font-bold text-amber-400 mb-3 relative z-10">{item.title}</h3>
                <p className="text-neutral-400 relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
        
        <div className="text-center pb-12">
          <a
            href="/#waitlist"
            className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase bg-amber-500 text-black hover:bg-amber-400 rounded-full transition-colors"
          >
            Start Accepting Donations
          </a>
        </div>
      </main>

      <BrutalistFooter />
    </div>
  );
};

export default CryptoDonations;
