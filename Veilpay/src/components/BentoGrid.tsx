import React from 'react';
import { BentoGrid as MagicGrid, BentoCard } from '@/components/ui/bento-grid';
import { ShieldCheck, ArrowDownCircle, Globe } from 'lucide-react';

const BentoGrid = ({ ref }: { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      ref={ref}
      id="features"
      className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24 mt-[4vh]"
    >
      <MagicGrid className="w-full max-w-5xl auto-rows-[320px] grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Main Wide Card - ZK Proofs */}
        <BentoCard
          name="ZK Proofs"
          className="col-span-1 md:col-span-2 md:row-span-1 bento-card border border-amber-500/20 bg-[#111]/80 backdrop-blur-xl shadow-2xl rounded-3xl"
          Icon={ShieldCheck}
          description="Prove a payment is valid without revealing sender, receiver, or amount. Zero-knowledge proofs keep every transaction cryptographically private."
          href="#security"
          cta="Learn more"
          background={
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute -top-24 -right-24 h-80 w-80 bg-amber-500/10 blur-[90px] rounded-full group-hover:bg-amber-500/20 transition-colors duration-500" />
            </div>
          }
        />

        {/* Square Card - Stealth Address */}
        <BentoCard
          name="Stealth Addresses"
          className="col-span-1 md:col-span-1 md:row-span-1 bento-card border border-amber-500/20 bg-[#141414]/80 backdrop-blur-xl shadow-xl rounded-3xl"
          Icon={ArrowDownCircle}
          description="EIP-5564 dual-key stealth addresses generate a fresh one-time address per transaction, breaking on-chain linkability across Stellar, EVM, Solana and Aptos."
          href="#stealth"
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
          className="col-span-1 md:col-span-1 md:row-span-1 bento-card border border-amber-500/20 bg-[#111111]/80 backdrop-blur-xl shadow-xl rounded-3xl"
          Icon={Globe}
          description="Send and receive Stellar privacy payments, Monero, Zcash and Midnight alongside Ethereum, Solana, Base, Arbitrum, Polygon and Aptos — one vault, full privacy."
          href="#ecosystem"
          cta="See supported assets"
          background={
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent to-white/5" />
              <div className="absolute -bottom-24 -left-24 h-80 w-80 bg-white/5 blur-[90px] rounded-full group-hover:bg-white/10 transition-colors duration-500" />
            </div>
          }
        />

      </MagicGrid>
    </div>
  );
};

BentoGrid.displayName = 'BentoGrid';

export default React.memo(BentoGrid);
