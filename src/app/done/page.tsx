import { merge } from "@keegancodes/foundations";
import { GeistSans } from "geist/font/sans";

export default function RedeemPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const { imageUrl, resolution, style, quality } = searchParams;
  const downloadUrl = decodeURIComponent(imageUrl);

  let width = 1792;
  let height = 1024;

  if (resolution) {
    const [w, h] = resolution.split("x").map((v) => parseInt(v, 10));
    if (w && h) {
      width = w;
      height = h;
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 sm:p-12 md:p-24 w-full">
      <div
        className={merge(
          "z-10 w-full flex flex-col items-center bg-[rgba(0,0,0,0.2)] backdrop-blur-md text-white p-4 rounded-lg",
          GeistSans.className
        )}
      >
        <h1 className="text-center font-bold text-2xl pb-4 pt-2">
          Output Image
        </h1>
        <p className="pt-2 pb-6 text-left w-full">
          Here is your generated image! 
        </p>
        <div className="flex gap-4 pb-4">
          <p className="text-sm opacity-60 bg-[rgba(0,0,0,0.4)] p-2 rounded-lg">
            Resolution: {width}x{height}
          </p>
          <p className="text-sm opacity-60 bg-[rgba(0,0,0,0.4)] p-2 rounded-lg">
            Style: {style}
          </p>
          <p className="text-sm opacity-60 bg-[rgba(0,0,0,0.4)] p-2 rounded-lg">
            Quality: {quality}
          </p>
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={1792}
            height={1024}
            src={downloadUrl}
            alt="Generated Image"
          />
        </div>
        <div className="pt-6">
          <a
            href={downloadUrl}
            download
            className="whitespace-nowrap bg-[rgba(0,0,0,0.5)] p-2 rounded-lg hover:bg-[rgba(0,0,0,0.7)]"
          >
            Download
          </a>
        </div>
      </div>
    </main>
  );
}
