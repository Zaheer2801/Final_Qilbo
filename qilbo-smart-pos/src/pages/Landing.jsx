import React from "react";
import ScrollProgress from "@/components/landing/ScrollProgress";
import SiteHeader from "@/components/landing/SiteHeader";
import Hero from "@/components/landing/Hero";
import LogoMarquee from "@/components/landing/LogoMarquee";
import BentoFeatures from "@/components/landing/BentoFeatures";
import Workflows from "@/components/landing/Workflows";
import StatsSection from "@/components/landing/StatsSection";
import DemoSection from "@/components/landing/DemoSection";
import FAQ from "@/components/landing/FAQ";
import CTASection from "@/components/landing/CTASection";
import SiteFooter from "@/components/landing/SiteFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-body">
      <ScrollProgress />
      <SiteHeader />
      <Hero />
      <LogoMarquee />
      <BentoFeatures />
      <Workflows />
      <StatsSection />
      <DemoSection />
      <FAQ />
      <CTASection />
      <SiteFooter />
    </div>
  );
}