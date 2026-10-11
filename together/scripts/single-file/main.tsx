import { createRoot } from "react-dom/client";
import { usePathname } from "next/navigation";
import "../../src/app/globals.css";
import { AppShell } from "@/components/AppShell";
import { HomeScreen } from "@/components/home/HomeScreen";
import { PlanScreen } from "@/components/screens/PlanScreen";
import { MoneyScreen } from "@/components/screens/MoneyScreen";
import { GoalsScreen } from "@/components/screens/GoalsScreen";
import { InsightsScreen } from "@/components/screens/InsightsScreen";

/** Hash router for the single-file build: the same screens the Next.js routes render. */
function Router() {
  const path = usePathname();
  switch (path) {
    case "/plan/":
      return <PlanScreen />;
    case "/money/":
      return <MoneyScreen />;
    case "/goals/":
      return <GoalsScreen />;
    case "/insights/":
      return <InsightsScreen />;
    default:
      return <HomeScreen />;
  }
}

const el = document.getElementById("together-root");
if (el) {
  createRoot(el).render(
    <AppShell>
      <Router />
    </AppShell>,
  );
}
