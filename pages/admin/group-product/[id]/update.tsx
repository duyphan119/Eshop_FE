import { DashboardPaper, GroupProductForm } from "@/components";
import { AdminLayout } from "@/layouts";
import { requireAdminProps } from "@/lib";
import { UserModel } from "@/models";
import { groupProductActions } from "@/redux/slice/groupProductSlice";
import { useAppDispatch } from "@/redux/store";
import { UserJson } from "@/types/json";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

type Props = { profile: UserJson | null };

const Page = ({ profile }: Props) => {
  const appDispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (router.query.id) {
      appDispatch(groupProductActions.fetchGetById(+`${router.query.id}`));
    }
  }, [router.query]);

  return (
    <AdminLayout pageTitle="Sản phẩm" profile={new UserModel(profile)}>
      <>
        <Head>
          <title>Cập nhật nhóm sản phẩm</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <DashboardPaper title="Thông tin nhóm sản phẩm">
          <GroupProductForm />
        </DashboardPaper>
      </>
    </AdminLayout>
  );
};
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return requireAdminProps(context);
};

export default Page;
