import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import kraleLogo from "@/assets/krale-logo.png";

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={kraleLogo} alt="KRALE" className="h-8" />
          </Link>
          
          <div className="flex items-center gap-4">
            <CartDrawer />
          </div>
        </div>
      </div>
    </nav>
  );
};
