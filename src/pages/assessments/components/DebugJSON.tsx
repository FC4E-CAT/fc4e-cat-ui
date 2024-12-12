/**
 * Component to debug the asssessment JSON
 */

import { Assessment } from "@/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const DebugJSON = ({ assessment }: { assessment?: Assessment }) => {
  const [debug, setDebug] = useState(false);
  const { t } = useTranslation();
  return (
    <div className="mt-5">
      <button
        type="button"
        className="btn btn-warning btn-sm"
        onClick={() => setDebug(!debug)}
      >
        {t("buttons.debug_json")}
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
