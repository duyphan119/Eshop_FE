import { ButtonControl, DataManagement, DataTable } from "@/components";
import { AdminLayout } from "@/layouts";
import { VariantModel } from "@/models";
import { confirmDialogActions } from "@/redux/slice/confirmDialogSlice";
import { variantActions, variantSelector } from "@/redux/slice/variantSlice";
import { useAppDispatch } from "@/redux/store";
import helper from "@/utils/helpers";
import { protectedRoutes } from "@/utils/routes";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { UserJson } from "@/types/json";
import { UserModel } from "@/models";
import { requireAdminProps } from "@/lib";
import { GetServerSidePropsContext } from "next";
import { fetchSelector } from "@/redux/slice/fetchSlice";

type Props = { profile: UserJson | null };
const LIMIT = 10;
const Variants = ({ profile }: Props) => {
  const appDispatch = useAppDispatch();
  const router = useRouter();
  const { variantData } = useSelector(variantSelector);
  const { deleted } = useSelector(fetchSelector);
  const handleDeleteAll = (ids: number[]) => {
    appDispatch(
      confirmDialogActions.show({
        onConfirm: () => {
          appDispatch(variantActions.fetchSoftDeleteMultiple(ids));
        },
      })
    );
  };

  useEffect(() => {
    const { p, sortBy, sortType } = router.query;
    appDispatch(
      variantActions.fetchGetAll({
        p: +`${p}` || 1,
        limit: LIMIT,
        sortBy: `${sortBy || "id"}`,
        sortType: `${sortType}` === "ASC" ? "ASC" : "DESC",
      })
    );
  }, [router.query]);

  useEffect(() => {
    if (deleted) {
      const { p, sortBy, sortType } = router.query;
      appDispatch(
        variantActions.fetchGetAll({
          p: +`${p}` || 1,
          limit: LIMIT,
          sortBy: `${sortBy || "id"}`,
          sortType: `${sortType}` === "ASC" ? "ASC" : "DESC",
        })
      );
    }
  }, [router.query, deleted]);

  return (
    <AdminLayout pageTitle="Loại thuộc tính" profile={new UserModel(profile)}>
      <>
        <Head>
          <title>Quản lý loại thuộc tính</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <DataManagement
          paperTitle="Danh sách loại thuộc tính"
          count={variantData.count}
          limit={LIMIT}
          onDeleteAll={handleDeleteAll}
        >
          <DataTable
            rows={variantData.items}
            sortable={["id", "name", "createdAt"]}
            hasCheck={true}
            columns={[
              {
                style: { width: 70, textAlign: "center" },
                display: "ID",
                key: "id",
              },
              {
                style: { textAlign: "center" },
                key: "name",
                display: "Tên loại thuộc tính",
              },
              {
                style: { width: 180, textAlign: "center" },
                key: "createdAt",
                display: "Ngày tạo",
                render: (row: VariantModel) =>
                  helper.formatDateTime(row.createdAt),
              },
              {
                style: { width: 152 },
                key: "actions",
                render: (row: VariantModel) => (
                  <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Link href={protectedRoutes.updateVariant(row.id)}>
                        <ButtonControl color="secondary" size="small">
                          Sửa
                        </ButtonControl>
                      </Link>
                      <ButtonControl
                        color="error"
                        onClick={() =>
                          appDispatch(
                            confirmDialogActions.show({
                              onConfirm: () => {
                                appDispatch(
                                  variantActions.fetchSoftDeleteSingle(row.id)
                                );
                              },
                            })
                          )
                        }
                        sx={{ ml: 1 }}
                        size="small"
                      >
                        Xóa
                      </ButtonControl>
                    </div>
                  </>
                ),
              },
            ]}
          />
        </DataManagement>
      </>
    </AdminLayout>
  );
};
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return requireAdminProps(context);
};

export default Variants;
