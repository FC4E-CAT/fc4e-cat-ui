import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { FaSearch, FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthContext } from "@/auth";
import {
  useGetAdminSettings,
  useUpdateAdminSetting,
} from "@/api/services/registry";
import ROUTES from "@/routes";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ZenodoFormData {
  enabled: boolean;
  zenodoApiKey: string;
  zenodoEmail: string;
  zenodoPassword: string;
}

function ZenodoSettings() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showApiKeyError, setShowApiKeyError] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<ZenodoFormData>({
    enabled: false,
    zenodoApiKey: "",
    zenodoEmail: "",
    zenodoPassword: "",
  });
  const { keycloak, registered } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { data: settings } = useGetAdminSettings({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const updateSettingMutation = useUpdateAdminSetting(keycloak?.token || "");

  const zenodoSetting = settings?.find(
    (setting) => setting.data.label === "Zenodo",
  );

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (zenodoSetting) {
      setFormData({
        enabled: zenodoSetting.enabled,
        zenodoApiKey: zenodoSetting.data.config?.["zenodo.api.key"] || "",
        zenodoEmail: zenodoSetting.data.auth?.mail || "",
        zenodoPassword: zenodoSetting.data.auth?.password || "",
      });
    }
  }, [zenodoSetting]);

  const saveSettings = async (updatedData: ZenodoFormData) => {
    if (!zenodoSetting) return false;

    setIsUpdating(true);

    try {
      const updateData = {
        enabled: updatedData.enabled,
        data: {
          config: {
            "zenodo.api.key": updatedData.zenodoApiKey.trim() || null,
          },
          auth: {
            mail: updatedData.zenodoEmail.trim() || null,
            password: updatedData.zenodoPassword.trim() || null,
          },
        },
      };

      await updateSettingMutation.mutateAsync({
        id: zenodoSetting.id,
        updateData,
      });

      toast.success("Zenodo settings updated successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to update Zenodo settings. Please try again.");
      console.error("Error updating Zenodo settings:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleChange = async (enabled: boolean) => {
    if (enabled && !formData.zenodoApiKey.trim()) {
      setShowApiKeyError(true);
      toast.error("Please enter a Zenodo API Key before enabling integration");
      return;
    }

    setShowApiKeyError(false);
    const updatedData = { ...formData, enabled };
    setFormData(updatedData);

    const success = await saveSettings(updatedData);
    if (!success) {
      setFormData((prev) => ({ ...prev, enabled: !enabled }));
    }
  };

  const handleInputChange = (
    field: keyof Omit<ZenodoFormData, "enabled">,
    value: string,
  ) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    if (field === "zenodoApiKey") {
      setShowApiKeyError(false);
    }
  };

  return (
    <div className="cat-view-heading-block">
      <div className="col mb-4">
        <h2 className="text-muted cat-view-heading">
          Zenodo Settings
          <p className="lead cat-view-lead">
            {zenodoSetting?.data.description}
          </p>
        </h2>
      </div>

      <Row className="d-flex flex-column-reverse flex-lg-row justify-content-lg-between">
        <Col lg={6} className="system-settings-items-list">
          <div className="test-method-settings-item d-flex justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2">
                <FaSearch size={16} />
                <h6 className="mb-0">Enable Zenodo Integration</h6>
              </div>
              <span className="text-muted small">
                When enabled, assessments can be published to Zenodo repository
              </span>
            </div>
            <div>
              <Form.Check
                type="switch"
                id="zenodo-enable-switch"
                checked={formData.enabled}
                onChange={(e) => handleToggleChange(e.target.checked)}
                disabled={isUpdating}
                className="test-method-switch"
                autoComplete="off"
                data-lpignore="true"
              />
            </div>
          </div>

          <div className="mb-4">
            <Form autoComplete="off" data-lpignore="true">
              <div className="my-2">
                <Form.Label
                  htmlFor="zenodo-api-key"
                  className="fw-semibold mb-0"
                >
                  Zenodo API Key <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    id="zenodo-api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your Zenodo API key"
                    value={formData.zenodoApiKey}
                    onChange={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleInputChange("zenodoApiKey", e.target.value);
                    }}
                    disabled={isUpdating || formData.enabled}
                    isInvalid={showApiKeyError}
                    autoComplete="new-password"
                    data-form-type="other"
                    data-lpignore="true"
                    style={{
                      borderColor: "#dee2e6",
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#dee2e6";
                    }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowApiKey(!showApiKey)}
                    disabled={isUpdating}
                    style={{
                      borderColor: "#dee2e6",
                      borderLeft: "none",
                      height: "32.5px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showApiKey ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
                {showApiKeyError && (
                  <Form.Text className="text-danger">Required</Form.Text>
                )}
              </div>

              <div className="mb-2">
                <Form.Label htmlFor="zenodo-email" className="fw-semibold mb-0">
                  Zenodo Email
                </Form.Label>
                <Form.Control
                  id="zenodo-email"
                  type="text"
                  placeholder="Enter your Zenodo account email"
                  value={formData.zenodoEmail}
                  onChange={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleInputChange("zenodoEmail", e.target.value);
                  }}
                  disabled={isUpdating || formData.enabled}
                  autoComplete="off"
                  data-form-type="other"
                  data-lpignore="true"
                  style={{
                    borderColor: "#dee2e6",
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = "none";
                    e.target.style.borderColor = "#dee2e6";
                  }}
                />
              </div>

              <div className="mb-2">
                <Form.Label
                  htmlFor="zenodo-password"
                  className="fw-semibold mb-0"
                >
                  Zenodo Password
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    id="zenodo-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Zenodo account password"
                    value={formData.zenodoPassword}
                    onChange={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleInputChange("zenodoPassword", e.target.value);
                    }}
                    disabled={isUpdating || formData.enabled}
                    autoComplete="new-password"
                    data-form-type="other"
                    data-lpignore="true"
                    style={{
                      borderColor: "#dee2e6",
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#dee2e6";
                    }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isUpdating}
                    style={{
                      borderColor: "#dee2e6",
                      borderLeft: "none",
                      height: "32.5px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
              </div>
            </Form>
          </div>
        </Col>
      </Row>

      <Button
        className="mt-4"
        variant="secondary"
        onClick={() => {
          navigate(ROUTES.ADMIN.SETTINGS.ROOT);
        }}
      >
        {t("buttons.back")}
      </Button>
    </div>
  );
}

export default ZenodoSettings;
