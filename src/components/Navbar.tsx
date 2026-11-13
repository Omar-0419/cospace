import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/spaces", label: "Espacios" },
  { href: "/reservations", label: "Reservas" },
  { href: "/admin/spaces", label: "Administración" },
];

export function Navbar() {
  return (
    <header className="border-b border-muted-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          CoSpace Basic
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
