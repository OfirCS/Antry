// Small row of social/website icons under the stat row. Since the demo
// data layer doesn't carry real handles, we derive plausible-looking URLs
// from the username — never invented real names. Real implementation will
// pull from `profiles.links`.

import { Github, X, Globe } from "lucide-react";

export function SocialLinks({ username }: { username: string }) {
  const links: { href: string; label: string; Icon: typeof Github }[] = [
    {
      href: `https://github.com/${username}`,
      label: `${username} on GitHub`,
      Icon: Github,
    },
    {
      href: `https://x.com/${username}`,
      label: `${username} on X`,
      Icon: X,
    },
    {
      href: `https://${username}.dev`,
      label: `${username}'s website`,
      Icon: Globe,
    },
  ];

  return (
    <div className="mt-3 flex items-center gap-1.5" aria-label="Builder links">
      {links.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="
            inline-flex items-center justify-center
            w-8 h-8 rounded-full
            text-gray-500 hover:text-black hover:-translate-y-0.5
            transition-all
          "
          style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
        >
          <Icon className="w-3.5 h-3.5" />
        </a>
      ))}
    </div>
  );
}
