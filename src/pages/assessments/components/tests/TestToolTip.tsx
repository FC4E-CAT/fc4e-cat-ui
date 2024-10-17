import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaQuestionCircle } from "react-icons/fa";

export const TestToolTip = ({
  tipId,
  tipText,
}: {
  tipId: string;
  tipText: string;
}) => {
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={tipId}>{tipText}</Tooltip>}
    >
      <span>
        <FaQuestionCircle className="text-secondary opacity-50" />
      </span>
    </OverlayTrigger>
  );
};
