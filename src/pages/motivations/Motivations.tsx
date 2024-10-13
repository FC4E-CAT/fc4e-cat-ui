import { AuthContext } from "@/auth";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Button,
  OverlayTrigger,
  Table,
  Tooltip,
  Form,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBars,
  FaExclamationTriangle,
  FaPlus,
  FaRegClone,
  FaArrowUp,
  FaArrowDown,
  FaArrowsAltV,
} from "react-icons/fa";

import { useGetMotivations } from "@/api/services/motivations";
import { Motivation } from "@/types";
import { Link } from "react-router-dom";
import { MotivationModal } from "./components/MotivationModal";

type MotivationState = {
  sortOrder: string;
  sortBy: string;
  page: number;
  size: number;
  search: string;
  status: string;
};

export function SortMarker(
  field: string,
  sortField: string,
  sortOrder: string,
) {
  if (field === sortField) {
    if (sortOrder === "DESC") return <FaArrowUp />;
    else if (sortOrder === "ASC") return <FaArrowDown />;
  }
  return <FaArrowsAltV className="text-secondary opacity-50" />;
}

type Clone = {
  id: string | null;
  name: string;
};

// the main component that lists the motivations in a table
export default function Motivations() {
  const { keycloak, registered } = useContext(AuthContext)!;

  const [opts, setOpts] = useState<MotivationState>({
    page: 1,
    size: 10,
    sortBy: "mtv",
    sortOrder: "ASC",
    search: "",
    status: "",
  });

  const [showCreate, setShowCreate] = useState(false);
  const [clone, setClone] = useState<Clone>({ id: null, name: "" });

  // handler for changing page size
  const handleChangePageSize = (evt: { target: { value: string } }) => {
    setOpts({ ...opts, page: 1, size: parseInt(evt.target.value) });
  };

  // data get list of motivations
  const { isLoading, data, refetch } = useGetMotivations({
    size: opts.size,
    sortBy: opts.sortBy,
    sortOrder: opts.sortOrder,
    page: opts.page,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  // handler for clicking to sort
  const handleSortClick = (field: string) => {
    if (field === opts.sortBy) {
      if (opts.sortOrder === "ASC") {
        setOpts({ ...opts, sortOrder: "DESC" });
      } else {
        setOpts({ ...opts, sortOrder: "ASC" });
      }
    } else {
      setOpts({ ...opts, sortOrder: "ASC", sortBy: field });
    }
  };
  // get the motivation data to create the table
  const motivations: Motivation[] = data ? data?.content : [];

  return (
    <div>
      <MotivationModal
        cloneId={clone.id}
        cloneName={clone.name}
        motivation={null}
        show={showCreate}
        onHide={() => {
          setShowCreate(false);
          setClone({ id: null, name: "" });
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
        <Form className="mb-3">
          <div className="row cat-view-search-block border-bottom">
            <div className="col col-lg-3"></div>
            <div className="col md-auto col-lg-9">
              <div className="d-flex justify-content-center">
                <Form.Control
                  placeholder="Search ..."
                  onChange={(e) => {
                    setOpts({ ...opts, search: e.target.value });
                  }}
                  value={opts.search}
                />
                <Button
                  onClick={() => {
                    setOpts({ ...opts, search: "" });
                  }}
                  className="ms-4"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </Form>
        <Table hover>
          <thead>
            <tr className="table-light">
              <th>
                <span
                  onClick={() => handleSortClick("mtv")}
                  className="cat-cursor-pointer"
                >
                  MTV {SortMarker("mtv", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th>
                <span
                  onClick={() => handleSortClick("label")}
                  className="cat-cursor-pointer"
                >
                  label {SortMarker("label", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th>
                <span>Description</span>
              </th>
              <th>
                <span
                  onClick={() => handleSortClick("lastTouch")}
                  className="cat-cursor-pointer"
                >
                  Modified{" "}
                  {SortMarker("lastTouch", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th></th>
            </tr>
          </thead>
          {motivations.length > 0 ? (
            <tbody>
              {motivations.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="align-middle">{item.mtv}</td>
                    <td className="align-middle">{item.label}</td>

                    <td className="align-middle">{item.description}</td>
                    <td className="align-middle">
                      <small>{item.last_touch.split("T")[0]}</small>
                    </td>
                    <td>
                      <div className="d-flex flex-nowrap">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tip-view">
                              View Motivation Details
                            </Tooltip>
                          }
                        >
                          <Link
                            className="btn btn-light btn-sm m-1"
                            to={`/motivations/${item.id}`}
                          >
                            <FaBars />
                          </Link>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tip-clone">
                              Create a new motivation based on this one (clone)
                            </Tooltip>
                          }
                        >
                          <span
                            className="btn btn-light btn-sm m-1"
                            onClick={() => {
                              setClone({ id: item.id, name: item.label });
                              setShowCreate(true);
                            }}
                          >
                            <FaRegClone />
                          </span>
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
