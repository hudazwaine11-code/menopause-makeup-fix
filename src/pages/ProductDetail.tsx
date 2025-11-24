import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY } from "@/lib/shopify";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import beforeAfter1 from "@/assets/before-after-1.jpg";
import beforeAfter2 from "@/assets/before-after-2.jpg";
import freeBrush from "@/assets/free-brush.jpg";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const addItem = useCartStore(state => state.addItem);

  const { data, isLoading } = useQuery({
    queryKey: ['product', handle],
    queryFn: async () => {
      const response = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      return response.data.productByHandle;
    },
    enabled: !!handle,
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">This product doesn't exist or has been removed.</p>
        </div>
      </>
    );
  }

  const variant = data.variants.edges[selectedVariant]?.node;
  const price = parseFloat(variant?.price.amount || "0");
  const images = data.images.edges;

  const handleAddToCart = () => {
    if (!variant) return;

    const cartItem = {
      product: { node: data },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success("Added to cart", {
      description: `${data.title} has been added to your cart.`,
    });
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Product Section */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-secondary/20">
              {images[selectedImage]?.node ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || data.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText || `${data.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-sm">
                  <Gift className="w-3 h-3 mr-1" />
                  Free Brush Included
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Heat-Resistant Formula
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{data.title}</h1>
              <p className="text-3xl font-bold text-primary mb-6">
                {variant?.price.currencyCode} ${price.toFixed(2)}
              </p>
            </div>

            {data.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground text-lg leading-relaxed">{data.description}</p>
              </div>
            )}

            {data.options && data.options.length > 0 && (
              <div className="space-y-4">
                {data.options.map((option, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium mb-2">{option.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value, valueIdx) => {
                        const variantIndex = data.variants.edges.findIndex(
                          v => v.node.selectedOptions.some(opt => opt.value === value)
                        );
                        return (
                          <Button
                            key={valueIdx}
                            variant={selectedVariant === variantIndex ? "default" : "outline"}
                            onClick={() => setSelectedVariant(variantIndex)}
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full text-lg"
              onClick={handleAddToCart}
              disabled={!variant?.availableForSale}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {variant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
            </Button>

            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Heat-resistant formula perfect for hot flashes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Long-lasting coverage that won't melt or crease</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Designed specifically for mature skin</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Buildable coverage with lightweight feel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Free Brush Section */}
        <div className="mb-16 bg-gradient-hero rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge className="bg-primary text-primary-foreground">
                <Gift className="w-4 h-4 mr-2" />
                Limited Time Offer
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Free Professional Brush Included</h2>
              <p className="text-lg text-muted-foreground">
                Every purchase comes with our exclusive rose gold application brush, specially designed for precise under-eye coverage. The ultra-soft synthetic bristles ensure smooth, even application without tugging on delicate skin.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Premium synthetic bristles - cruelty free</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Rose gold ferrule for a luxurious feel</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Perfect size for precise under-eye application</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
              <img 
                src={freeBrush} 
                alt="Free Professional Brush" 
                className="relative z-10 w-full h-auto rounded-2xl shadow-elegant"
              />
            </div>
          </div>
        </div>

        {/* Before & After Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Results From Real Women</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how our heat-resistant formula stays flawless through hot flashes and daily challenges
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl shadow-elegant">
                <img 
                  src={beforeAfter1} 
                  alt="Before and after - Under eye transformation" 
                  className="w-full h-auto"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-sm font-semibold">Before → After</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-6">
                <p className="text-sm italic text-muted-foreground mb-2">
                  "I was amazed at how my under-eyes looked brighter and smoother. This corrector truly delivers on its promises."
                </p>
                <p className="text-sm font-semibold">- Sarah M., Age 52</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl shadow-elegant">
                <img 
                  src={beforeAfter2} 
                  alt="Before and after - Hot flash test" 
                  className="w-full h-auto"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-sm font-semibold">During Hot Flash → After</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-6">
                <p className="text-sm italic text-muted-foreground mb-2">
                  "Finally, makeup that actually stays put during a hot flash! I don't have to worry about touch-ups anymore."
                </p>
                <p className="text-sm font-semibold">- Jennifer K., Age 48</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="mb-16 bg-muted/30 rounded-3xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">How to Use</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Prep Your Skin</h3>
                  <p className="text-muted-foreground">
                    Start with clean, moisturized skin. Let your moisturizer absorb for a minute before applying.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Apply with Free Brush</h3>
                  <p className="text-muted-foreground">
                    Using your complimentary brush, gently dab the corrector onto the under-eye area, starting from the inner corner and working outward.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Blend and Set</h3>
                  <p className="text-muted-foreground">
                    Gently pat with your ring finger to blend seamlessly. Let it set for 30 seconds before applying other makeup. No powder needed - the formula sets itself!
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Enjoy All-Day Coverage</h3>
                  <p className="text-muted-foreground">
                    Your under-eyes will stay flawless through hot flashes, humidity, and whatever your day brings. No touch-ups needed!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Why Women Love KRALE</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Heat-Resistant Technology</h3>
              <p className="text-muted-foreground text-sm">
                Our proprietary formula withstands temperatures up to 98°F, staying perfect through hot flashes and warm environments.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">12-Hour Wear</h3>
              <p className="text-muted-foreground text-sm">
                Long-lasting coverage that truly lasts. From morning coffee to evening dinner, your under-eyes stay flawless.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Mature Skin Friendly</h3>
              <p className="text-muted-foreground text-sm">
                Formulated specifically for women 45+. Won't settle into fine lines or emphasize texture.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Brightening Effect</h3>
              <p className="text-muted-foreground text-sm">
                Color-correcting pigments neutralize dark circles while light-reflecting particles illuminate the eye area.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Buildable Coverage</h3>
              <p className="text-muted-foreground text-sm">
                Layer for your desired coverage level. Lightweight formula never looks cakey or heavy.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Clean Formula</h3>
              <p className="text-muted-foreground text-sm">
                Free from parabens, sulfates, and phthalates. Dermatologist-tested and hypoallergenic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
