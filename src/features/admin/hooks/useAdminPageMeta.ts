import { useEffect } from "react";

export function useAdminPageMeta() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Painel Interno | ArqDoor";

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const hadExistingMeta = Boolean(robotsMeta);
    const previousRobotsContent = robotsMeta?.content || "";

    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.name = "robots";
      document.head.appendChild(robotsMeta);
    }

    robotsMeta.content = "noindex,nofollow,noarchive";

    return () => {
      document.title = previousTitle;

      if (!hadExistingMeta) {
        robotsMeta?.remove();
        return;
      }

      if (robotsMeta) {
        robotsMeta.content = previousRobotsContent;
      }
    };
  }, []);
}
