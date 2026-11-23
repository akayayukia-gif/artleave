// ポラロイド写真（Figma「案A/CharacterCard」）。イラストがまだ無いキャラは、色のグラデーションと人影で仮置きする。

const PALETTES = [
  ["#1b3b52", "#5d8fb0", "#e9e1b0"],
  ["#3a1e1a", "#8a4a32", "#e9c88a"],
  ["#0e2a26", "#2f7a62", "#d8d070"],
  ["#0a0a12", "#2a2240", "#8a7fb0"],
  ["#2a1a2a", "#7a4a6a", "#e9c0c8"],
  ["#0b1418", "#24485a", "#9fc0c8"],
] as const;

/** 同じキャラにはいつも同じ色が付くよう、IDから色を選ぶ */
function paletteFor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

export function PortraitPlaceholder({ seed, label }: { seed: string; label: string }) {
  const [a, b, c] = paletteFor(seed);
  const id = `g-${seed.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`;
  return (
    <svg
      viewBox="0 0 200 250"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
      className="block h-full w-full"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2=".6" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset=".6" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <rect width="200" height="250" fill={`url(#${id})`} />
      <circle cx="100" cy="104" r="30" fill="#000" opacity=".5" />
      <path d="M40 250 C44 176 74 152 100 152 C126 152 156 176 160 250Z" fill="#000" opacity=".5" />
    </svg>
  );
}

export function Polaroid({
  seed,
  name,
  imageUrl,
  caption,
  children,
}: {
  seed: string;
  name: string;
  imageUrl?: string | null;
  caption?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-paper px-2.5 pt-2.5 text-ink shadow-[0_16px_30px_rgb(0_0_0/0.5)]">
      <div className="film-tone aspect-[4/5] overflow-hidden bg-black">
        {imageUrl ? (
          // 認証つきの画像APIから読むため next/image の最適化は使わない
          // biome-ignore lint/performance/noImgElement: 上の理由
          <img src={imageUrl} alt={`${name}のイラスト`} className="h-full w-full object-cover" />
        ) : (
          <PortraitPlaceholder seed={seed} label={`${name}（イラスト未登録）`} />
        )}
      </div>
      <div className="px-1 pt-2.5 pb-3.5">
        <p className="truncate font-serif text-lg font-bold">{name}</p>
        {caption}
      </div>
      {children}
    </div>
  );
}
