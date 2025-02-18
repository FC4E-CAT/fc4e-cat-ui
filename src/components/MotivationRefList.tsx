import { MotivationReference } from "@/types";
import { Link } from "react-router-dom";

/**
 * Small component to display a short list of motivations in which the item is included.
 */
export const MotivationRefList = ({
  motivations,
}: {
  motivations: MotivationReference[];
}) => {
  return (
    <div>
      {motivations.map((item) => (
        <span className="px-1" key={item.id}>
          <span className="badge bg-primary-cat border">
            <Link
              className="text-muted"
              to={`/admin/motivations/${item.id}`}
            >{`${item.label}`}</Link>
          </span>
        </span>
      ))}
    </div>
  );
};
