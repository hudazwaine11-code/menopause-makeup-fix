import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <ProductGrid />
    </div>
  );
};

export default Index;
