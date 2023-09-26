import { useState } from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaEllipsisV, FaExternalLinkAlt } from "react-icons/fa";
import { Card } from "react-bootstrap";

export function ActorCard({
  title,
  link,
  linkText,
  image,
  description,
}: {
  title: string;
  link: string;
  linkText: string;
  image: string;
  description: string;
  disabled?: boolean;
}) {
  // if card is flipped it displays the help text and not the front content
  const [flipped, setFlipped] = useState<boolean>(false);
  const handleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <Card
      className="p-2 border-grey shadow-sm mb-2"
      style={{ height: "350px" }}
    >
      {
        // display the front of the card if not flipped
        !flipped ? (
          <>
            <Card.Img
              className="mx-auto p-2"
              src={image}
              alt={title}
              style={{ maxWidth: "150px" }}
            />

            <Card.Body>
              <Card.Title className="d-flex justify-content-between">
                {title}
                <span
                  role="button"
                  onClick={handleFlip}
                  className="text-end mb-1"
                >
                  <FaEllipsisV color="black" />
                </span>
              </Card.Title>
            </Card.Body>

            <Card.Footer className="bg-transparent border-0">
              <Link to={link} className="text-decoration-none">
                <span className="me-2">{linkText}</span>
                <span role="button">
                  <FaExternalLinkAlt />
                </span>
              </Link>
            </Card.Footer>
          </>
        ) : (
          // else if flipped display the back of the card
          <>
            <Card.Header className="border-0 bg-transparent">
              <Card.Title className="d-flex justify-content-between">
                {title}
                <span
                  role="button"
                  onClick={handleFlip}
                  className="text-end mb-1"
                >
                  <FaTimes color="black" />
                </span>
              </Card.Title>
            </Card.Header>
            <Card.Body className="mh-100% overflow-auto">
              <Card.Text>{description}</Card.Text>
            </Card.Body>
          </>
        )
      }
    </Card>
  );
}
