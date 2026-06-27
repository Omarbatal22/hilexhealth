import { Hero } from "@/components/sections/hero";
import { BookingSearch } from "@/components/sections/booking-search";
import { FeatureBar } from "@/components/sections/feature-bar";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";

export default function Home() {
  return (
    <>
      <Hero />
      <BookingSearch />
      <FeatureBar />
      <Services />
      <Stats />
    </>
  );
}
