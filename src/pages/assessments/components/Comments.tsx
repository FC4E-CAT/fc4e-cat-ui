/**
 * Component to display assessment comments
 */

import {
  useAssessmentCommentAdd,
  useAssessmentCommentDelete,
  useAssessmentCommentUpdate,
  useGetAssessmentComments,
} from "@/api";
import { AuthContext } from "@/auth";
import { AlertInfo, AssessmentComment } from "@/types";
import { useContext, useEffect, useRef, useState } from "react";
import { Col, Form, ListGroup, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaEdit, FaTimes, FaUser } from "react-icons/fa";

export const Comments = ({ id }: { id: string }) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [page] = useState<number>(1);
  // state: list of comments
  const [comments, setComments] = useState<AssessmentComment[]>([]);
  // state: target comment id (for update or deletion)
  const [commentId, setCommentId] = useState(-1);
  // state: comment text at input text area (for adding a new comment or updating an existing one)
  const [commentText, setCommentText] = useState("");
  // state: mode to delete something activated or not
  const [toDelete, setToDelete] = useState(false);
  const { t } = useTranslation();
  // alert used in notifications
  const alert = useRef<AlertInfo>({
    message: "",
  });

  // call the query/mutation hooks to be available
  const mutateAdd = useAssessmentCommentAdd(keycloak?.token || "", id);
  const mutateUpdate = useAssessmentCommentUpdate(
    keycloak?.token || "",
    id,
    commentId,
  );
  const mutateDelete = useAssessmentCommentDelete(
    keycloak?.token || "",
    id,
    commentId,
  );

  const { data, fetchNextPage, hasNextPage } = useGetAssessmentComments(id, {
    size: 10,
    page: page,
    sortBy: "asc",
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // handle backend call to add a new comment (based on state: commentText)
  function handleAdd() {
    const promise = mutateAdd
      .mutateAsync({
        text: commentText,
      })
      .catch((err) => {
        alert.current = {
          message: `${t("error")}: ` + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        setCommentId(-1);
        setCommentText("");
        alert.current = {
          message: t("page_assessment_edit.toast_comment_add_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_assessment_edit.toast_comment_add_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  // handle backend call to update a specific comment (based on state: commentId and commentText)
  function handleUpdate() {
    const promise = mutateUpdate
      .mutateAsync({
        text: commentText,
      })
      .catch((err) => {
        alert.current = {
          message: `${t("error")}: ` + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        setCommentId(-1);
        setCommentText("");
        alert.current = {
          message: t("page_assessment_edit.toast_comment_update_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_assessment_edit.toast_comment_update_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  function handleDelete() {
    const promise = mutateDelete
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: `${t("error")}: ` + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        setCommentId(-1);
        setCommentText("");
        alert.current = {
          message: t("page_assessment_edit.toast_comment_delete_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_assessment_edit.toast_comment_delete_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  // handler to scroll on top when updating a new comment
  const resetScroll = () => {
    const commentsArea =
      document.querySelector<HTMLElement>("#cat-comments-area");
    if (commentsArea) {
      // Scroll to the top
      commentsArea.scrollTop = 0;
    }
  };

  // get all comments from the specific assessment page by page
  useEffect(() => {
    // gather all actor/org/type mappings in one array
    let tmpComments: AssessmentComment[] = [];

    // iterate over backend pages and gather all items in the actorMappings array
    if (data?.pages) {
      data.pages.map((page) => {
        tmpComments = [...tmpComments, ...page.content];
      });
      if (hasNextPage) {
        fetchNextPage();
      }
    }

    setComments(tmpComments);
  }, [data, hasNextPage, fetchNextPage]);

  return (
    <div>
      <Form.Control
        as="textarea"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && commentText !== "") {
            if (commentId === -1) {
              handleAdd();
            } else {
              handleUpdate();
            }
          }
        }}
        placeholder={t("page_assessment_edit.add_comment_placeholder")}
        id="input-add-comment"
        rows={3}
      />
      <div className="text-end mt-1">
        {commentId !== -1 && !toDelete ? (
          <>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => {
                handleUpdate();
              }}
            >
              {t("page_assessment_edit.update_comment")}
            </button>
            <button
              className="btn btn-sm btn-secondary ms-1"
              onClick={() => {
                setCommentText("");
                setCommentId(-1);
              }}
            >
              {t("buttons.cancel")}
            </button>
          </>
        ) : (
          <button
            className="btn btn-sm btn-success"
            onClick={() => {
              handleAdd();
            }}
          >
            {t("page_assessment_edit.add_comment")}
          </button>
        )}
      </div>
      <hr />
      {comments.length > 0 ? (
        <ListGroup>
          {comments.map((item) => {
            return (
              <ListGroup.Item
                key={item.id}
                className={
                  item.id === commentId
                    ? toDelete
                      ? "bg-danger text-white"
                      : "bg-warning"
                    : ""
                }
              >
                <Row>
                  <Col>
                    <small>
                      <strong>
                        <FaUser className="me-1" />
                        {`${item.user.name} ${item.user.surname}`}
                      </strong>
                    </small>
                  </Col>
                  <Col md="auto">
                    <small>{item.created_on}</small>
                  </Col>
                </Row>
                <Row>
                  <small className="text-muted">{item.user.email}</small>
                </Row>
                <div className="border-top mb-2 p-1">
                  <span className="mt-2">{item.text}</span>
                </div>
                <div
                  className={
                    toDelete && item.id === commentId
                      ? "text-end"
                      : "cat-comment-buttons text-end"
                  }
                >
                  {toDelete && item.id === commentId ? (
                    <>
                      <span> {t("page_assessment_edit.confirm_question")}</span>
                      <button
                        className="ms-2 btn btn-sm btn-danger border-white"
                        onClick={() => {
                          handleDelete();
                        }}
                      >
                        {t("buttons.delete")}
                      </button>
                      <button
                        className="ms-2 btn btn-sm btn-secondary"
                        onClick={() => {
                          setToDelete(false);
                          setCommentId(-1);
                        }}
                      >
                        {t("buttons.cancel")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setCommentText(item.text);
                          setCommentId(item.id);
                          resetScroll();
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="ms-2 btn btn-sm btn-secondary"
                        onClick={() => {
                          setCommentId(item.id);
                          setToDelete(true);
                        }}
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      ) : (
        <span>{t("page_assessment_edit.no_comments")}</span>
      )}
    </div>
  );
};
