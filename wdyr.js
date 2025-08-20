import React from "react";

if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  import("@welldone-software/why-did-you-render").then((whyDidYouRender) => {
    whyDidYouRender.default(React, {
      trackAllPureComponents: true,
      trackHooks: true,
      trackExtraHooks: [
        {
          hookName: "useState",
          isPure: false,
        },
        {
          hookName: "useEffect",
          isPure: false,
        },
      ],
    });
  });
}
