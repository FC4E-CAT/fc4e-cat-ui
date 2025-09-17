import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Spinner, Row, Col } from "react-bootstrap";
import { FaUserCog } from "react-icons/fa";
import { AuthContext } from "@/auth";
import {
  useGetAdminSettings,
  useUpdateAdminSetting,
  type AdminSetting,
} from "@/api/services/registry";
import ROUTES from "@/routes";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function AAIAutocompleteSettings() {
  const navigate = useNavigate();
  const { keycloak, registered } = useContext(AuthContext)!;
  const [aaiSettings, setAaiSettings] = useState<AdminSetting[]>([]);
  const [enabledSettings, setEnabledSettings] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  const { data: settings, isLoading } = useGetAdminSettings({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const updateSettingMutation = useUpdateAdminSetting(keycloak?.token || "");

  useEffect(() => {
    if (settings && !loading) {
      return;
    }

    if (settings) {
      const aaiSetting = settings.filter(
        (setting) => setting.data.label === "Registration",
      );

      setAaiSettings(aaiSetting);

      const initialEnabledState: { [key: string]: boolean } = {};
      aaiSetting.forEach((setting) => {
        initialEnabledState[setting.id] = setting.enabled ?? false;
      });
      setEnabledSettings(initialEnabledState);
      setLoading(false);
    }
  }, [settings, loading]);

  const handleToggleSetting = async (settingId: string) => {
    const newEnabledState = !enabledSettings[settingId];

    try {
      setEnabledSettings((prev) => ({
        ...prev,
        [settingId]: newEnabledState,
      }));

      await updateSettingMutation.mutateAsync({
        id: settingId,
        updateData: {
          data: {
            config: {
              ["api.cat.user.info.update.from.token"]: null,
            },
          },
          enabled: newEnabledState,
        },
      });

      toast.success(
        `AAI Autocomplete Values ${newEnabledState ? "enabled" : "disabled"} successfully`,
      );
    } catch (error) {
      setEnabledSettings((prev) => ({
        ...prev,
        [settingId]: !newEnabledState,
      }));

      toast.error(
        "Failed to update AAI Autocomplete setting. Please try again.",
      );
      console.error("Error updating AAI Autocomplete setting:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">
            Loading AAI Autocomplete settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cat-view-heading-block">
      <div className="col mb-4">
        <h2 className="text-muted cat-view-heading">
          AAI Autocomplete Values Settings
          <p className="lead cat-view-lead">
            Configure automatic completion of user information from AAI
            registration data
          </p>
        </h2>
      </div>

      <Row className="mb-4">
        <Col lg={6} className="system-settings-items-list">
          {aaiSettings.map((setting) => (
            <div
              className="test-method-settings-item d-flex justify-content-between gap-5 my-1"
              key={setting.id}
            >
              <div>
                <div className="d-flex align-items-center gap-2">
                  <FaUserCog size={16} />
                  <h6 className="mb-0">Enable Registration</h6>
                </div>
                <span className="text-muted small">
                  {setting.data.description || "No description available"}
                </span>
              </div>
              <div>
                <Form.Check
                  type="switch"
                  id={`switch-${setting.id}`}
                  checked={enabledSettings[setting.id] || false}
                  onChange={() => handleToggleSetting(setting.id)}
                  className="test-method-switch"
                />
              </div>
            </div>
          ))}
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

export default AAIAutocompleteSettings;
