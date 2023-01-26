import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllBlogs } from "../../../apis/blog";
import { deleteBlog, restoreBlog, softDeleteBlog } from "../../../apis/blog";
import { ConfirmDialog, DataManagement } from "../../../components";
import { AdminLayout } from "../../../layouts";
import { COOKIE_ACCESSTOKEN_NAME, MSG_SUCCESS } from "../../../utils/constants";
import { formatDateTime } from "../../../utils/helpers";
import { Blog, Order, ResponseItems } from "../../../utils/types";

type Props = {
  blogData: ResponseItems<Blog>;
};
const LIMIT = 10;
const Orders = ({ blogData: propBlogData }: Props) => {
  const [blogData, setBlogData] = useState<ResponseItems<Blog>>(propBlogData);
  const [current, setCurrent] = useState<Blog | null>(null);

  const handleSoftDelete = async (id: number) => {
    try {
      const { message } = await softDeleteBlog(id);
      if (message === MSG_SUCCESS) {
        const _blogData = { ...blogData };
        const index = _blogData.items.findIndex((gp: any) => gp.id === id);
        if (index !== -1) {
          _blogData.items[index].deletedAt = "" + new Date().getTime();
          setBlogData(_blogData);
        }
      }
    } catch (error) {
      console.log("Soft delete group product error", error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const { message } = await restoreBlog(id);
      if (message === MSG_SUCCESS) {
        const _blogData = { ...blogData };
        const index = _blogData.items.findIndex((gp: any) => gp.id === id);
        if (index !== -1) {
          _blogData.items[index].deletedAt = null;
          setBlogData(_blogData);
        }
      }
    } catch (error) {
      console.log("Restore delete group product error", error);
    }
  };

  const handleDelete = async () => {
    try {
      if (current) {
        let { id } = current;
        const { message } = await deleteBlog(id);
        if (message === MSG_SUCCESS) {
          const _blogData = { ...blogData };
          _blogData.items = _blogData.items.filter((gp: any) => gp.id !== id);
          _blogData.count -= 1;
          setBlogData(_blogData);
        }
      }
    } catch (error) {
      console.log("Delete group product error", error);
    }
  };

  useEffect(() => {
    setBlogData(propBlogData);
  }, [propBlogData]);

  return (
    <AdminLayout pageTitle="Bài viết">
      <>
        <Head>
          <title>Quản lý bài viết</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <DataManagement
          paperTitle="Danh sách bài viết"
          sortBys={[
            {
              display: "Tiêu đề",
              value: "title",
            },
            {
              display: "Ngày tạo",
              value: "createdAt",
            },
          ]}
          rows={blogData.items}
          count={blogData.count}
          limit={LIMIT}
          hasCheck={true}
          columns={[
            {
              style: { width: 70, textAlign: "center" },
              display: "#",
              key: "index",
            },
            {
              style: { textAlign: "center", width: 220 },
              key: "thumbnail",
              display: "Ảnh đại diện",
              render: (row: Blog) => (
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
              render: (row: any) => formatDateTime(row.createdAt),
            },
            {
              style: { width: 90, textAlign: "center" },
              key: "deletedAt",
              display: "Hiển thị",
              render: (row: any) =>
                row.deletedAt ? (
                  <ClearIcon
                    style={{ color: "#d32f2f" }}
                    onClick={() => handleRestore(row.id)}
                  />
                ) : (
                  <CheckIcon
                    style={{ color: "#33eb91" }}
                    onClick={() => handleSoftDelete(row.id)}
                  />
                ),
            },
            {
              style: { width: 100 },
              key: "actions",
              render: (row: any) => (
                <>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Link href={`/admin/blog/${row.id}/update`}>
                      <button className="btnEdit">Sửa</button>
                    </Link>
                    <button
                      className="btnDelete"
                      style={{ marginLeft: "8px" }}
                      onClick={() => setCurrent(row)}
                    >
                      Xóa
                    </button>
                  </div>
                  {current ? (
                    <ConfirmDialog
                      open={current.id === row.id ? true : false}
                      onClose={() => setCurrent(null)}
                      onConfirm={handleDelete}
                      title="Xác nhận"
                      text="Bạn có chắc chắn muốn xóa không?"
                    />
                  ) : null}
                </>
              ),
            },
          ]}
        />
      </>
    </AdminLayout>
  );
};

export default Orders;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const { p, sortBy, sortType, q } = context.query as any;
    const params = {
      p: p || 1,
      limit: LIMIT,
      sortBy,
      sortType,
      withDeleted: true,
      q,
    };
    let { message, data } = await getAllBlogs(
      params,
      context.req.cookies[COOKIE_ACCESSTOKEN_NAME]
    );
    if (message === MSG_SUCCESS)
      return {
        props: { blogData: data },
      };
  } catch (error) {
    console.log("GET ALL BLOGS ERROR::", error);
  }
  return { notFound: true };
}
