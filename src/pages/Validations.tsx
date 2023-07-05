import { useMemo, useContext, useState, useEffect, useRef } from 'react';
import Select, { SingleValue } from 'react-select';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { UserAPI, ValidationAPI, OrganisationAPI, ActorAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';
import {
  ColumnDef,
} from '@tanstack/react-table'
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaCheck, FaList, FaTimes, FaExclamationTriangle, FaPlus,
  FaRegCheckSquare
} from 'react-icons/fa';
import decode from 'jwt-decode';
import { Table } from '../components/Table';

function RequestValidation() {
  const { keycloak, registered } = useContext(AuthContext)!;

  UserAPI.useGetProfile(
    { token: keycloak?.token, isRegistered: registered }
  );

  const { data: actorsData } = ActorAPI.useGetActors(
    { size: 20, page: 1, sortBy: "asc", token: keycloak?.token, isRegistered: registered }
  );

  const [actors, setActors] = useState<Actor[]>();
  useEffect(() => {
    setActors(actorsData?.content);
  }, [actorsData]);

  type FormValues = {
    organisation_role: string;
    organisation_id: string;
    organisation_source: string;
    organisation_name: string;
    organisation_website: string;
    actor_id: number;
  };

  const [organisation_id, setOrganisationID] = useState("");
  const [actor_id, setActorID] = useState(-1);
  const [organisation_name, setOrganisationName] = useState("");
  const [organisation_role, setOrganisationRole] = useState("");
  const [organisation_source, setOrganisationSource] = useState("ROR");
  const [organisation_website, setOrganisationWebsite] = useState("");
  const [inputValue, setInputValue] = useState("");

  const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormValues>(
    {
      defaultValues: {
        organisation_role: organisation_role,
        organisation_id: organisation_id,
        organisation_source: organisation_source,
        organisation_name: organisation_name,
        organisation_website: organisation_website,
        actor_id: actor_id
      }
    }
  );

  const { refetch: refetchValidationRequest } = ValidationAPI.useValidationRequest(
    {
      organisation_role: organisation_role,
      organisation_id: organisation_id,
      organisation_source: organisation_source,
      organisation_name: organisation_name,
      organisation_website: organisation_website,
      actor_id: actor_id,
      token: keycloak?.token,
      isRegistered: registered
    }
  );

  const { data: organisations } = OrganisationAPI.useOrganisationRORSearch(
    {
      name: inputValue,
      page: 1,
      token: keycloak?.token,
      isRegistered: registered
    }
  );

  const onSubmit: SubmitHandler<FormValues> = data => {
    setOrganisationRole(data.organisation_role);
    setOrganisationID(data.organisation_id);
    setOrganisationSource(data.organisation_source);
    setOrganisationName(data.organisation_name);
    setOrganisationWebsite(data.organisation_website);
    setActorID(data.actor_id);
    setTimeout(() => {
      refetchValidationRequest();
    }, 1000);

  };

  const renderOptions = () => {
    let tmp = [];
    let result: OrganisationRORSearchResultModified[] = [];
    if (organisations?.content) {
      tmp = organisations?.content;
      var i;
      for (i = 0; i < tmp.length; i++) {
        let t: OrganisationRORSearchResultModified = {
          value: tmp[i]["name"],
          label: tmp[i]["name"],
          website: tmp[i]["website"],
          id: tmp[i]["id"]
        };
        result.push(t);
      }
      return result;
    }
    else return [];
  };

  const updateForm = (s: SingleValue<OrganisationRORSearchResultModified>) => {
    setValue("organisation_id", s?.id || "");
    setValue("organisation_name", s?.value || "");
    setValue("organisation_website", s?.website || "");
  };

  const actors_select_div = (
    <>
      <label htmlFor="actors" className="form-label fw-bold">
        Actor
      </label>
      <select
        className={`form-select ${errors.actor_id ? "is-invalid" : ""}`}
        id="actor_id"
        {...register("actor_id",
          {
            // onChange: (e) => { actor_id.current = e.target.value; },
            required: true
          })}>
        <option disabled value={-1}>
          Select Actor
        </option>
        {actors &&
          actors.map((t, i) => {
            return (
              <option key={`type-${i}`} value={t.id}>
                {t.name}
              </option>
            );
          })}
      </select>
      <ErrorMessage
        errors={errors}
        name="actor_id"
        render={({ message }) => <p>{message}</p>}
      />
    </>
  );

  return (
    <div className="mt-4">
      <h3 className="cat-view-heading">Create new validation request</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="organization_name" className="form-label fw-bold">
            Organization Name
          </label>
          <Select
            className="basic-single"
            classNamePrefix="select"
            onInputChange={(value, _) => setInputValue(value)}
            onChange={(s) => updateForm(s)}
            isSearchable={true}
            name="organisation_name"
            options={renderOptions()}
          />
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="organization_role" className="form-label fw-bold">
            Organization Role
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_role ? "is-invalid" : ""}`}
            id="organisation_role"
            aria-describedby="organisation_role_help"
            {...register("organisation_role", {
              // onChange: (e) => { setOrganisationRole(e.target.value) },
              required: { value: true, message: "Organisation Role is required" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_role"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="organization_source" className="form-label fw-bold">
            Organization Source
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_source ? "is-invalid" : ""}`}
            id="organisation_source"
            aria-describedby="organisation_source_help"
            disabled={true}
            {...register("organisation_source", {
              required: { value: true, message: "Organisation Source is required" },
              minLength: { value: 3, message: "Minimum length is 3" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_source"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="organization_website" className="form-label fw-bold">
            Organization Website
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_website ? "is-invalid" : ""}`}
            id="organisation_website"
            aria-describedby="organisation_website_help"
            disabled={true}
            {...register("organisation_website", {
              required: { value: true, message: "Organisation Website is required" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_website"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          {actors && actors.length > 0
            ? actors_select_div
            : null}
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <button className="btn btn-light border-black" type="submit">Submit</button>
          <Link to="/validations" className="my-2 btn btn-secondary mx-3">
            <span>Cancel</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

function Validations(props: ComponentProps) {
  let navigate = useNavigate();
  let params = useParams();

  const isAdmin = useRef<Boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<string>("");
  const { keycloak, registered } = useContext(AuthContext)!;
  const jwt = JSON.stringify(decode(keycloak.token));

  const { mutateAsync: mutateValidationUpdateStatus } = ValidationAPI.useValidationStatusUpdate(
    {
      validation_id: params.id!,
      status: reviewStatus,
      token: keycloak?.token,
      isRegistered: registered
    }
  );

  // FIXME: This is a naive approach, should reconsider
  if (jwt.includes("admin")) {
    isAdmin.current = true;
  }

  const cols = useMemo<ColumnDef<ValidationResponse>[]>(
    () => [
      {
        header: ' ',
        footer: props => props.column.id,
        columns: [
          {
            accessorKey: 'id',
            header: () => <span>ID</span>,
            cell: info => info.getValue(),
            footer: props => props.column.id,
          },
          {
            accessorFn: row => row.user_id,
            id: 'user_id',
            cell: info => info.getValue(),
            header: () => <span>User ID</span>,
            footer: props => props.column.id,
          },
          {
            accessorFn: row => row.organisation_name,
            id: 'organisation_name',
            cell: info => info.getValue(),
            header: () => <span>Organisation Name</span>,
            footer: props => props.column.id,
          },
          {
            accessorFn: row => row.organisation_role,
            id: 'organisation_role',
            cell: info => info.getValue(),
            header: () => <span>Organisation Role</span>,
            footer: props => props.column.id,
          },
          {
            accessorFn: row => row.actor_id,
            id: 'actor_id',
            cell: info => info.getValue(),
            header: () => <span>Actor ID</span>,
            footer: props => props.column.id,
          },
          {
            accessorFn: row => row.status,
            id: 'status',
            cell: info => info.getValue(),
            header: () => <span>Status</span>,
            footer: props => props.column.id,
          },
          {
            id: "action",
            cell: (props) => {
              if (isAdmin.current) {
                return (
                  <div className="edit-buttons btn-group shadow">
                    <Link
                      className="btn btn-secondary cat-action-view-link btn-sm "
                      to={`/validations/${props.row.original.id}`}>
                      <FaList />
                    </Link>
                    {props.row.original.status === "REVIEW" ?
                      <Link
                        className="btn btn-secondary cat-action-approve-link btn-sm "
                        to={`/validations/${props.row.original.id}/approve`}>
                        <FaCheck />
                      </Link>
                      :
                      null
                    }
                    {props.row.original.status === "REVIEW" ?
                      <Link
                        className="btn btn-secondary cat-action-reject-link btn-sm "
                        to={`/validations/${props.row.original.id}/reject`}>
                        <FaTimes />
                      </Link>
                      : null}
                  </div>
                )
              }
              else {
                return (
                  <Link
                    className="btn btn-secondary btn-sm "
                    to={`#`}>
                    <FaList />
                  </Link>
                )
              }
            },

            header: () => <span>Description</span>,
            footer: null,
            enableColumnFilter: false
          }
        ],
      },
    ],
    []
  )

  let rejectCard = null;
  let approveCard = null;

  if (props.toReject) {
    rejectCard = (
      <div className="container">
        <div className="card border-danger mb-2">
          <div className="card-header border-danger text-danger text-center">
            <h5>
              <FaExclamationTriangle className="mx-3" />
              <strong>Validation Request Rejection</strong>
            </h5>
          </div>
          <div className=" card-body border-danger text-center">
            Are you sure you want to reject validation with ID: <strong>{params.id}</strong> ?
          </div>
          <div className="card-footer border-danger text-danger text-center">
            <button
              className="btn btn-danger mr-2"
              onClick={() => {
                setReviewStatus("REJECTED");
                setTimeout(() => {
                  mutateValidationUpdateStatus().then(r => navigate("/validations"));
                }, 1000);
              }}>
              Reject
            </button>
            <button
              onClick={() => {
                navigate("/validations");
              }}
              className="btn btn-dark">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (props.toApprove) {
    approveCard = (
      <div className="container">
        <div className="card border-success mb-2">
          <div className="card-header border-success text-success text-center">
            <h5>
              <FaExclamationTriangle className="mx-3" />
              <strong>Validation Request Approval</strong>
            </h5>
          </div>
          <div className=" card-body border-info text-center">
            Are you sure you want to approve validation with ID: <strong>{params.id}</strong> ?
          </div>
          <div className="card-footer border-success text-success text-center">
            <button
              className="btn btn-success mr-2"
              onClick={() => {
                setReviewStatus("APPROVED");
                setTimeout(() => {
                  mutateValidationUpdateStatus().then(r => navigate("/validations"));
                }, 1000);
              }}>
              Approve
            </button>
            <button
              onClick={() => {
                navigate("/validations");
              }}
              className="btn btn-dark">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {rejectCard}
      {approveCard}
      <div className="d-flex justify-content-between my-2 container">
        <h3 className="cat-view-heading"><FaRegCheckSquare /> validation requests</h3>
        <Link to="/validations/request" className="btn btn-light border-black mx-3" ><FaPlus /> Create New</Link>
      </div>
      {isAdmin.current && keycloak ?
        <Table columns={cols} data_source={ValidationAPI.useAdminValidations} />
        :
        <Table columns={cols} data_source={ValidationAPI.useGetValidationList} />
      }
    </div>
  );
}

function ValidationDetails(props: ComponentProps) {
  let params = useParams();
  let navigate = useNavigate();
  const isAdmin = useRef<Boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<string>("");
  const { keycloak, registered } = useContext(AuthContext)!;
  const jwt = JSON.stringify(decode(keycloak.token));

  const { mutateAsync: mutateValidationUpdateStatus } = ValidationAPI.useValidationStatusUpdate(
    {
      validation_id: params.id!,
      status: reviewStatus,
      token: keycloak?.token,
      isRegistered: registered
    }
  );

  // FIXME: This is a naive approach, should reconsider
  if (jwt.includes("admin")) {
    isAdmin.current = true;
  }

  const [validation, setValidation] = useState<ValidationResponse>();

  const { data: validationData } = ValidationAPI.useGetValidationDetails(
    { validation_id: params.id!, token: keycloak?.token, isRegistered: registered }
  );

  useEffect(() => {
    setValidation(validationData);
  }, [validationData]);

  let rejectCard = null;
  let approveCard = null;

  if (props.toReject) {
    rejectCard = (
      <div className="container">
        <div className="card border-danger mb-2">
          <div className="card-header border-danger text-danger text-center">
            <h5>
              <FaExclamationTriangle className="mx-3" />
              <strong>Validation Request Rejection</strong>
            </h5>
          </div>
          <div className=" card-body border-danger text-center">
            Are you sure you want to reject validation with ID: <strong>{params.id}</strong> ?
          </div>
          <div className="card-footer border-danger text-danger text-center">
            <button
              className="btn btn-danger mr-2"
              onClick={() => {
                setReviewStatus("REJECTED");
                setTimeout(() => {
                  mutateValidationUpdateStatus().then(r => navigate("/validations"));
                }, 1000);
              }}>
              Reject
            </button>
            <button
              onClick={() => {
                navigate("/validations");
              }}
              className="btn btn-dark">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (props.toApprove) {
    approveCard = (
      <div className="container">
        <div className="card border-success mb-2">
          <div className="card-header border-success text-success text-center">
            <h5>
              <FaExclamationTriangle className="mx-3" />
              <strong>Validation Request Approval</strong>
            </h5>
          </div>
          <div className=" card-body border-info text-center">
            Are you sure you want to approve validation with ID: <strong>{params.id}</strong> ?
          </div>
          <div className="card-footer border-success text-success text-center">
            <button
              className="btn btn-success mr-2"
              onClick={() => {
                setReviewStatus("APPROVED");
                setTimeout(() => {
                  mutateValidationUpdateStatus().then(r => navigate("/validations"));
                }, 1000);
              }}>
              Approve
            </button>
            <button
              onClick={() => {
                navigate("/validations");
              }}
              className="btn btn-dark">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (keycloak?.token) {
    return (
      <div className="mt-4">
        {rejectCard}
        {approveCard}
        <div className="container">

          <div className="card mt-4">
            <div className="card-header text-start">
              <h2 className="view-title"><i><FaRegCheckSquare /></i> Validation: {validation?.id}</h2>
            </div>
            <div className="card-body p-4">
              <div className="row">
                <div className="col-2">
                  <span style={{ 'fontSize': '8rem' }}>📄</span>
                </div>
                <div className="col-10">

                  <div className="row">
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div className="input-group-text">User ID: </div>
                        </div>
                        <span className="form-control" > {validation?.user_id}</span>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div className="input-group-text">Organisation Name: </div>
                        </div>
                        <span className="form-control" > {validation?.organisation_name}</span>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div className="input-group-text">Organisation ID: </div>
                        </div>
                        <span className="form-control" > {validation?.organisation_id}</span>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div className="input-group-text">Organisation Role: </div>
                        </div>
                        <span className="form-control" > {validation?.organisation_role}</span>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div className="input-group-text">Organisation Source: </div>
                        </div>
                        <span className="form-control" > {validation?.organisation_source}</span>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div className="input-group-text">Organisation Website: </div>
                        </div>
                        <span className="form-control" > {validation?.organisation_website}</span>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div className="input-group-text">Actor ID: </div>
                        </div>
                        <span className="form-control" > {validation?.actor_id}</span>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div className="input-group-text">Status: </div>
                        </div>
                        <span className="form-control" > {validation?.status}</span>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div className="input-group-text">Created On: </div>
                        </div>
                        <span className="form-control" > {validation?.createdOn}</span>
                      </div>
                    </div>
                    {validation?.status === "VERIFY" &&
                      <>
                        <div className="col-auto">
                          <div className="input-group mb-2">
                            <div className="input-group-prepend">
                              <div className="input-group-text">Validated On: </div>
                            </div>
                            <span className="form-control" > {validation?.validated_on}</span>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="input-group mb-2">
                            <div className="input-group-prepend">
                              <div className="input-group-text">Validated By: </div>
                            </div>
                            <span className="form-control" > {validation?.validatedBy}</span>
                          </div>
                        </div>
                      </>
                    }
                  </div>
                </div>

                {isAdmin.current && validation?.status === "REVIEW" ?
                  <div className="text-center">
                    <div className="btn-group shadow">
                      <Link
                        className="btn btn-success"
                        to={`/validations/${params.id}/approve`}>
                        <FaCheck /> Approve
                      </Link>
                      <Link
                        className="btn btn-danger"
                        to={`/validations/${params.id}/reject`}>
                        <FaTimes /> Reject
                      </Link>
                      <Link
                        className="btn btn-secondary"
                        to={`/validations`}>
                        Back
                      </Link>
                    </div>
                  </div>
                  :
                  <div className="text-center">
                    <div className="btn-group shadow">
                      <Link
                        className="btn btn-secondary"
                        to={`/validations`}>
                        Back
                      </Link>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
}

export { RequestValidation, Validations, ValidationDetails };
