import { createFileRoute } from "@tanstack/react-router";
import SnakePortfolio from "@/components/SnakePortfolio";

export const Route = createFileRoute("/")({
  component: SnakePortfolio,
  head: () => ({
    meta: [
      { title: "Mira Cendrars · Design strategist (play to enter)" },
      {
        name: "description",
        content:
          "An interactive portfolio you play with arrow keys. Steer the snake to discover Mira Cendrars' approach, projects, and fun facts.",
      },
    ],
  }),
});
