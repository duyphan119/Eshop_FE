import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteAdvertisement,
  getAllAdvertisements,
} from "../../../apis/advertisement";
import { ConfirmDialog, DataManagement } from "../../../components";
import { AdminLayout } from "../../../layouts";
import { MSG_SUCCESS } from "../../../utils/constants";
import { formatDateTime } from "../../../utils/helpers";
import { Advertisement, ResponseItems } from "../../../utils/types";

type Props = {
  advData: ResponseItems<Advertisement>;
};
const LIMIT = 10;
const Orders = ({ advData: propsAdvData }: Props) => {
  const [advData, setAdvData] =
    useState<ResponseItems<Advertisement>>(propsAdvData);
  const [current, setCurrent] = useState<Advertisement | null>(null);

  const handleDelete = async () => {
    try {
      if (current) {
        let { id } = current;
        const { message } = await deleteAdvertisement(id);
        if (message === MSG_SUCCESS) {
          const _advData = { ...advData };
          _advData.items = _advData.items.filter((gp: any) => gp.id !== id);
          _advData.count -= 1;
          setAdvData(_advData);
        }
      }
    } catch (error) {
      console.log("Delete advertisement error", error);
    }
  };

  useEffect(() => {
    setAdvData(propsAdvData);
  }, [propsAdvData]);

  return (
    <AdminLayout pageTitle="Quảng cáo">
      <>
        <Head>
          <title>Quản lý quảng cáo</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <DataManagement
          paperTitle="Danh sách quảng cáo"
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
          rows={advData.items}
          count={advData.count}
          limit={LIMIT}
          hasCheck={true}
          columns={[
            {
              style: { width: 70, textAlign: "center" },
              display: "#",
              key: "index",
            },
            {
              style: { textAlign: "center", width: 360 },
              key: "path",
              display: "Hình ảnh",
              render: (row: Advertisement) => (
                <Image
                  width={360}
                  height={200}
                  src={row.path}
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
              key: "page",
              display: "Trang",
            },
            {
              style: { textAlign: "left" },
              key: "href",
              display: "Liên kết",
            },
            {
              style: { width: 120, textAlign: "center" },
              key: "createdAt",
              display: "Ngày tạo",
              render: (row: any) => formatDateTime(row.createdAt),
            },
            {
              style: { width: 100 },
              key: "actions",
              render: (row: any) => (
                <>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Link href={`/admin/advertisement/${row.id}/update`}>
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
      q,
    };
    let { message, data } = await getAllAdvertisements(params);
    if (message === MSG_SUCCESS)
      return {
        props: { advData: data },
      };
  } catch (error) {
    console.log("GET ALL ADVERTISEMENTS ERROR::", error);
  }
  return { notFound: true };
}
