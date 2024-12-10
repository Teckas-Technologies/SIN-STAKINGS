'use client';
import './Header.css'
import { usePathname } from "next/navigation";
import Link from 'next/link';
const Header = () => {
  const pathname = usePathname();

  const nav = [
    { id: "home", label: "HOME", path: "/", icon: "/images/home.png" },
    { id: "stake", label: "STAKE", path: "/stake", icon: "/images/light.png" },
    { id: "account", label: "ACCOUNT", path: "/account", icon: "/images/honey.png" },
  ];
 
  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center items-center p-4 bg-[#0d0d0d] shadow-lg">
      <div className="flex justify-around items-center w-full max-w-7xl">
      <Link href="/">
          <div
            className="md:text-4xl text-xl font-bold text-[#eeb636] whitespace-nowrap cursor-pointer"
            style={{ fontFamily: 'saved-zero' }}
          >
            $SIN <span className="text-yellow-700">STAKING</span>
          </div>
        </Link>

        <div className="flex items-center space-x-8">
          <nav className="flex space-x-6">
            {nav.map((link) => (
              <a
                key={link.id}
                href={link.path}
                className={`flex flex-col items-center justify-center text-xs ${
                  pathname === link.path
                    ? "text-[#FFB742] underline decoration-[#FFB742] decoration-2 underline-offset-4"
                    : "text-[#eeb636]"
                } hover:text-[#FFB742] transition-all duration-300`}
              >
                <img src={link.icon} alt={`${link.label} Icon`} className="md:w-10 md:h-10 w-8 h-8" />
               <span className="text-[10px]" style={{fontFamily:'Garet-book'}}>{link.label}</span> 
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;
