import { BlogCategoryForm, DashboardPaper } from "@/components";
import { AdminLayout } from "@/layouts";
import { requireAdminProps } from "@/lib";
import { UserModel } from "@/models";
import { UserJson } from "@/types/json";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";

type Props = { profile: UserJson | null };

const Page = ({ profile }: Props) => {
  return (
    <AdminLayout pageTitle="Danh mục bài viết" profile={new UserModel(profile)}>
      <Head>
        <title>Thêm mới danh mục viết</title>
      </Head>
      <DashboardPaper title="Thông tin thêm mới danh mục bài viết">
        <BlogCategoryForm />
      </DashboardPaper>
    </AdminLayout>
  );
};
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return requireAdminProps(context);
};

export default Page;
