/**
 * Component to that displays a list of validated actor roles in organisations and allows the user to select one
 * as a basis for a new assessment
 */
import { useContext, useState } from "react";
import {
  InputGroup,
  Form,
  Row,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import { AuthContext } from "@/auth";
import { AssessmentSubject } from "@/types";
import { useGetSubjects } from "@/api/services/subjects";
import { useTranslation } from "react-i18next";

type AssessmentSelectSubjectProps = {
  subject: AssessmentSubject;
  onSubjectChange(subject: AssessmentSubject): void;
  reqFields: string[];
};

export const AssessmentSelectSubject = (
  props: AssessmentSelectSubjectProps,
) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const { data } = useGetSubjects({
    size: 100,
    page: 1,
    sortBy: "asc",
    token: keycloak?.token || "",
    isRegistered: registered,
  });
  const { t } = useTranslation();
  const [selected, setSelected] = useState(props.subject.id || "-1");

  function handleSubjectChange(fieldName: string, value: string) {
    return {
      ...props.subject,
      [fieldName]: value,
    };
  }

  return (
    <>
      <div className="mb-">
        <h6>{t("page_assessment_edit.select_subject_text")}</h6>
      </div>
      <Row className="mb-2">
        <div className="input-group mb-3">
          <label className="input-group-text" htmlFor="inputGroupSelect01">
            {" "}
            {t("fields.subject")} (*)
          </label>
          <select
            className="form-select"
            id="subject_id"
            value={selected}
            onChange={(e) => {
              const subject = data?.content
                .filter((t) => t.id === parseInt(e.target.value))
                .map((t) => {
                  return t;
                });
              if (subject !== undefined) {
                props.onSubjectChange({
                  db_id: subject[0].id,
                  name: subject[0].name,
                  type: subject[0].type,
                  id: subject[0].subject_id,
                });
                setSelected(e.target.value);
              }
            }}
          >
            <option disabled value={-1}>
              {t("page_assessment_edit.select_object")}
            </option>
            {data?.content &&
              data?.content.map((t, i) => {
                return (
                  <option key={`type-${i}`} value={t.id}>
                    {t.name}-{t.type}-{t.subject_id}
                  </option>
                );
              })}
          </select>
          <button
            className={
              selected !== "-1"
                ? "btn btn-outline-danger"
                : "btn btn-outline-danger disabled"
            }
            type="button"
            disabled={selected === "-1" ? true : false}
            onClick={() => {
              setSelected("-1");
              props.onSubjectChange({
                id: "",
                name: "",
                type: "",
              });
            }}
          >
            {t("buttons.clear_selection")}
          </button>
        </div>
      </Row>
      <Row>
        <Row>
          <InputGroup className="mb-1">
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id={`tooltip-top`}>
                  {t("page_subjects.tip_subject_id")}
                </Tooltip>
              }
            >
              <InputGroup.Text id="label-info-subject-id">
                <FaInfoCircle className="me-2" />{" "}
                {t("page_subjects.subject_id")} (*)
              </InputGroup.Text>
            </OverlayTrigger>
            <Form.Control
              disabled={selected != "-1"}
              id="input-info-subject-id"
              placeholder={t("page_subjects.subject_id_placeholder")}
              value={props.subject?.id || ""}
              maxLength={200}
              onChange={(e) => {
                props.onSubjectChange(
                  handleSubjectChange("id", e.target.value),
                );
              }}
              aria-describedby="label-info-subject-id"
              className={
                props.reqFields.includes("subject_id") ? "is-invalid" : ""
              }
            />
          </InputGroup>
          {props.reqFields.includes("subject_id") && (
            <p className="text-danger text-end">
              {t("page_subjects.err_subject_id")}
            </p>
          )}
        </Row>
        <Row>
          <InputGroup className="mb-1 mt-2">
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id={`tooltip-top`}>
                  {t("page_subjects.tip_subject_name")}
                </Tooltip>
              }
            >
              <InputGroup.Text id="label-info-subject-name">
                <FaInfoCircle className="me-2" />{" "}
                {t("page_subjects.subject_name")} (*)
              </InputGroup.Text>
            </OverlayTrigger>
            <Form.Control
              disabled={selected != "-1"}
              id="input-info-subject-name"
              placeholder={t("page_subjects.subject_name_placeholder")}
              value={props.subject?.name || ""}
              maxLength={200}
              onChange={(e) => {
                props.onSubjectChange(
                  handleSubjectChange("name", e.target.value),
                );
              }}
              aria-describedby="label-info-subject-name"
              className={
                props.reqFields.includes("subject_name") ? "is-invalid" : ""
              }
            />
          </InputGroup>
          {props.reqFields.includes("subject_name") && (
            <p className="text-danger text-end">
              {t("page_subjects.err_subject_name")}
            </p>
          )}
        </Row>
        <Row>
          <InputGroup className="mb-1 mt-2">
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id={`tooltip-top`}>
                  {t("page_subjects.tip_subject_type")}
                </Tooltip>
              }
            >
              <InputGroup.Text id="label-info-subject-type">
                <FaInfoCircle className="me-2" />{" "}
                {t("page_subjects.subject_type")} (*)
              </InputGroup.Text>
            </OverlayTrigger>
            <Form.Control
              disabled={selected != "-1"}
              id="input-info-subject-type"
              placeholder={t("page_subjects.subject_type_placeholder")}
              value={props.subject?.type || ""}
              maxLength={200}
              onChange={(e) => {
                props.onSubjectChange(
                  handleSubjectChange("type", e.target.value),
                );
              }}
              aria-describedby="label-info-subject-type"
              className={
                props.reqFields.includes("subject_type") ? "is-invalid" : ""
              }
            />
          </InputGroup>
          {props.reqFields.includes("subject_type") && (
            <p className="text-danger text-end">
              {t("page_subjects.err_subject_type")}
            </p>
          )}
        </Row>
      </Row>
    </>
  );
};
