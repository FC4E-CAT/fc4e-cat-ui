import { Assessment, AssessmentStats } from "@/types";
import imgLogo from "@/assets/logo-cat.png";
import {
  Page,
  Image,
  View,
  Document,
  PDFDownloadLink,
  Text,
} from "@react-pdf/renderer";
import imgAssessmentBadgePassed from "@/assets/badge-passed.png";
import imgAssessmentBadgeWip from "@/assets/badge-wip.png";
import imgAssessmentBadgeFailed from "@/assets/badge-failed.png";
import { FaDownload } from "react-icons/fa";

interface AssessmentPdfProps {
  assessmentDoc: Assessment;
  assessmentStats: AssessmentStats;
}

/** AssessmentPdf creates a pdf document with the results */
const AssessmentPdf = (props: AssessmentPdfProps) => {
  const assessment = props.assessmentDoc;

  // Create Document Component
  const PdfDoc = () => (
    <Document>
      <Page size="A4" style={{ padding: "20pt" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottom: "1px solid black",
            paddingBottom: "5",
            justifyContent: "space-between",
          }}
        >
          <Image src={imgLogo} style={{ width: "20vh" }} />
          <Text>Assessment Results</Text>
          {!assessment.published && (
            <Text
              style={{
                backgroundColor: "black",
                color: "white",
                paddingVertical: "5",
                paddingHorizontal: "10",
                alignContent: "center",
              }}
            >
              Draft
            </Text>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: "10",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text>{assessment.name}</Text>
            <Text style={{ fontSize: "12" }}>
              Compliance policy: {assessment.assessment_type.name}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: "15" }}>
              <Text style={{ fontSize: "12" }}>Compliance:</Text>
              {assessment.result.compliance === null ? (
                <Text style={{ fontFamily: "Helvetica-Bold", color: "orange" }}>
                  n/a
                </Text>
              ) : assessment.result.compliance ? (
                <Text style={{ fontFamily: "Helvetica-Bold", color: "green" }}>
                  pass
                </Text>
              ) : (
                <Text style={{ fontFamily: "Helvetica-Bold", color: "red" }}>
                  fail
                </Text>
              )}
            </View>
            <View>
              <Text style={{ fontSize: "12" }}>Ranking:</Text>
              <Text>n/a</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: "10",
            paddingTop: "10",
            borderTop: "1px solid black",
            justifyContent: "space-between",
            paddingBottom: "10",
            borderBottom: "1px solid black",
          }}
        >
          <View style={{ width: "30%" }}>
            <Image
              src={
                assessment.result.compliance === null
                  ? imgAssessmentBadgeWip
                  : assessment.result.compliance
                    ? imgAssessmentBadgePassed
                    : imgAssessmentBadgeFailed
              }
              style={{ width: "100%" }}
            />
          </View>
          <View style={{ marginLeft: "10", width: "30%" }}>
            <Text style={{ fontSize: "12", fontFamily: "Helvetica-Bold" }}>
              Statistics
            </Text>
            <View style={{ marginTop: 5, flexDirection: "row" }}>
              <Text style={{ fontSize: "12" }}>Principles: </Text>
              <Text style={{ fontSize: "12", fontFamily: "Helvetica-Bold" }}>
                {props.assessmentStats.total_principles}
              </Text>
            </View>
            <View style={{ marginTop: 5, flexDirection: "row" }}>
              <Text style={{ fontSize: "12" }}>Criteria: </Text>
              <Text style={{ fontSize: "12", fontFamily: "Helvetica-Bold" }}>
                {props.assessmentStats.total_criteria}
              </Text>
            </View>
            <View style={{ marginTop: 5, flexDirection: "row" }}>
              <Text style={{ fontSize: "12", marginLeft: "10" }}>
                • Mandatory:{" "}
              </Text>
              <Text style={{ fontSize: "12", fontFamily: "Helvetica-Bold" }}>
                {props.assessmentStats.completed_mandatory}
              </Text>
              <Text
                style={{
                  fontSize: "12",
                  fontFamily: "Helvetica-Bold",
                  color: "grey",
                }}
              >
                /{props.assessmentStats.total_mandatory}
              </Text>
            </View>
            <View style={{ marginTop: 5, flexDirection: "row" }}>
              <Text style={{ fontSize: "12", marginLeft: "10" }}>
                • Optional:{" "}
              </Text>
              <Text style={{ fontSize: "12", fontFamily: "Helvetica-Bold" }}>
                {props.assessmentStats.completed_optional}
              </Text>
              <Text
                style={{
                  fontSize: "12",
                  fontFamily: "Helvetica-Bold",
                  color: "grey",
                }}
              >
                /{props.assessmentStats.total_optional}
              </Text>
            </View>
          </View>
          <View style={{ width: "500px" }}>
            <View
              style={{
                padding: "10",
                border: "1px solid grey",
                marginLeft: "20",
                borderRadius: "5",
              }}
            >
              <Text style={{ fontSize: "14", fontFamily: "Helvetica-Bold" }}>
                Details
              </Text>
              <View
                style={{
                  marginTop: 5,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingBottom: 5,
                  borderBottom: "1px solid grey",
                }}
              >
                <View>
                  <Text
                    style={{ fontSize: "12", fontFamily: "Helvetica-Bold" }}
                  >
                    Actor:
                  </Text>
                </View>
                <View style={{ width: "200px" }}>
                  <Text style={{ fontSize: "12" }}>
                    {props.assessmentDoc.actor.name}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  marginTop: 5,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingBottom: 5,
                  borderBottom: "1px solid grey",
                }}
              >
                <View>
                  <Text
                    style={{ fontSize: "12", fontFamily: "Helvetica-Bold" }}
                  >
                    Organization:
                  </Text>
                </View>
                <View style={{ width: "200px" }}>
                  <Text style={{ fontSize: "12" }}>
                    {props.assessmentDoc.organisation.name}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  marginTop: 5,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingBottom: 5,
                  borderBottom: "1px solid grey",
                }}
              >
                <View>
                  <Text
                    style={{ fontSize: "12", fontFamily: "Helvetica-Bold" }}
                  >
                    Subject:
                  </Text>
                </View>
                <View style={{ width: "200px" }}>
                  <Text style={{ fontSize: "12" }}>
                    {props.assessmentDoc.subject.name} /{" "}
                    {props.assessmentDoc.subject.type}{" "}
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 5, flexDirection: "row" }}>
                <View>
                  <Text
                    style={{ fontSize: "12", fontFamily: "Helvetica-Bold" }}
                  >
                    Latest Update:
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: "12" }}>
                    {props.assessmentDoc.timestamp.split(" ")[0]}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <>
          {props.assessmentDoc.principles.map((pri) => {
            return (
              <View style={{ marginTop: "20" }} key={pri.id}>
                <View>
                  <Text style={{ fontSize: "14" }}>
                    {pri.id} - {pri.name}
                  </Text>
                  <Text
                    style={{ fontSize: "12", color: "grey", marginTop: "2" }}
                  >
                    {pri.description}
                  </Text>
                </View>
                {pri.criteria.map((cri) => {
                  return (
                    <View
                      key={cri.id}
                      wrap={false}
                      style={{
                        border: "1px solid grey",
                        marginTop: "10",
                        marginLeft: "10",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "lightgrey",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          padding: "5",
                        }}
                      >
                        <View style={{ flexDirection: "row" }}>
                          <Text style={{ fontSize: "12" }}>
                            {cri.id} - {cri.name}{" "}
                          </Text>
                          <Text
                            style={{
                              fontSize: "10",
                              marginLeft: "10",
                              fontFamily: "Helvetica-Bold",
                              border: "1px solid grey",
                              paddingHorizontal: "6",
                              paddingVertical: "2",
                              borderRadius: "20",
                              backgroundColor: "white",
                            }}
                          >
                            {cri.imperative}
                          </Text>
                        </View>

                        {cri.metric.result === null ? (
                          <Text
                            style={{
                              fontSize: "12",
                              fontFamily: "Helvetica-Bold",
                              color: "orange",
                            }}
                          >
                            n/a
                          </Text>
                        ) : cri.metric.result ? (
                          <Text
                            style={{
                              fontSize: "12",
                              fontFamily: "Helvetica-Bold",
                              color: "green",
                            }}
                          >
                            pass
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontSize: "12",
                              fontFamily: "Helvetica-Bold",
                              color: "red",
                            }}
                          >
                            fail
                          </Text>
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: "10",
                          padding: "5",
                          borderBottom: "1px dashed grey",
                        }}
                      >
                        {cri.description}
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: "15px",
                          paddingTop: "15px",
                        }}
                      >
                        {cri.metric.tests.map((test) => {
                          const textTokens = test.text.split("|");
                          const reqEvidence = test.type.endsWith("-Evidence");
                          const params = test.params
                            .split("|")
                            .filter((item) => item !== "evidence");

                          return (
                            <View key={test.id} style={{ marginBottom: "15" }}>
                              <Text
                                style={{
                                  fontSize: "10",
                                  marginBottom: "2",
                                  color: "grey",
                                }}
                              >
                                {test.id}-{test.name}
                              </Text>
                              <View style={{ flexDirection: "row" }}>
                                <Text
                                  style={{
                                    fontSize: "12",
                                    fontFamily: "Helvetica-Bold",
                                  }}
                                >
                                  Q:{" "}
                                </Text>
                                <Text style={{ fontSize: "12", width: "90%" }}>
                                  {textTokens[0]}
                                </Text>
                              </View>
                              <View style={{ flexDirection: "row" }}>
                                <Text
                                  style={{
                                    fontSize: "12",
                                    fontFamily: "Helvetica-Bold",
                                  }}
                                >
                                  A:{" "}
                                </Text>
                                {[
                                  "binary",
                                  "Binary-Binary",
                                  "Binary-Manual",
                                  "Binary-Manual-Evidence",
                                ].includes(test.type) ? (
                                  <Text style={{ fontSize: "12" }}>
                                    {test.result === null
                                      ? "n/a"
                                      : test.result
                                        ? "Yes"
                                        : "No"}
                                  </Text>
                                ) : (
                                  <View style={{ fontSize: "12" }}>
                                    {params.map((item, indx) => {
                                      return indx === params.length - 1 ? (
                                        <Text>
                                          {item}
                                          {": "}
                                          {test.value || "n/a"}
                                        </Text>
                                      ) : (
                                        <Text>
                                          {item}
                                          {": n/a"}
                                        </Text>
                                      );
                                    })}
                                  </View>
                                )}
                              </View>
                              {reqEvidence && textTokens.length > 1 && (
                                <View
                                  style={{ fontSize: "11", color: "#696969" }}
                                >
                                  <View
                                    style={{
                                      marginTop: "5",
                                      marginBottom: "5",
                                    }}
                                  >
                                    <Text>{textTokens[1]}</Text>
                                  </View>
                                  {test.evidence_url &&
                                  test.evidence_url.length > 0 ? (
                                    <View>
                                      {test.evidence_url.map((item, indx) => {
                                        return (
                                          <View
                                            key={indx}
                                            style={{
                                              marginBottom: "2",
                                              flexDirection: "row",
                                            }}
                                          >
                                            <View>
                                              <Text>[{indx}] </Text>
                                            </View>
                                            <View style={{ width: "90%" }}>
                                              <Text>{item.url}</Text>
                                              {item.description && (
                                                <Text>{item.description}</Text>
                                              )}
                                            </View>
                                          </View>
                                        );
                                      })}
                                    </View>
                                  ) : (
                                    <View>
                                      <Text> - No evidence provided</Text>
                                    </View>
                                  )}
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </>
      </Page>
    </Document>
  );

  return (
    <div className="p-2">
      <PDFDownloadLink
        className="btn btn-success"
        document={<PdfDoc />}
        fileName={`${props.assessmentDoc.id}.pdf`}
      >
        <FaDownload /> Download PDF
      </PDFDownloadLink>
    </div>
  );
};

export default AssessmentPdf;
