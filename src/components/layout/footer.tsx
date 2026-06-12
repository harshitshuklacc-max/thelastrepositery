import Link from "next/link";
import { Phone, MapPin, Mail } from "lucide-react";
import { AdminLoginDialog } from "@/components/home/admin-login-dialog";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold mb-4">
              SHOE<span className="text-red-500">MAFIA</span>
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Premium footwear destination in Bilaspur. Luxury shoes for every occasion.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
              <li><Link href="/shop?filter=new" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><AdminLoginDialog asLink /></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                <span>Bus Stand, Old Telephone Exchange Road, Telipara, Bilaspur, Chhattisgarh 495001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-500" />
                <a href="tel:07587555558" className="hover:text-white transition-colors">07587555558</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-red-500" />
                <a href="mailto:info@shoemafia.com" className="hover:text-white transition-colors">info@shoemafia.com</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Store Hours</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Mon - Sat: 10:00 AM - 9:00 PM</li>
              <li>Sunday: 11:00 AM - 8:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} SHOE MAFIA. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <AdminLoginDialog />
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
