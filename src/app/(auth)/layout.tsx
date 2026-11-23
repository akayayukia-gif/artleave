import Image from "next/image";

// ログイン前の画面（SC-01〜04）共通の枠（Figma 案A／ログイン）。
// 机の上に写真を散らし、右側に紙のカードを1枚テープで留める。写真は作者が撮影したもの。

const PHOTOS = [
  {
    src: "/photos/trees.jpg",
    className: "left-[-4%] top-[58%] h-[24vw] w-[30vw] rotate-[9deg] blur-[5px] opacity-75",
  },
  {
    src: "/photos/town.jpg",
    className: "right-[-3%] top-[-6%] h-[22vw] w-[25vw] -rotate-[11deg] blur-[5px] opacity-75",
  },
  {
    src: "/photos/beach.jpg",
    className: "right-[2%] top-[64%] h-[18vw] w-[21vw] rotate-6 blur-[5px] opacity-75",
  },
  {
    src: "/photos/beach.jpg",
    className: "left-[8%] top-[-8%] h-[20vw] w-[23vw] -rotate-6 blur-[5px] opacity-75",
  },
  {
    src: "/photos/railing.jpg",
    className: "left-[23%] top-[18%] h-[30vw] max-h-[440px] w-[38vw] max-w-[560px] -rotate-[4deg]",
  },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <g stroke="#d9c38f" fill="none" opacity=".7">
            <path d="M-20 380 C400 300 900 180 1460 60" strokeWidth="2" />
            <path d="M-20 392 C420 312 900 196 1460 74" strokeWidth="1" />
            <path d="M-20 620 C500 660 900 760 1460 880" strokeWidth="2" />
            <path d="M200 -20 C420 300 600 700 760 920" strokeWidth="1.2" opacity=".6" />
          </g>
        </svg>
        {PHOTOS.map((p) => (
          <div
            key={p.className}
            className={`absolute bg-paper p-3 pb-12 shadow-[0_18px_40px_rgb(0_0_0/0.55)] ${p.className}`}
          >
            <div className="film-tone relative h-full w-full">
              <Image src={p.src} alt="" fill sizes="40vw" className="object-cover" />
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.25fr_0.9fr]">
        <div>
          <p className="mb-6 font-serif text-2xl font-bold tracking-wider">Artリーブ</p>
          <p className="heading-film text-[clamp(2.2rem,5.6vw,5.2rem)]">
            <span className="block whitespace-nowrap">創った全てを、</span>
            <span className="block whitespace-nowrap">
              　ここに
              <span className="bg-linear-to-b from-[#a6f0b4] to-[#1f9b52] bg-clip-text text-transparent">
                綴
              </span>
              じる。
            </span>
          </p>
          <p className="mt-3 text-xs tracking-[0.4em] text-gold">ORIGINAL CHARACTER ARCHIVE</p>
        </div>
        <div className="paper-card fade-in relative w-full max-w-[400px] -rotate-[1.5deg] justify-self-center px-8 pt-9 pb-7 md:justify-self-end">
          <span className="tape -top-3.5 left-1/2 -translate-x-1/2 rotate-[4deg]" />
          {children}
        </div>
      </div>
    </main>
  );
}
