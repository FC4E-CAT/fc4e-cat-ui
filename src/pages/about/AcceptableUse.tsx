import { Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";

function AcceptableUse() {
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="p-4">
        <h3 className="cat-view-heading mb-4">
          <FaInfoCircle /> {t("acceptable_use_policy")}
        </h3>
        <Row>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
            semper fermentum justo, vitae tempor urna auctor eu. Nam ac diam eu
            arcu porta posuere in at mi. Cras ut quam et sapien sodales aliquam
            eget sed mi. Etiam nec sollicitudin purus. Sed sit amet quam erat.
            Suspendisse ut convallis nulla. Fusce in sodales lacus, vitae
            faucibus nisl. Mauris eu tellus eget ex mattis volutpat.
            Pellentesque volutpat faucibus tellus, et fringilla nulla varius
            vel.
          </p>
        </Row>
      </div>
    </div>
  );
}

export default AcceptableUse;
