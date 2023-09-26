import React, { useState, forwardRef, Ref } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import {
  FaTimes,
  FaInfoCircle,
  FaEllipsisV,
  FaExternalLinkAlt,
} from "react-icons/fa";

interface CustomToggleProps {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const CustomToggle = forwardRef(
  ({ children, onClick }: CustomToggleProps, ref: Ref<HTMLAnchorElement>) => (
    <a
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {/* custom icon */}
      {children}
      <span role="button">
        <FaEllipsisV color="grey" />
      </span>
    </a>
  ),
);

CustomToggle.displayName = "CustomToggle";

function ActorCard({
  title,
  link,
  linkText,
  image,
  description,
  disabled,
}: {
  title: string;
  link: string;
  linkText: string;
  image: string;
  description: string;
  disabled?: boolean;
}) {
  const [flipped, setFlipped] = useState<boolean>(false);
  const flip = () => {
    setFlipped(!flipped);
    console.log(cl);
  };

  const FrontSide = () => {
    return (
      <>
        <div className="d-flex justify-content-end align-items-start">
          <span role="button" onClick={flip} className="text-end mb-1">
            <FaInfoCircle color="black" />
          </span>
        </div>
        <div className="d-flex justify-content-center align-items-start">
          <img
            className="card-img-top"
            style={{ width: "150px", height: "150px" }}
            src={image}
            alt={link}
          />
        </div>
        <div className="card-body mb-1">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title">{title}</h5>
            <Dropdown>
              <Dropdown.Toggle as={CustomToggle} />
              <Dropdown.Menu title="">
                <Dropdown.Header>Options</Dropdown.Header>
                <Dropdown.Item></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="mt-2">
            <div className="d-flex justify-content-start align-items-center">
              <Link to={link} className="text-decoration-none me-1">
                {linkText}{" "}
                <span role="button">
                  <FaExternalLinkAlt />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  };

  const BackSide = () => {
    return (
      <>
        <div className="d-flex justify-content-between align-items-start ps-3">
          <h5>{title}</h5>
          <span role="button" onClick={flip} className="text-end mb-1">
            <FaTimes color="black" />
          </span>
        </div>
        <div className="card-body overflow-scroll">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="card-text">{description}</p>
            </div>
          </div>
          <Link to={link} className="my-2">
            {linkText}
          </Link>
        </div>
      </>
    );
  };

  let cl = "card actor-card shadow p-3 mb-5 bg-white rounded";
  if (disabled) {
    cl += " disabled-div";
  }

  return <div className={cl}>{flipped ? <BackSide /> : <FrontSide />}</div>;
}

export { ActorCard };
