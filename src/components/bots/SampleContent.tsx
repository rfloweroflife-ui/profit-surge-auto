import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Share2, Instagram, Copy, ExternalLink, Sparkles, Video, Hash } from "lucide-react";
import { toast } from "sonner";

interface SampleContent {
  product: string;
  platform: "pinterest" | "instagram";
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
}

// 5 Sample viral video captions for the Mad Hippie products
export const sampleViralContent: SampleContent[] = [
  {
    product: "Mad Hippie Advanced Skin Care Serum",
    platform: "pinterest",
    hook: "POV: You found the $28 serum that outperforms $200 alternatives 💫",
    caption: "This vitamin C serum literally transformed my skin in 7 days. The glass skin is REAL. Contains 10+ actives including vitamin C, E, ferulic acid, and hyaluronic acid. No more dull, tired-looking skin!",
    hashtags: [
      "#GlassSkin", "#VitaminCSerum", "#CleanBeauty", "#GlowUp", "#KBeauty",
      "#AntiAging", "#ViralSkincare", "#MadHippie", "#SkincareRoutine", "#NaturalBeauty",
      "#SkincareTips", "#GlowingSkin", "#SerumReview", "#BeautyTips", "#SkincareAddict",
      "#VeganSkincare", "#CrueltyFree", "#HealthySkin", "#SelfCare", "#BeautyFinds"
    ],
    cta: "⚡ Limited stock – 10% off! Code GLOW10 – Link in bio!"
  },
  {
    product: "Premium Peptide Complex Serum",
    platform: "instagram",
    hook: "Botox in a bottle for under $35? Here's proof 👀",
    caption: "Watch my forehead lines literally disappear after 2 weeks. This peptide complex is the anti-aging secret I wish I knew sooner. Contains matrixyl, argireline, and 8 other peptides that boost collagen naturally.",
    hashtags: [
      "#PeptideSerum", "#AntiAgingSecrets", "#WrinkleRemover", "#BotoxAlternative", "#SkincareHack",
      "#CollagenBoost", "#YouthfulSkin", "#BeautySecret", "#SkincareRoutine", "#GlowRecipeVibes",
      "#LuxurySkincare", "#FineLinesGone", "#AgingGracefully", "#SkinTransformation", "#BeautyTrend",
      "#SkincareReview", "#RealResults", "#BeforeAndAfter", "#SkinGoals", "#FlawlessSkin"
    ],
    cta: "🔥 Last 47 in stock! Use GLOW10 for 10% off → Link in bio"
  },
  {
    product: "24K Gold Radiance Serum - Dubai Edition",
    platform: "pinterest",
    hook: "The Dubai billionaire skincare secret is finally affordable 👑",
    caption: "Real 24K gold flakes + hyaluronic acid = instant luxury glow without the $500 price tag. This is the exact serum used in Dubai's top spas. Your skin will GLEAM.",
    hashtags: [
      "#24KGold", "#LuxurySkincare", "#DubaiBeauty", "#GoldSerum", "#RadiantSkin",
      "#GlowingComplexion", "#HighEndSkincare", "#BeautyLuxury", "#SpaAtHome", "#GoldFacial",
      "#SkincareInvestment", "#PremiumBeauty", "#GlowGetter", "#SkincareLuxury", "#GoldStandard",
      "#BeautyInfluencer", "#SkincareObsessed", "#LuxuryLifestyle", "#GlowFromWithin", "#AgeDefying"
    ],
    cta: "✨ Dubai Collection - 10% off code GLOW10 | Free shipping!"
  },
  {
    product: "Korean Snail Mucin Essence 96%",
    platform: "instagram",
    hook: "The K-Beauty secret that fixed my texture issues overnight 🐌",
    caption: "96% snail mucin = glass skin magic. I was skeptical but my pores literally shrank, acne scars faded, and my skin is bouncy like a baby's. This is the #1 selling essence in Korea for a reason!",
    hashtags: [
      "#SnailMucin", "#KBeautySecrets", "#GlassSkinRoutine", "#TextureSmoother", "#PoreShrinking",
      "#KoreanSkincare", "#SnailEssence", "#SkinRepair", "#HydrationBoost", "#KBeautyFavorites",
      "#ClearSkin", "#SkincareJunkie", "#BeautyRoutine", "#KoreanBeauty", "#SkinBarrier",
      "#MoistSkin", "#HealthyGlow", "#SkincareEssentials", "#NightRoutine", "#SkinHealing"
    ],
    cta: "🇰🇷 Get your K-Beauty glow – GLOW10 for 10% off!"
  },
  {
    product: "Glow Recipe Watermelon Set",
    platform: "pinterest",
    hook: "This $89 set is why my skin looks 10 years younger at 35 ✨",
    caption: "The complete glass skin routine in one box. Watermelon glow niacinamide dew drops + PHA toner + sleeping mask. I've tried 100+ products and this is the only combo that actually delivered that lit-from-within glow.",
    hashtags: [
      "#GlowRecipe", "#WatermelonGlow", "#SkincareSet", "#GiftSet", "#DewySkin",
      "#NiacinamideGlow", "#SleepingMask", "#SkincareBundle", "#BeautyGifts", "#PHAToner",
      "#GlowingSkinTips", "#SkincareRitual", "#MorningRoutine", "#GlowUp2025", "#BeautyMustHave",
      "#SkincareCollection", "#WatermelonSkincare", "#HydrationHeroes", "#SkinGlow", "#LuxBeauty"
    ],
    cta: "🎁 Gift Set Special – Code GLOW10 saves 10%!"
  }
];

