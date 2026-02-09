import { Flame, Star } from "lucide-react";
import { getXpProgress } from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type XpCardProps = {
  xp: number;
};

export const XpCard = ({ xp }: XpCardProps): React.ReactElement => {
  const { level, currentLevelXp, nextLevelXp, progressPercent } = getXpProgress(xp);
  const xpToNextLevel = Math.max(0, nextLevelXp - xp);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Star className="size-4 text-primary" /> Level {level}
          </p>
          <p className="text-sm text-muted-foreground">{xp} XP</p>
        </div>

        <Progress value={progressPercent} />

        <p className="text-sm text-muted-foreground">
          {xpToNextLevel} XP to reach Level {level + 1}. ({xp - currentLevelXp} / {nextLevelXp - currentLevelXp})
        </p>

        <p className="flex items-center gap-2 text-sm font-medium text-accent-foreground break-words">
          <Flame className="size-4 shrink-0 text-accent-foreground" /> Keep your streak by finishing one task today.
        </p>
      </CardContent>
    </Card>
  );
};
