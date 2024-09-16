import { AuthContext } from "@/auth";
import { useContext, useEffect, useState } from "react";
import { Alert, Button, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBars,
  FaExclamationTriangle,
  FaPlus,
} from "react-icons/fa";

import { useGetMotivations } from "@/api/services/motivations";
import { Motivation } from "@/types";
import { Link } from "react-router-dom";
import { MotivationModal } from "./components/MotivationModal";

type Pagination = {
  page: number;
  size: number;
};

const tooltipView = <Tooltip id="tip-restore">View Motivation Details</Tooltip>;

// the main component that lists the motivations in a table
export default function Motivations() {
  const { keycloak, registered } = useContext(AuthContext)!;

  const [opts, setOpts] = useState<Pagination>({
    page: 1,
    size: 10,
  });

  const [showCreate, setShowCreate] = useState(false);

  // handler for changing page size
  const handleChangePageSize = (evt: { target: { value: string } }) => {
    setOpts({ ...opts, page: 1, size: parseInt(evt.target.value) });
  };

  // data get list of motivations
  const { isLoading, data, refetch } = useGetMotivations({
    size: opts.size,
    page: opts.page,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  // get the motivation data to create the table
  const motivations: Motivation[] = data ? data?.content : [];

  return (
    <div>
      <MotivationModal
        show={showCreate}
        onHide={() => {
          setShowCreate(false);
        }}
      />
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="text-muted cat-view-heading ">
            Motivations
            <p className="lead cat-view-lead">Manage motivations.</p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          <Button
            variant="warning"
            onClick={() => {
              setShowCreate(true);
            }}
          >
            <FaPlus /> Create New
          </Button>
        </div>
      </div>
      <div>
        <Table hover>
          <thead>
            <tr className="table-light">
              <th>
                <span>MTV</span>
              </th>
              <th>
                <span>Label</span>
              </th>
              <th>
                <span>Description</span>
              </th>
              <th>
                <span>Modified</span>
              </th>
              <th></th>
            </tr>
          </thead>
          {motivations.length > 0 ? (
            <tbody>
              {motivations.map((item) => {
                return (
                  <tr key={item.mtv}>
                    <td className="align-middle">{item.mtv}</td>
                    <td className="align-middle">{item.label}</td>

                    <td className="align-middle">{item.description}</td>
                    <td className="align-middle">
                      <small>{item.last_touch.split(".")[0]}</small>
                    </td>
                    <td>
                      <div className="d-flex flex-nowrap">
                        <OverlayTrigger placement="top" overlay={tooltipView}>
                          <Link
                            className="btn btn-light btn-sm m-1"
                            to={`/motivations/${item.id}`}
                          >
                            <FaBars />
                          </Link>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ) : null}
        </Table>
        {!isLoading && motivations.length === 0 && (
          <Alert variant="warning" className="text-center mx-auto">
            <h3>
              <FaExclamationTriangle />
            </h3>
            <h5>No data found...</h5>
          </Alert>
        )}
        <div className="d-flex justify-content-end">
          <div>
            <span className="mx-1">rows per page: </span>
            <select
              name="per-page"
              value={opts.size.toString() || "20"}
              id="per-page"
              onChange={handleChangePageSize}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>

          {data && data.number_of_page && data.total_pages && (
            <div className="ms-4">
              <span>
                {(data.number_of_page - 1) * opts.size + 1} -{" "}
                {(data.number_of_page - 1) * opts.size + data.size_of_page} of{" "}
                {data.total_elements}
              </span>
              <span
                onClick={() => {
                  setOpts({ ...opts, page: opts.page - 1 });
                }}
                className={`ms-4 btn py-0 btn-light btn-small ${
                  opts.page === 1 ? "disabled text-muted" : null
                }`}
              >
                <FaArrowLeft />
              </span>
              <span
                onClick={() => {
                  setOpts({ ...opts, page: opts.page + 1 });
                }}
                className={`btn py-0 btn-light btn-small" ${
                  data?.total_pages > data?.number_of_page
                    ? null
                    : "disabled text-muted"
                }`}
              >
                <FaArrowRight />
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="row py-3 p-4">
        <div className="col"></div>
      </div>
    </div>
  );
}
