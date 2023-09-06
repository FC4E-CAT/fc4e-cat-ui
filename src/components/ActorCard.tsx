import React, { useState, forwardRef, Ref } from 'react';
import { Link } from "react-router-dom";
import { Dropdown } from 'react-bootstrap';
import { FaTimes, FaInfoCircle, FaEllipsisV, FaExternalLinkAlt } from 'react-icons/fa';

import { ActorCardPros } from "../types"

interface CustomToggleProps {
    children: React.ReactNode;
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

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
            <span role="button"><FaEllipsisV color="grey" /></span>
        </a>
    )
);

function ActorCard(props: ActorCardPros) {

    const [flipped, setFlipped] = useState<boolean>(false);
    const flip = () => {
        setFlipped(!flipped);
        console.log(cl);
    }

    const FrontSide = () => {
        return (
            <>
                <div className="d-flex justify-content-end align-items-start">
                    <span role="button" onClick={flip} className="text-end mb-1"><FaInfoCircle color="black" /></span>
                </div>
                <div className="d-flex justify-content-center align-items-start">
                    <img className="card-img-top" style={{width: "150px", height: "150px"}} src={props.image} alt={props.link} />
                </div>
                <div className="card-body mb-1">
                    <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title">{props.title}</h5>
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
                            <Link to={props.link} className="text-decoration-none me-1">{props.link_text} <span role="button"><FaExternalLinkAlt /></span></Link>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const BackSide = () => {
        return (
            <>
                <div className="d-flex justify-content-between align-items-start ps-3">
                    <h5>{props.title}</h5>
                    <span role="button" onClick={flip} className="text-end mb-1"><FaTimes color="black" /></span>
                </div>
                <div className="card-body overflow-scroll">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <p className="card-text">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </p>
                        </div>

                    </div>
                    <Link to={props.link} className="my-2" >{props.link_text}</Link>
                </div>
            </>
        )
    }

    let cl = "card actor-card shadow p-3 mb-5 bg-white rounded";
    if (props.disabled) {
        cl += " disabled-div"
    }

    return (
        <div className={cl}>
            {flipped ?
                <BackSide />
                :
                <FrontSide />
            }
        </div>
    );
}

export { ActorCard };