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
        <span className="badge bg-light border" key={item.id}>
          <Link
            className="text-black"
            to={`/admin/motivations/${item.id}`}
          >{`${item.label}`}</Link>
        </span>
      ))}
    </div>
  );
};
