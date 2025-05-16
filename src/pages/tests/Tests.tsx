import { AuthContext } from "@/auth";
import { useContext, useEffect, useRef, useState } from "react";
import { AlertInfo } from "@/types";
import toast from "react-hot-toast";
import { DeleteModal } from "@/components/DeleteModal";
import { useTranslation } from "react-i18next";
import { useDeleteTest, useGetTests } from "@/api/services/registry";
import { RegistryTest } from "@/types/tests";
import { TestDetailsModal } from "./components/TestDetailsModal";
import TestsHeader from "./components/TestsHeader";
import TestSearch from "./components/TestSearch";
import TestTable from "./components/TestTable";
import TestPagination from "./components/TestPagination";
import TestModal from "./components/TestModal";

type TestsState = {
  sortOrder: string;
  sortBy: string;
  page: number;
  size: number;
  search: string;
};

type TestModalConfig = {
  id: string;
  show: boolean;
  isEditing?: boolean;
  isVersioning?: boolean;
};

type TestModalDetailsConfig = {
  id: string;
  show: boolean;
};

interface DeleteModalConfig {
  show: boolean;
  title: string;
  message: string;
  itemId: string;
  itemName: string;
}

function Tests() {
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: t("page_tests.modal_delete_title"),
      message: t("page_tests.modal_delete_message"),
      itemId: "",
      itemName: "",
    },
  );

  const [opts, setOpts] = useState<TestsState>({
    sortBy: "lastTouch",
    sortOrder: "DESC",
    page: 1,
    size: 10,
    search: "",
  });

  const [testModalCfg, setTestModalCfg] = useState<TestModalConfig>({
    id: "",
    show: false,
    isEditing: false,
    isVersioning: false,
  });

  const [testDetailsModalCfg, setTestDetailsModalCfg] =
    useState<TestModalDetailsConfig>({
      id: "",
      show: false,
    });

  const [expandedTests, setExpandedTests] = useState<{
    [key: string]: boolean;
  }>({});

  const { isLoading, data, refetch } = useGetTests({
    size: opts.size,
    page: opts.page,
    sortBy: opts.sortBy,
    sortOrder: opts.sortOrder,
    search: opts.search,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const mutationDelete = useDeleteTest(keycloak?.token || "");

  const handleDeleteConfirmed = () => {
    if (deleteModalConfig.itemId) {
      const promise = mutationDelete
        .mutateAsync(deleteModalConfig.itemId)
        .catch((err) => {
          alert.current = {
            message: `${t("error")}: ` + err.response.data.message,
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_tests.toast_delete_success"),
          };
          setDeleteModalConfig({
            ...deleteModalConfig,
            show: false,
            itemId: "",
            itemName: "",
          });
        });
      toast.promise(promise, {
        loading: t("page_tests.toast_delete_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  };

  const handleSortChange = (field: string) => {
    if (field === opts.sortBy) {
      setOpts({
        ...opts,
        sortOrder: opts.sortOrder === "ASC" ? "DESC" : "ASC",
      });
    } else {
      setOpts({
        ...opts,
        sortOrder: "ASC",
        sortBy: field,
      });
    }
  };

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  const tests: RegistryTest[] = data ? data?.content : [];

  return (
    <>
      <TestsHeader
        onCreateTest={() => setTestModalCfg({ id: "", show: true })}
      />
      <TestSearch
        searchValue={opts.search}
        onSearchChange={(searchText) =>
          setOpts({ ...opts, search: searchText, page: 1 })
        }
        onClearSearch={() => setOpts({ ...opts, search: "", page: 1 })}
      />
      <TestTable
        tests={tests}
        isLoading={isLoading}
        sortBy={opts.sortBy}
        sortOrder={opts.sortOrder}
        expandedTests={expandedTests}
        onSortChange={handleSortChange}
        onToggleExpand={(testId) =>
          setExpandedTests((prev) => ({
            ...prev,
            [testId]: !prev[testId],
          }))
        }
        onViewTest={(testId) =>
          setTestDetailsModalCfg({
            id: testId,
            show: true,
          })
        }
        onEditTest={(testId) =>
          setTestModalCfg({
            id: testId,
            show: true,
            isEditing: true,
          })
        }
        onCreateVersion={(testId) =>
          setTestModalCfg({
            id: testId,
            show: true,
            isVersioning: true,
          })
        }
        onDeleteTest={(testId, name) =>
          setDeleteModalConfig({
            ...deleteModalConfig,
            show: true,
            itemId: testId,
            itemName: name,
          })
        }
      />
      <TestPagination
        page={opts.page}
        size={opts.size}
        totalPages={data?.total_pages}
        totalElements={data?.total_elements}
        numberOfPage={data?.number_of_page}
        sizeOfPage={data?.size_of_page}
        onPageSizeChange={(size) => setOpts({ ...opts, page: 1, size })}
        onPageChange={(page) => setOpts({ ...opts, page })}
      />
      <div className="p-4"></div>
      <DeleteModal
        show={deleteModalConfig.show}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        itemId={deleteModalConfig.itemId}
        itemName={deleteModalConfig.itemName}
        onHide={() => {
          setDeleteModalConfig({ ...deleteModalConfig, show: false });
        }}
        handleDelete={handleDeleteConfirmed}
      />
      {testModalCfg?.show && (
        <TestModal
          id={testModalCfg.id}
          show={testModalCfg.show}
          isEditing={testModalCfg?.isEditing}
          isVersioning={testModalCfg?.isVersioning}
          onHide={() => {
            setTestModalCfg({
              id: "",
              show: false,
              isVersioning: false,
              isEditing: false,
            });
          }}
        />
      )}
      <TestDetailsModal
        id={testDetailsModalCfg.id}
        show={testDetailsModalCfg.show}
        onHide={() => {
          setTestDetailsModalCfg({ id: "", show: false });
        }}
      />
    </>
  );
}

export default Tests;
