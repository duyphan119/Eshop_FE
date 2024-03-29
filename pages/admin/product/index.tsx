import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Checkbox,
  ClickAwayListener,
  Grid,
  IconButton,
  Popper,
  Typography,
} from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { CSSProperties, MouseEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ProductApi } from "@/api";
import { DataManagement, ImageFill, ModalPreviewProduct } from "@/components";
import { AdminLayout } from "@/layouts";
import { ProductModel, ResponseGetAllModel, UserModel } from "@/models";
import { productActions, productSelector } from "@/redux/slice/productSlice";
import { snackbarActions } from "@/redux/slice/snackbarSlice";
import { useAppDispatch } from "@/redux/store";
import { protectedRoutes } from "@/utils/routes";
import { UserJson } from "@/types/json";
import { requireAdminProps } from "@/lib";
import { GetServerSidePropsContext } from "next";

type Props = { profile: UserJson | null };
const LIMIT = 12;
const ulStyle: CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid lightgray",
  padding: "4px 0",
};
const liStyle: CSSProperties = {
  padding: "4px 8px",
  width: "100%",
  cursor: "pointer",
  minWidth: 120,
  maxWidth: 200,
};

const ProductItem = ({ product }: { product: ProductModel }) => {
  const appDispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setOpen((state) => !state);
  };

  const handleClickPreview = async (e: MouseEvent<HTMLElement>) => {
    const pApi = new ProductApi();
    let isError = true;
    try {
      const { items }: ResponseGetAllModel<ProductModel> = await pApi.getAll({
        product_variants: true,
        images: true,
        group_product: true,
        slug: product.slug,
      });

      if (items.length === 1) {
        isError = false;
        appDispatch(
          productActions.showModalPreview(pApi.getListFromJson(items)[0])
        );
      }
    } catch (error) {
      console.log(error);
    }
    if (isError)
      appDispatch(
        snackbarActions.show({
          msg: "Có lỗi xảy ra, vui lòng thử lại sau.",
          type: "error",
        })
      );
    setOpen((state) => !state);
  };

  return (
    <Box
      position="relative"
      width="100%"
      overflow="hidden"
      sx={{
        "&:hover": {
          ".checkbox, .btn": {
            visibility: "visible",
          },
        },
      }}
    >
      <ImageFill src={product.thumbnail} alt="" height="133%" />
      <Typography variant="subtitle2" mt={1} className="three-dot three-dot-2">
        {product.name}
      </Typography>
      <Typography variant="caption" className="three-dot three-dot-2">
        {product.price}đ
      </Typography>
      <Box
        className="checkbox"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "none",
        }}
      >
        <Checkbox />
      </Box>
      <Box
        className="btn"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          visibility: "hidden",
        }}
      >
        <IconButton type="button" onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {open ? (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Popper anchorEl={anchorEl} open={open} placement="bottom-start">
            <ul style={ulStyle}>
              <li
                style={liStyle}
                className="text-hover"
                onClick={handleClickPreview}
              >
                Xem chi tiết
              </li>
              <li style={liStyle}>
                <Link
                  className="text-hover"
                  href={protectedRoutes.updateProduct(product.id)}
                >
                  Sửa
                </Link>
              </li>
              <li className="text-hover" style={liStyle}>
                Xoá
              </li>
            </ul>
          </Popper>
        </ClickAwayListener>
      ) : null}
    </Box>
  );
};

const Page = ({ profile }: Props) => {
  const router = useRouter();
  const appDispatch = useAppDispatch();
  const { productData, openModalPreview } = useSelector(productSelector);

  useEffect(() => {
    const { p, sortBy, sortType } = router.query;

    appDispatch(
      productActions.fetchGetAll({
        p: +`${p}` || 1,
        limit: LIMIT,
        sortBy: `${sortBy || "id"}`,
        sortType: `${sortType}` === "ASC" ? "ASC" : "DESC",
        group_product: true,
      })
    );
  }, [router.query]);

  return (
    <AdminLayout pageTitle="Sản phẩm" profile={new UserModel(profile)}>
      <>
        <Head>
          <title>Quản lý sản phẩm</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <DataManagement
          paperTitle="Danh sách sản phẩm"
          count={productData.count}
          limit={LIMIT}
          sorts={[
            {
              label: "Tên tăng dần",
              sortBy: "name",
              sortType: "ASC",
            },
            {
              label: "Tên giảm dần",
              sortBy: "name",
              sortType: "DESC",
            },
            {
              label: "Giá tăng dần",
              sortBy: "price",
              sortType: "ASC",
            },
            {
              label: "Giá giảm dần",
              sortBy: "price",
              sortType: "DESC",
            },
          ]}
        >
          <Grid container columnSpacing={2} rowSpacing={2}>
            {productData.items.map((product) => {
              return (
                <Grid item xs={6} sm={4} md={3} lg={2} key={product.id}>
                  <ProductItem product={product} />
                </Grid>
              );
            })}
          </Grid>
        </DataManagement>
        {openModalPreview ? <ModalPreviewProduct /> : null}
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
