import { useEffect, useState } from "react";
import { getMessageTemplates } from "@/lib/firebase/message-templates";
import {
  defaultMessageTemplates,
  type MessageTemplates,
} from "@/lib/messages";

let cachedTemplates: MessageTemplates | null = null;
let pendingLoad: Promise<MessageTemplates> | null = null;

export const loadMessageTemplates = async () => {
  if (cachedTemplates) {
    return cachedTemplates;
  }

  if (!pendingLoad) {
    pendingLoad = getMessageTemplates()
      .then((templates) => {
        cachedTemplates = templates;
        return templates;
      })
      .catch(() => {
        cachedTemplates = defaultMessageTemplates;
        return defaultMessageTemplates;
      })
      .finally(() => {
        pendingLoad = null;
      });
  }

  return pendingLoad;
};

export const clearMessageTemplatesCache = () => {
  cachedTemplates = null;
  pendingLoad = null;
};

export const useMessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplates>(
    cachedTemplates ?? defaultMessageTemplates
  );

  useEffect(() => {
    let mounted = true;

    loadMessageTemplates().then((data) => {
      if (mounted) {
        setTemplates(data);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { templates };
};
