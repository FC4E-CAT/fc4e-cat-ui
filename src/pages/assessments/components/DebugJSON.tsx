/**
 * Component to debug the asssessment JSON
 */

import { Assessment } from "@/types";
import { useState } from "react";

export const DebugJSON = ({ assessment }: { assessment?: Assessment }) => {
  const [debug, setDebug] = useState(false);
  return (
    <div className="mt-5">
      <button
        type="button"
        className="btn btn-warning btn-sm"
        onClick={() => setDebug(!debug)}
      >
        Debug JSON
      </button>
      <br />
      {debug && (
        <pre className="p-2 bg-dark text-white">
          <code>{JSON.stringify(assessment, null, 2)}</code>
        </pre>
      )}
    </div>
  );
};
