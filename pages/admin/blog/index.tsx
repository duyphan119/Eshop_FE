import { ButtonControl, DataManagement, DataTable } from "@/components";
import { AdminLayout } from "@/layouts";
import { requireAdminProps } from "@/lib";
import { BlogModel, UserModel } from "@/models";
import {
  blogActions,
  blogReducers,
  blogSelector,
} from "@/redux/slice/blogSlice";
import { confirmDialogActions } from "@/redux/slice/confirmDialogSlice";
import { fetchSelector } from "@/redux/slice/fetchSlice";
import { useAppDispatch } from "@/redux/store";
import { UserJson } from "@/types/json";
import helper from "@/utils/helpers";
import { protectedRoutes } from "@/utils/routes";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useSelector } from "react-redux";

type Props = { profile: UserJson | null };
const LIMIT = 10;
const Page = ({ profile }: Props) => {
  const appDispatch = useAppDispatch();
  const { blogData } = useSelector(blogSelector);
  const router = useRouter();
  const { isLoading, reducer } = useSelector(fetchSelector);

  const handleFetch = useCallback(() => {
    const { p, sortBy, sortType, limit } = router.query;
    appDispatch(
      blogActions.fetchGetAll({
        p: +`${p}` || 1,
        limit: limit ? `${limit}` : LIMIT,
        sortBy: `${sortBy || "id"}`,
        sortType: `${sortType}` === "ASC" ? "ASC" : "DESC",
      })
    );
  }, [router.query]);

  const handleDeleteAll = (listId: number[]) => {
    appDispatch(blogActions.fetchSoftDeleteMultiple(listId));
  };

  return (
    <AdminLayout pageTitle="Bài viết" profile={new UserModel(profile)}>
      <Head>
        <title>Quản lý bài viết</title>
      </Head>
      <DataManagement
        paperTitle="Danh sách bài viết"
        count={blogData.count}
        limit={LIMIT}
        onFetch={handleFetch}
        onDeleteAll={handleDeleteAll}
      >
        <DataTable
          sortable={["id", "title", "createdAt", "slug"]}
          columns={[
            {
              style: { width: 70, textAlign: "center" },
              display: "ID",
              key: "id",
            },
            {
              style: { textAlign: "center", width: 220 },
              key: "thumbnail",
              display: "Ảnh đại diện",
              render: (row: BlogModel) => (
                <Image
                  width={220}
                  height={140}
                  src={row.thumbnail}
                  alt=""
                  priority={true}
                />
              ),
            },
            {
              style: { textAlign: "left" },
              key: "title",
              display: "Tiêu đề",
            },
            {
              style: { textAlign: "left" },
              key: "slug",
              display: "Bí danh",
            },
            {
              style: { width: 120, textAlign: "center" },
              key: "createdAt",
              display: "Ngày tạo",
              render: (row: BlogModel) => helper.formatDateTime(row.createdAt),
            },
            {
              style: { width: 152 },
              key: "actions",
              render: (row: BlogModel) => (
                <>
                  <div
                    className="flex-center"
                    style={{
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <Link href={protectedRoutes.previewBlog(row.id)}>
                      <ButtonControl color="info" size="small">
                        Xem trước
                      </ButtonControl>
                    </Link>
                    <Link href={protectedRoutes.updateBlog(row.id)}>
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
                                blogActions.fetchSoftDeleteSingle(row.id)
                              );
                            },
                          })
                        )
                      }
                      size="small"
                    >
                      Xóa
                    </ButtonControl>
                  </div>
                </>
              ),
            },
          ]}
          rows={blogData.items}
          hasCheck={true}
          isLoading={reducer === blogReducers.fetchGetAll && isLoading}
        />
      </DataManagement>
    </AdminLayout>
  );
};
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return requireAdminProps(context);
};

export default Page;
