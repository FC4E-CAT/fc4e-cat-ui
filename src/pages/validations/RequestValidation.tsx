import {
  useGetProfile,
  useValidationRequest,
  useOrganisationRORSearch,
  useGetAllRegistryActors,
} from "@/api";
import { AuthContext } from "@/auth";
import {
  UserProfile,
  AlertInfo,
  OrganisationRORSearchResultModified,
  RegistryActor,
} from "@/types";
import { ErrorMessage } from "@hookform/error-message";
import { useContext, useState, useRef, useEffect } from "react";
import { OverlayTrigger, Tooltip, Row, Col, InputGroup } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import Select, { SingleValue } from "react-select";

function RequestValidation() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const [actors, setActors] = useState<RegistryActor[]>();

  const {
    data: actData,
    fetchNextPage: actFetchNextPage,
    hasNextPage: actHasNextPage,
  } = useGetAllRegistryActors({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all registry actors types
    let tmpAct: RegistryActor[] = [];

    // iterate over backend pages and gather all items in the registry actors array
    if (actData?.pages) {
      actData.pages.map((page) => {
        tmpAct = [...tmpAct, ...page.content];
      });
      if (actHasNextPage) {
        actFetchNextPage();
      }
    }

    setActors(tmpAct);
  }, [actData, actHasNextPage, actFetchNextPage]);

  type FormValues = {
    organisation_role: string;
    organisation_id: string;
    organisation_source: string;
    organisation_name: string;
    organisation_website: string;
    registry_actor_id: string;
  };

  const [organisationId, setOrganisationID] = useState("");
  const [registryActorId, setRegistryActorID] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [organisationRole, setOrganisationRole] = useState("");
  const [organisationSource, setOrganisationSource] = useState("ROR");
  const [organisationWebsite, setOrganisationWebsite] = useState("");
  const [inputValue, setInputValue] = useState("");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      organisation_role: organisationRole,
      organisation_id: organisationId,
      organisation_source: organisationSource,
      organisation_name: organisationName,
      organisation_website: organisationWebsite,
      registry_actor_id: registryActorId,
    },
  });

  const { mutateAsync: refetchValidationRequest } = useValidationRequest({
    organisation_role: organisationRole,
    organisation_id: organisationId,
    organisation_source: organisationSource,
    organisation_name: organisationName,
    organisation_website: organisationWebsite,
    registry_actor_id: registryActorId,
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
    setRegistryActorID(data.registry_actor_id);
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
        <FaInfoCircle className="me-2" /> {t("page_validation_create.actor")}{" "}
        (*)
      </label>
      <OverlayTrigger
        key="top"
        placement="top"
        overlay={
          <Tooltip id="tooltip-top-org-role">
            {t("page_validation_create.tip_actor")}
          </Tooltip>
        }
      >
        <select
          className={`form-select ${errors.registry_actor_id ? "is-invalid" : ""}`}
          id="registry_actor_id"
          {...register("registry_actor_id", {
            required: true,
            validate: (value) =>
              value != "" || t("page_validation_create.err_select"),
          })}
        >
          <option disabled value={""}>
            {t("page_validation_create.select_actor")}...
          </option>
          {actors &&
            actors.map((t, i) => {
              return (
                <option key={`type-${i}`} value={t.id}>
                  {t.label}
                </option>
              );
            })}
        </select>
      </OverlayTrigger>
      <ErrorMessage
        errors={errors}
        name="registry_actor_id"
        render={({ message }) => <p className="text-danger">{message}</p>}
      />
    </>
  );

  return (
    <div>
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            {t("page_validation_create.title")}
            <p className="lead cat-view-lead">
              {t("page_validation_create.subtitle")}
            </p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right"></div>
      </div>
      <form className="mt-4 py-4 px-4" onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col className="mt-3" xs={12} md={6}>
            <label
              htmlFor="organisation_name"
              className="d-flex align-items-center form-label fw-bold"
            >
              <FaInfoCircle className="me-2" />{" "}
              {t("page_validation_create.org_name")} (*)
            </label>
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id="tooltip-top-org-name">
                  {t("page_validation_create.tip_org_name")}
                </Tooltip>
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
                        message: t("page_validation_create.err_org_name"),
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
                      message: t("page_validation_create.err_org_name"),
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
              <FaInfoCircle className="me-2" />{" "}
              {t("page_validation_create.org_source")} (*)
            </label>
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id="tooltip-top-org-source">
                  {t("page_validation_create.tip_org_source")}
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
                    message: t("page_validation_create.err_org_source"),
                  },
                  minLength: {
                    value: 3,
                    message: t("page_validation_create.err_min_length"),
                  },
                })}
                defaultValue="ROR"
                onChange={(e) => {
                  setValue("organisation_source", e.target.value);
                  setValue("organisation_name", "");
                  setValue("organisation_website", "");
                }}
              >
                <option value="ROR">{t("ror")}</option>
                <option value="CUSTOM">{t("custom")}</option>
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
              {t("page_validation_create.org_website")}
            </label>
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id="tooltip-top-org-website">
                  {t("page_validation_create.tip_org_website")}
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
              <FaInfoCircle className="me-2" />{" "}
              {t("page_validation_create.org_role")} (*)
            </label>
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id="tooltip-top-org-role">
                  {t("page_validation_create.tip_org_role")}
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
                    message: t("page_validation_create.err_org_role"),
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
          <span className="form-label fw-bold">
            {" "}
            {t("page_validation_create.user_details")} (*)
          </span>
          <Col sm={12} md={4}>
            <InputGroup className="mb-2">
              <InputGroup.Text>{t("fields.name")}: </InputGroup.Text>
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
              <InputGroup.Text>{t("fields.surname")}: </InputGroup.Text>
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
              <InputGroup.Text>{t("fields.email")}: </InputGroup.Text>
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
            {t("buttons.submit")}
          </button>
          <Link to="/validations" className="my-2 btn btn-secondary mx-3">
            <span>{t("buttons.cancel")}</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RequestValidation;
