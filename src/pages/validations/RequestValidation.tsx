import {
  useGetProfile,
  useGetActors,
  useValidationRequest,
  useOrganisationRORSearch,
} from "@/api";
import { AuthContext } from "@/auth";
import {
  UserProfile,
  AlertInfo,
  Actor,
  OrganisationRORSearchResultModified,
} from "@/types";
import { ErrorMessage } from "@hookform/error-message";
import { useContext, useState, useRef, useEffect } from "react";
import { OverlayTrigger, Tooltip, Row, Col, InputGroup } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaInfoCircle, FaIdBadge } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import Select, { SingleValue } from "react-select";

function RequestValidation() {
  const navigate = useNavigate();

  const { keycloak, registered } = useContext(AuthContext)!;

  const { data: profileData } = useGetProfile({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const alert = useRef<AlertInfo>({
    message: "",
  });
  useEffect(() => {
    setUserProfile(profileData);
  }, [profileData]);

  const { data: actorsData } = useGetActors({
    size: 100,
    page: 1,
    sortBy: "asc",
  });

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

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      organisation_role: organisation_role,
      organisation_id: organisation_id,
      organisation_source: organisation_source,
      organisation_name: organisation_name,
      organisation_website: organisation_website,
      actor_id: actor_id,
    },
  });

  const { mutateAsync: refetchValidationRequest } = useValidationRequest({
    organisation_role: organisation_role,
    organisation_id: organisation_id,
    organisation_source: organisation_source,
    organisation_name: organisation_name,
    organisation_website: organisation_website,
    actor_id: actor_id,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const { data: organisations } = useOrganisationRORSearch({
    name: inputValue,
    page: 1,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setOrganisationRole(data.organisation_role);
    setOrganisationID(data.organisation_id);
    setOrganisationSource(data.organisation_source);
    setOrganisationName(data.organisation_name);
    setOrganisationWebsite(data.organisation_website);
    setActorID(data.actor_id);
    const promise = refetchValidationRequest()
      .catch((err) => {
        console.log(err);
        alert.current = {
          message: `Error during validation request submission:\n${err.response.data.message}`,
        };
        throw err; // throw again after you catch
      })
      .then(() => {
        alert.current = {
          message: "Validation request succesfully submitted.",
        };
      })
      .then(() => navigate("/validations"));
    toast.promise(promise, {
      loading: "Submitting",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const renderOptions = () => {
    let tmp = [];
    const result: OrganisationRORSearchResultModified[] = [];
    if (organisations?.content) {
      tmp = organisations?.content;
      for (let i = 0; i < tmp.length; i++) {
        const t: OrganisationRORSearchResultModified = {
          value: tmp[i]["name"],
          label: tmp[i]["name"],
          website: tmp[i]["website"],
          id: tmp[i]["id"],
          acronym: tmp[i]["acronym"],
        };
        result.push(t);
      }
      return result;
    } else return [];
  };

  const updateForm = (s: SingleValue<OrganisationRORSearchResultModified>) => {
    setValue("organisation_id", s?.id || "");
    setValue("organisation_name", s?.value || "");
    setValue("organisation_website", s?.website || "");
  };

  // hook-form utility methods to watch and change values
  const watchOrgSource = watch("organisation_source", "ROR");

  const actors_select_div = (
    <>
      <label
        htmlFor="actors"
        className="d-flex align-items-center form-label fw-bold"
      >
        <FaInfoCircle className="me-2" /> Actor (*)
      </label>
      <OverlayTrigger
        key="top"
        placement="top"
        overlay={
          <Tooltip id="tooltip-top-org-role">
            The organisation’s role (actor) as defined in the EOSC PID Policy
          </Tooltip>
        }
      >
        <select
          className={`form-select ${errors.actor_id ? "is-invalid" : ""}`}
          id="actor_id"
          {...register("actor_id", {
            required: true,
            validate: (value) => value > -1 || "Please select an option",
          })}
        >
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
      </OverlayTrigger>
      <ErrorMessage
        errors={errors}
        name="actor_id"
        render={({ message }) => <p className="text-danger">{message}</p>}
      />
    </>
  );

  return (
    <div>
      <div className="cat-view-heading-block row border-bottom">
        <div className="col col-lg-6">
          <h2 className="cat-view-heading text-muted">
            Create new validation request
            <p className="lead cat-view-lead">
              Fill in the required inputs for a new validation request.
            </p>
          </h2>
        </div>
        <div className="col-md-auto"></div>
      </div>
      <form className="mt-4 py-4 px-4" onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col className="mt-3" xs={12} md={6}>
            <label
              htmlFor="organisation_name"
              className="d-flex align-items-center form-label fw-bold"
            >
              <FaInfoCircle className="me-2" /> Organisation Name (*)
            </label>
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id="tooltip-top-org-name">Organisation Name</Tooltip>
              }
            >
              {watchOrgSource === "ROR" ? (
                <>
                  {/* hidden field to just validate the combo below */}
                  <input
                    type="hidden"
                    {...register("organisation_name", {
                      required: {
                        value: true,
                        message: "Organisation name is required",
                      },
                    })}
                  />
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    onInputChange={(value) => setInputValue(value)}
                    onChange={(s) => updateForm(s)}
                    isSearchable={true}
                    name="organisation_name"
                    options={renderOptions()}
                    filterOption={() => true}
                  />
                </>
              ) : (
                <input
                  type="text"
                  className={`form-control ${
                    errors.organisation_name ? "is-invalid" : ""
                  }`}
                  id="organisation_name"
                  aria-describedby="organisation_name_help"
                  {...register("organisation_name", {
                    required: {
                      value: true,
                      message: "Organisation name is required",
                    },
                  })}
                  onChange={(e) => {
                    setValue("organisation_name", e.target.value);
                    setValue("organisation_id", e.target.value);
                  }}
                />
              )}
            </OverlayTrigger>
            <ErrorMessage
              errors={errors}
              name="organisation_name"
              render={({ message }) => <p className="text-danger">{message}</p>}
            />
          </Col>
          <Col className="mt-3" xs={12} md={3}>
            <label
              htmlFor="organisation_source"
              className="d-flex align-items-center form-label fw-bold"
            >
              <FaInfoCircle className="me-2" /> Organisation Source (*)
            </label>
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id="tooltip-top-org-source">
                  Source of a persistent identifier representing the
                  organisation (ROR)
                </Tooltip>
              }
            >
              <select
                className={`form-select ${
                  errors.organisation_source ? "is-invalid" : ""
                }`}
                id="organisation_source"
                aria-describedby="organisation_source_help"
                {...register("organisation_source", {
                  required: {
                    value: true,
                    message: "Organisation Source is required",
                  },
                  minLength: { value: 3, message: "Minimum length is 3" },
                })}
                defaultValue="ROR"
                onChange={(e) => {
                  setValue("organisation_source", e.target.value);
                  setValue("organisation_name", "");
                  setValue("organisation_website", "");
                }}
              >
                <option value="ROR">ROR</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </OverlayTrigger>
            <ErrorMessage
              errors={errors}
              name="organisation_source"
              render={({ message }) => <p className="text-danger">{message}</p>}
            />
          </Col>
          <Col className="mt-3" xs={12} md={3}>
            <label
              htmlFor="organisation_website"
              className="d-flex align-items-center form-label fw-bold"
            >
              <FaInfoCircle className="me-2" />
              Organisation Website
            </label>
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id="tooltip-top-org-website">
                  The organisation’s website
                </Tooltip>
              }
            >
              <input
                type="text"
                className={`form-control ${
                  errors.organisation_website ? "is-invalid" : ""
                }`}
                id="organisation_website"
                aria-describedby="organisation_website_help"
                disabled={watchOrgSource === "ROR"}
                {...register("organisation_website", {})}
              />
            </OverlayTrigger>
            <ErrorMessage
              errors={errors}
              name="organisation_website"
              render={({ message }) => <p className="text-danger">{message}</p>}
            />
          </Col>
        </Row>
        <Row>
          <Col className="mt-3" xs={12} md={6}>
            <label
              htmlFor="organisation_role"
              className="d-flex align-items-center form-label fw-bold"
            >
              <FaInfoCircle className="me-2" /> Organisation Role (*)
            </label>
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id="tooltip-top-org-role">
                  The user’s role in the organisation
                </Tooltip>
              }
            >
              <input
                type="text"
                className={`form-control ${
                  errors.organisation_role ? "is-invalid" : ""
                }`}
                id="organisation_role"
                aria-describedby="organisation_role_help"
                {...register("organisation_role", {
                  required: {
                    value: true,
                    message: "Organisation Role is required",
                  },
                })}
              />
            </OverlayTrigger>
            <ErrorMessage
              errors={errors}
              name="organisation_role"
              render={({ message }) => <p className="text-danger">{message}</p>}
            />
          </Col>
          <Col className="mt-3" xs={12} md={6}>
            {actors && actors.length > 0 ? actors_select_div : null}
          </Col>
        </Row>

        <Row className="mt-3">
          <span className="form-label fw-bold">User Details (*)</span>
          <Col sm={12} md={4}>
            <InputGroup className="mb-2">
              <InputGroup.Text>Name: </InputGroup.Text>
              <input
                type="text"
                className={`form-control`}
                id="user_name"
                aria-describedby="user_name_help"
                disabled={true}
                value={userProfile?.name || ""}
              />
            </InputGroup>
          </Col>
          <Col sm={12} md={4}>
            <InputGroup className="mb-2">
              <InputGroup.Text>Surname: </InputGroup.Text>
              <input
                type="text"
                className={`form-control`}
                id="user_name"
                aria-describedby="user_name_help"
                disabled={true}
                value={userProfile?.surname || ""}
              />
            </InputGroup>
          </Col>
          <Col sm={12} md={4}>
            <InputGroup className="mb-2">
              <InputGroup.Text>Email: </InputGroup.Text>
              <input
                type="text"
                className={`form-control`}
                id="user_name"
                aria-describedby="user_name_help"
                disabled={true}
                value={userProfile?.email || ""}
              />
            </InputGroup>
          </Col>
        </Row>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <button
            id="create_validation"
            className="btn btn-light border-black"
            type="submit"
          >
            Submit
          </button>
          <Link to="/validations" className="my-2 btn btn-secondary mx-3">
            <span>Cancel</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RequestValidation;
