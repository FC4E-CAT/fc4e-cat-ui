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
  FaRegCheckSquare, FaGlasses
} from 'react-icons/fa';
import decode from 'jwt-decode';
import { Table } from '../components/Table';

function RequestValidation() {
  let navigate = useNavigate();
  const { keycloak, registered } = useContext(AuthContext)!;

  const { data: profileData } = UserAPI.useGetProfile(
    { token: keycloak?.token, isRegistered: registered }
  );

  const [userProfile, setUserProfile] = useState<UserProfile>();
  useEffect(() => {
    setUserProfile(profileData);
  }, [profileData]);

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

  const { mutateAsync: refetchValidationRequest } = ValidationAPI.useValidationRequest(
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
      refetchValidationRequest().then(r => navigate("/validations"));
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
          <label htmlFor="user_name" className="form-label fw-bold">
            User Name
          </label>
          <input
            type="text"
            className={`form-control`}
            id="user_name"
            aria-describedby="user_name_help"
            disabled={true} 
            value={userProfile?.name}/>
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="user_surname" className="form-label fw-bold">
            User Surname
          </label>
          <input
            type="text"
            className={`form-control`}
            id="user_surname"
            aria-describedby="user_surname_help"
            disabled={true} 
            value={userProfile?.surname}/>
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="user_email" className="form-label fw-bold">
            User Email
          </label>
          <input
            type="text"
            className={`form-control`}
            id="user_email"
            aria-describedby="user_email_help"
            disabled={true} 
            value={userProfile?.email}/>
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
                        to={`/validations/${props.row.original.id}/approve#alert-spot`}>
                        <FaCheck />
                      </Link>
                      :
                      null
                    }
                    {props.row.original.status === "REVIEW" ?
                      <Link
                        className="btn btn-secondary cat-action-reject-link btn-sm "
                        to={`/validations/${props.row.original.id}/reject/#alert-spot`}>
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
                    to={`/validations/${props.row.original.id}`}>
                    <FaList />
                  </Link>
                )
              }
            },

            header: () => <span>Actions</span>,
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
            <h5 id="reject-alert">
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
      <div  className="container">
        <div className="card border-success mb-2">
          <div className="card-header border-success text-success text-center">
            <h5 id="approve-alert">
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
                navigate(`/validations/${params.id}`);
              }}
              className="btn btn-dark mx-4">
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
                navigate(`/validations/${params.id}`);
              }}
              className="btn btn-dark mx-4">
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
        
      

        <h3 className="cat-view-heading"><FaRegCheckSquare /> Validation Request <span className="badge bg-secondary">id: {validation?.id}</span></h3>
        
        <div className="row border-top py-3 mt-4">
          <header className="col-3 h4 text-muted">Requestor</header>
          <section className="col-9">
            <div><strong>User id:</strong> {validation?.user_id}</div>
            <div><strong>User name:</strong> {validation?.user_name}</div>
            <div><strong>User surname:</strong> {validation?.user_surname}</div>
            <div><strong>User email:</strong> {validation?.user_email}</div>
          </section>
        </div>
        <div className="row border-top py-3 mt-4">
          <header className="col-3 h4 text-muted">Organisation</header>
          <section className="col-9">
          <div><strong>Id: </strong> 
          { validation?.organisation_source === "ROR" 
            ? <><span className="text-muted">ror.org/</span><a target="_blank" rel="noreferrer" href={"http://ror.org/"+validation?.organisation_id}>{validation?.organisation_id}</a></>
            : <><span>{validation?.organisation_id}</span><small>({validation?.organisation_source})</small></>
          }
          </div>
            <div><strong>Name:</strong> {validation?.organisation_name}</div>
            <div><strong>Website:</strong> <a target="_blank" rel="noreferrer" href={validation?.organisation_website}>{validation?.organisation_website}</a></div>
            
          </section>
        </div>
        <div className="row border-top py-3 mt-4">
          <header className="col-3 h4 text-muted">Roles</header>
          <section className="col-9">
            <div><strong>User role in organisation:</strong> {validation?.organisation_role}</div>
            <div><strong>User requests as Actor with:</strong> {validation?.actor_name}</div>
          </section>
        </div>

        
        <div className="row border-top py-3 mt-4">
          <header className="col-3 h4 text-muted">Status</header>
          <section className="col-9">
          <div><strong>Created on:</strong> {validation?.createdOn}</div>
            { validation?.status === "REVIEW" &&
              <div className="alert alert-info mt-4" role="alert">
                <FaGlasses/> PENDING FOR REVIEW
              </div> 
            }
            { validation?.status === "REJECTED" &&
              <>
                <div className="alert alert-danger mt-4" role="alert">
                  <FaTimes/> REJECTED
                </div>
                <div><strong>Rejected on:</strong> {validation?.validated_on}</div>
                <div><strong>Rejected by:</strong> {validation?.validatedBy}</div>
              </>
            }
            { validation?.status === "APPROVED" &&
              <>
              <div className="alert alert-success mt-4" role="alert">
                <FaCheck/> APPROVED
              </div>
              <div><strong>Approved on:</strong> {validation?.validated_on}</div>
              <div><strong>Approved by:</strong> {validation?.validatedBy}</div>
            </>
            }
          </section>
        </div>

        {rejectCard}
        {approveCard}
        
        { validation?.status === "REVIEW" && isAdmin?.current &&
        <div className="row border-top py-3 mt-4">
          <header className="col-3 h4 text-muted">Actions</header>
          <section className="col-9">
          <Link
            className="btn btn-light border-black text-success"
            to={`/validations/${params.id}/approve#alert-spot`}>
            <FaCheck /> Approve
          </Link>
          <Link
            className="btn btn-light mx-4 text-danger border-black"
            to={`/validations/${params.id}/reject#alert-spot`}>
            <FaTimes /> Reject
          </Link>
        
          </section>
        </div>

        }

      
        <Link
            className="btn btn-secondary my-4"
            to={`/validations`}>
            Back
        </Link>
      
        <span id="alert-spot" />
      </div>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
}

export { RequestValidation, Validations, ValidationDetails };