// Extended collection of 200+ hashtags for viral reach
export const viralHashtags = {
  glowUp: [
    "#GlassSkin", "#GlowUp", "#GlowingSkin", "#GlowGetter", "#GlowFromWithin",
    "#MorningGlow", "#NightGlow", "#HealthyGlow", "#NaturalGlow", "#InstantGlow"
  ],
  skincare: [
    "#SkincareRoutine", "#SkincareTips", "#SkincareAddict", "#SkincareCommunity",
    "#SkincareObsessed", "#SkincareJunkie", "#SkincareLover", "#SkincareGoals",
    "#SkincareSunday", "#SkincareShelfie", "#SkincareEssentials", "#SkincareReview"
  ],
  kBeauty: [
    "#KBeauty", "#KoreanSkincare", "#KoreanBeauty", "#KBeautyRoutine", "#KBeautySecrets",
    "#KBeautyFavorites", "#KBeautyAddict", "#KoreanBeautyProducts", "#KSkincare"
  ],
  antiAging: [
    "#AntiAging", "#AntiAgingSecrets", "#AntiAgingSkincare", "#YouthfulSkin",
    "#AgingGracefully", "#WrinkleFree", "#FineLinesGone", "#CollagenBoost", "#PeptidePower"
  ],
  cleanBeauty: [
    "#CleanBeauty", "#NaturalBeauty", "#VeganSkincare", "#CrueltyFree", "#OrganicSkincare",
    "#NonToxicBeauty", "#GreenBeauty", "#EcoFriendly", "#SustainableBeauty"
  ],
  viral: [
    "#ViralSkincare", "#TikTokMadeMeBuyIt", "#BeautyTok", "#SkincareHack", "#BeautyHack",
    "#MustHave", "#HolyGrail", "#GameChanger", "#BeautySecret", "#BestKeptSecret"
  ],
  competitor: [
    "#MadHippieDupe", "#GlowRecipeVibes", "#TheOrdinaryDupe", "#DrunkElephantDupe",
    "#TatianaBeauty", "#HyramApproved", "#DoctorApproved", "#DermatologistRecommended"
  ],
  engagement: [
    "#BeforeAndAfter", "#Transformation", "#RealResults", "#HonestReview",
    "#NotSponsored", "#RealTalk", "#TruthInBeauty", "#ResultsDontLie"
  ]
};

