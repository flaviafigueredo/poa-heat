import { ExtremesChapter } from "@/components/chapters/ExtremesChapter";
import { MethodologyChapter } from "@/components/chapters/MethodologyChapter";
import { NightsChapter } from "@/components/chapters/NightsChapter";
import { SummerChapter } from "@/components/chapters/SummerChapter";
import { TrendChapter } from "@/components/chapters/TrendChapter";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Footer } from "@/components/footer/Footer";
import { Opening } from "@/components/opening/Opening";
import { ProgressIndicator } from "@/components/progress/ProgressIndicator";

export default function Home() {
  return (
    <>
      <main>
        <Opening />
        <TrendChapter />
        <ExtremesChapter />
        <NightsChapter />
        <SummerChapter />
        <Dashboard />
        <MethodologyChapter />
      </main>
      <Footer />
      <ProgressIndicator />
    </>
  );
}
