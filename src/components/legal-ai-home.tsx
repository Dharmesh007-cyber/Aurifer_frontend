import { ShaderHero } from "@/components/ui/shader-hero";
import { ParallaxScrollFeatures } from "@/components/ui/parallax-scroll-feature-section";

const aboutPlatformContent = [
  "A bespoke, AI-powered workspace built for Aurifer's consulting professionals, empowering you to seamlessly articulate and bring to life innovative consulting solutions.",
] as const;

export default function LegalAiHome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShaderHero />

      <section className="relative overflow-hidden py-20 px-8 bg-gradient-to-b from-background to-muted/30">
        <div className="about-glow about-glow-left" />
        <div className="about-glow about-glow-right" />

        <div className="max-w-5xl mx-auto">
          <div className="about-card rounded-3xl border border-primary/20 bg-card/85 p-10 md:p-12 shadow-2xl">
            <div className="mb-6 rounded-2xl border border-primary/20 bg-background/70 p-5 md:p-6">
              <h2 className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                About the Platform
              </h2>
              <div className="mt-3 space-y-3">
                {aboutPlatformContent.map((item) => (
                  <p key={item} className="text-sm md:text-base leading-relaxed text-muted-foreground">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <h2 className="mt-6 text-center text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Why Teams Use It
            </h2>

            <p className="about-copy mt-6 text-center text-lg md:text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto">
              Designed to assist consulting professionals, this workspace integrates with the Aurifer database to help organize and draft reports with relevant legislative backing, enabling teams to work more efficiently while retaining full control over the analysis.
            </p>

          </div>
        </div>
      </section>

      <ParallaxScrollFeatures />
    </div>
  );
}