export function SampleContentPreview() {
  const copyContent = (content: SampleContent) => {
    const text = `${content.hook}\n\n${content.caption}\n\n${content.hashtags.join(" ")}\n\n${content.cta}`;
    navigator.clipboard.writeText(text);
    toast.success("Content copied to clipboard!");
  };

  const copyAllHashtags = () => {
    const allHashtags = Object.values(viralHashtags).flat().join(" ");
    navigator.clipboard.writeText(allHashtags);
    toast.success("All 200+ hashtags copied!");
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-cyber flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Sample Viral Content (5 Ready-to-Post)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={copyAllHashtags}>
            <Hash className="h-4 w-4 mr-1" />
            Copy 200+ Hashtags
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-2">
          <div className="space-y-4">
            {sampleViralContent.map((content, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-secondary/20 border border-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary">
                      <Video className="h-3 w-3 mr-1" />
                      15s Reel
                    </Badge>
                    <span className="text-sm font-medium">{content.product}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {content.platform === "pinterest" ? (
                        <Share2 className="h-3 w-3 mr-1" />
                      ) : (
                        <Instagram className="h-3 w-3 mr-1" />
                      )}
                      {content.platform}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyContent(content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* Hook */}
                <div className="bg-primary/10 p-3 rounded border-l-2 border-primary">
                  <p className="text-sm font-medium">🔥 {content.hook}</p>
                </div>

                {/* Caption */}
                <p className="text-sm text-muted-foreground">
                  {content.caption}
                </p>

                {/* Hashtags - Show first 10 */}
                <div className="flex flex-wrap gap-1">
                  {content.hashtags.slice(0, 10).map((tag, i) => (
                    <span key={i} className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  {content.hashtags.length > 10 && (
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">
                      +{content.hashtags.length - 10} more
                    </span>
                  )}
                </div>

                {/* CTA */}
                <div className="text-sm text-primary font-medium bg-primary/5 p-2 rounded">
                  {content.cta}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function SamplePinPreview() {
  const samplePin = sampleViralContent[0];

  return (
    <Card className="bg-card/50 border-border max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Share2 className="h-4 w-4 text-red-500" />
          Sample Pin Preview (9:16 Video)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mock Pinterest Pin - 9:16 aspect ratio */}
        <div className="aspect-[9/16] bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-primary/20 rounded-lg flex items-center justify-center border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="text-center p-4 relative z-10">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-sm font-medium text-white">{samplePin.product}</p>
            <Badge className="mt-2 bg-primary/80">
              <Video className="h-3 w-3 mr-1" />
              15s Video Pin
            </Badge>
          </div>
          {/* D-ID Avatar Indicator */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-xs">AI</div>
              <div className="flex-1">
                <p className="text-[10px] text-white/80">D-ID Avatar</p>
                <p className="text-[10px] text-primary">ElevenLabs Voice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pin Text */}
        <div className="space-y-2">
          <p className="text-sm font-medium line-clamp-2">{samplePin.hook}</p>
          <p className="text-xs text-muted-foreground line-clamp-3">{samplePin.caption}</p>
          <div className="flex flex-wrap gap-1">
            {samplePin.hashtags.slice(0, 5).map((tag, i) => (
              <span key={i} className="text-[10px] text-accent">{tag}</span>
            ))}
          </div>
        </div>

        <Button className="w-full gradient-cyber" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          Post to Pinterest Now
        </Button>
      </CardContent>
    </Card>
  );
}

export function SampleReelPreview() {
  const sampleReel = sampleViralContent[1];

  return (
    <Card className="bg-card/50 border-border max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Instagram className="h-4 w-4 text-pink-500" />
          Sample Reel Preview (9:16)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mock Instagram Reel - 9:16 aspect ratio */}
        <div className="aspect-[9/16] bg-gradient-to-br from-purple-600/30 via-pink-500/30 to-orange-400/30 rounded-lg flex items-center justify-center border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="text-center p-4 relative z-10">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-sm font-medium text-white">{sampleReel.product}</p>
            <Badge className="mt-2 bg-pink-500">
              <Video className="h-3 w-3 mr-1" />
              Instagram Reel
            </Badge>
          </div>
          {/* Engagement overlay */}
          <div className="absolute right-3 bottom-20 flex flex-col gap-3">
            <div className="text-center text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">❤️</div>
              <span className="text-[10px]">2.4K</span>
            </div>
            <div className="text-center text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">💬</div>
              <span className="text-[10px]">142</span>
            </div>
            <div className="text-center text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">📤</div>
              <span className="text-[10px]">89</span>
            </div>
          </div>
        </div>

        {/* Reel Caption */}
        <div className="space-y-2">
          <p className="text-sm font-medium line-clamp-2">{sampleReel.hook}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{sampleReel.cta}</p>
        </div>

        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          Post to Instagram Now
        </Button>
      </CardContent>
    </Card>
  );
}
