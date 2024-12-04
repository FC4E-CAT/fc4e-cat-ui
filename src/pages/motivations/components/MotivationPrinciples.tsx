import { useGetMotivationPrinciples } from "@/api/services/motivations";
import { AuthContext } from "@/auth";
import { Principle } from "@/types";
import { useContext, useEffect, useState } from "react";
import { Button, Col, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import notavailImg from "@/assets/thumb_notavail.png";
import { FaPlus } from "react-icons/fa";
import { PrincipleModal } from "@/pages/principles/components/PrincipleModal";

export const MotivationPrinciples = ({
  mtvId,
  published,
}: {
  mtvId: string;
  published: boolean;
}) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [mtvPrinciples, setMtvPrinciples] = useState<Principle[]>([]);

  const [showCreatePri, setShowCreatePri] = useState(false);

  const {
    data: priData,
    fetchNextPage: priFetchNextPage,
    hasNextPage: priHasNextPage,
  } = useGetMotivationPrinciples(mtvId, {
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all principles in one array
    let tmpPri: Principle[] = [];

    // iterate over backend pages and gather all items in the principles array
    if (priData?.pages) {
      priData.pages.map((page) => {
        tmpPri = [...tmpPri, ...page.content];
      });
      if (priHasNextPage) {
        priFetchNextPage();
      }
    }
    setMtvPrinciples(tmpPri);
  }, [priData, priHasNextPage, priFetchNextPage]);

  return (
    <div className="px-5 mt-4">
      <PrincipleModal
        principle={null}
        show={showCreatePri}
        mtvId={mtvId}
        onHide={() => {
          setShowCreatePri(false);
        }}
      />
      <div className="d-flex justify-content-between mb-2">
        <h5 className="text-muted cat-view-heading ">
          List of principles
          <p className="lead cat-view-lead">
            <span className="text-sm">
              Principles related with criteria under motivation
            </span>
          </p>
        </h5>

        <div>
          <Button
            variant="warning"
            onClick={() => {
              setShowCreatePri(true);
            }}
            disabled={published}
          >
            <FaPlus /> Create Principle
          </Button>
        </div>
      </div>
      <div>
        <ListGroup>
          {mtvPrinciples.map((item) => (
            <ListGroupItem key={item.id}>
              <Row>
                <Col>
                  <div className="flex items-center ng-star-inserted">
                    <div className="margin-right-8 flex justify-center items-center ng-star-inserted radio-card-icon">
                      <img
                        src={notavailImg}
                        className="text-center m-1 rounded-full"
                        width="60%"
                      />
                    </div>
                    <div>
                      <div className="flex text-sm text-gray-900 font-weight-500 items-center cursor-pointer">
                        {item.pri}
                        {" - "}
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-600 ng-star-inserted">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};
