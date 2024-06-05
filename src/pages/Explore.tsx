import { useEffect, useRef } from "react";
import config from "@/config.json";

function Explore() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // const [iframeHeight, setIframeHeight] = useState('0px');

  useEffect(() => {
    const handleResize = (event: MessageEvent) => {
      if (event.origin === config.embedded_views.explore_view) {
        // Replace with the actual domain of pageB
        console.log("received size from child:", event.data);
        if (iframeRef.current)
          iframeRef.current.style.height = event.data + "px";
      }
    };

    window.addEventListener("message", handleResize);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("message", handleResize);
    };
  }, []);

  return (
    <div>
      <iframe
        src={config.embedded_views.explore_view}
        style={{ width: "100%", height: "800px" }}
        ref={iframeRef}
      ></iframe>
    </div>
  );
}

export default Explore;
