import { gapOutcomes } from "@/server/outcomes/gap";
import { relationshipOutcomes } from "@/server/outcomes/relationship";
import { cityOutcomes } from "@/server/outcomes/city";
import { educationOutcomes } from "@/server/outcomes/education";

export const immersiveOutcomes: Record<string, string> = {
  ...gapOutcomes,
  ...relationshipOutcomes,
  ...cityOutcomes,
  ...educationOutcomes,
};
