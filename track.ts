export const track = (
    action: string,
    params: Record<string, any> = {}
  ) => {
    if (typeof window === "undefined") return;
    if (!(window as any).gtag) return;
  
    (window as any).gtag("event", action, {
      event_category: "auto_print",
      ...params,
    });
  };
  