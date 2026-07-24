import { HeroSection } from "@/components/home/HeroSection"
import { CategorySection } from "@/components/home/CategorySection"
import { FeaturedSection } from "@/components/home/FeaturedSection"
import { GuestCtaBanner } from "@/components/home/GuestCtaBanner"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <CategorySection />
      <FeaturedSection />
      <GuestCtaBanner />
    </div>
  )
}
