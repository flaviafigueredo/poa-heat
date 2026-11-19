import { ExtremesChapter } from "@/components/chapters/ExtremesChapter";
import { NightsChapter } from "@/components/chapters/NightsChapter";
import { TrendChapter } from "@/components/chapters/TrendChapter";
import { Opening } from "@/components/opening/Opening";

export default function Home() {
  return (
    <main>
      <Opening />
      <TrendChapter />
      <ExtremesChapter />
      <NightsChapter />
    </main>
  );
}
