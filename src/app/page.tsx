import { ExtremesChapter } from "@/components/chapters/ExtremesChapter";
import { NightsChapter } from "@/components/chapters/NightsChapter";
import { SummerChapter } from "@/components/chapters/SummerChapter";
import { TrendChapter } from "@/components/chapters/TrendChapter";
import { Opening } from "@/components/opening/Opening";

export default function Home() {
  return (
    <main>
      <Opening />
      <TrendChapter />
      <ExtremesChapter />
      <NightsChapter />
      <SummerChapter />
    </main>
  );
}
