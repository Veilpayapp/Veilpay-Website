import React, { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { BentoCard } from '@/components/ui/bento-grid';
import { ShieldCheck, ArrowDownCircle, Globe } from 'lucide-react';

const BentoGrid = ({ ref }: { ref?: React.Ref<HTMLDivElement> }) => {
  const [showZkPopup, setShowZkPopup] = useState(false);
  const [showStealthPopup, setShowStealthPopup] = useState(false);
  const [showTokensPopup, setShowTokensPopup] = useState(false);

  useEffect(() => {
    const handleZk = () => setShowZkPopup(true);
    const handlePrivacy = () => setShowStealthPopup(true);
    const handleTokens = () => setShowTokensPopup(true);

    window.addEventListener('openZkPopup', handleZk);
    window.addEventListener('openPrivacyPopup', handlePrivacy);
    window.addEventListener('openTokensPopup', handleTokens);

    return () => {
      window.removeEventListener('openZkPopup', handleZk);
      window.removeEventListener('openPrivacyPopup', handlePrivacy);
      window.removeEventListener('openTokensPopup', handleTokens);
    };
  }, []);

  return (
    <div
      ref={ref}
      id="features"
      className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-center items-center md:items-start px-4 md:px-16 lg:px-24 mt-[4vh]"
    >
      <div className="flex flex-col w-full max-w-2xl md:max-w-[45vw] lg:max-w-[min(64rem,50vw)] gap-[clamp(1rem,2vw,1.5rem)]">

        {/* Wide Card - ZK Proofs (full width of the column) */}
        <BentoCard
          name="ZK Proofs"
          className="bento-card w-full min-w-0 flex-none md:flex-1 min-h-[200px] md:h-[clamp(220px,30vh,340px)] border border-amber-500/20 bg-[#111]/95 md:bg-[#111]/80 md:backdrop-blur-xl shadow-2xl rounded-3xl"
          Icon={ShieldCheck}
          description="Prove a payment is valid without revealing sender, receiver, or amount. Zero-knowledge proofs keep every transaction cryptographically private."
          onClick={() => setShowZkPopup(true)}
          cta="Learn more"
          background={
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute -top-24 -right-24 h-80 w-80 bg-amber-500/10 blur-[90px] rounded-full group-hover:bg-amber-500/20 transition-colors duration-500" />
            </div>
          }
        />

        {/* Pair row — two equal, together-shrinking cards */}
        <div className="flex flex-col md:flex-row gap-[clamp(1rem,2vw,1.5rem)] w-full">
          {/* Square Card - Stealth Address */}
          <BentoCard
            name="Stealth Addresses"
            className="bento-card w-full flex-none md:flex-1 md:basis-0 min-w-0 min-h-[200px] md:h-[clamp(220px,30vh,340px)] border border-amber-500/20 bg-[#141414]/95 md:bg-[#141414]/80 md:backdrop-blur-xl shadow-xl rounded-3xl"
            Icon={ArrowDownCircle}
            description="EIP-5564 dual-key stealth addresses generate a fresh one-time address per transaction, breaking on-chain linkability across Stellar, EVM, Solana and Aptos."
            onClick={() => setShowStealthPopup(true)}
            cta="Explore privacy"
            background={
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5" />
                <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-white/5 blur-[90px] rounded-full group-hover:bg-white/10 transition-colors duration-500" />
              </div>
            }
          />

          {/* Square Card - Privacy Tokens */}
          <BentoCard
            name="Privacy Tokens"
            className="bento-card w-full flex-none md:flex-1 md:basis-0 min-w-0 min-h-[200px] md:h-[clamp(220px,30vh,340px)] border border-amber-500/20 bg-[#111111]/95 md:bg-[#111111]/80 md:backdrop-blur-xl shadow-xl rounded-3xl"
            Icon={Globe}
            description="Send and receive Stellar privacy payments, Monero, Zcash and Midnight alongside Ethereum, Solana, Base, Arbitrum, Polygon and Aptos - one vault, full privacy."
            onClick={() => setShowTokensPopup(true)}
            cta="See supported assets"
            background={
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-tl from-transparent to-white/5" />
                <div className="absolute -bottom-24 -left-24 h-80 w-80 bg-white/5 blur-[90px] rounded-full group-hover:bg-white/10 transition-colors duration-500" />
              </div>
            }
          />
        </div>

      </div>

      {/* Popups */}
      <AnimatePresence>
        {showZkPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowZkPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="ios-glass p-8 flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-4 border border-white/20 rounded-[32px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8B84B] to-[#B8791F] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(232,184,75,0.4)]">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Zero-Knowledge Proofs</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Zero-knowledge proofs allow us to mathematically prove a payment is valid without ever revealing the sender, receiver, or amount to the public ledger. Your transactions remain cryptographically private from end to end.
              </p>
              <button
                type="button"
                onClick={() => setShowZkPopup(false)}
                className="mt-2 ios-glass-gold px-6 py-2.5 rounded-full text-black font-bold text-sm uppercase tracking-wide w-full hover:brightness-110 transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}

        {showStealthPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowStealthPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="ios-glass p-8 flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-4 border border-white/20 rounded-[32px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8B84B] to-[#B8791F] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(232,184,75,0.4)]">
                <ArrowDownCircle className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Stealth Addressing</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                We implement EIP-5564 dual-key stealth addresses to generate a fresh, one-time address for every incoming transaction. This breaks on-chain linkability, ensuring your public financial history remains private on transparent networks.
              </p>
              <button
                onClick={() => setShowStealthPopup(false)}
                className="mt-2 ios-glass-gold px-6 py-2.5 rounded-full text-black font-bold text-sm uppercase tracking-wide w-full hover:brightness-110 transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}

        {showTokensPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTokensPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="ios-glass p-8 flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-4 border border-white/20 rounded-[32px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8B84B] to-[#B8791F] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(232,184,75,0.4)]">
                <Globe className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Privacy Assets</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Veilpay supports fully native privacy assets like Stellar, Monero, Zcash, and Midnight, alongside transparent chains like Ethereum, Solana, and Base. Choose the level of privacy that fits your needs in a single unified interface.
              </p>
              <button
                onClick={() => setShowTokensPopup(false)}
                className="mt-2 ios-glass-gold px-6 py-2.5 rounded-full text-black font-bold text-sm uppercase tracking-wide w-full hover:brightness-110 transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

BentoGrid.displayName = 'BentoGrid';

export default React.memo(BentoGrid);
