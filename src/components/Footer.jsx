import mavisIcon from "../assets/logos/mavis-icon.svg";
import github from "../assets/logos/github.svg";
import email from "../assets/logos/email.svg";
import linkedin from "../assets/logos/linkedin.svg";
import discord from "../assets/logos/discord.svg";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Security", href: "/security" },
  { label: "Terms of Service", href: "/terms" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com", icon: github },
  { label: "Email", href: "mailto:hello@mavis.com", icon: email },
  { label: "LinkedIn", href: "https://linkedin.com", icon: linkedin },
  { label: "Discord", href: "https://discord.com", icon: discord },
];

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-white">{title}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-[#f2efe8]/70 no-underline hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0b1b3a] px-5 py-12 text-[#f2efe8] sm:px-[10vw]">
      <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
        <img src={mavisIcon} alt="Mavis" className="h-12 w-auto" />

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-16">
          <FooterColumn title="Products" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 pt-6 text-sm sm:flex-row sm:items-center">
        <p className="text-white">© 2026 Mavis. Built by Students at CPUT</p>
        <div className="flex items-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="opacity-70 hover:opacity-100"
            >
              <img src={social.icon} alt="" className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;