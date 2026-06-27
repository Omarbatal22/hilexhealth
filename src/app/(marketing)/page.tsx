import { Hero } from "@/components/sections/hero";
import { FeatureBar } from "@/components/sections/feature-bar";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureBar />
      <Services />
      <Stats />
    </>
  );
}
