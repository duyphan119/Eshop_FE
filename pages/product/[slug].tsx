import { Container } from "@mui/material";
import Head from "next/head";
import { createContext, useContext, useEffect, useState } from "react";
import { getAllCommentProductsClient } from "../../apis/commentproduct";
import { getAllProducts } from "../../apis/product";
import { ProductInfo } from "../../components";
import { useAuthContext } from "../../context/AuthContext";
import { DefaultLayout } from "../../layouts";
import styles from "../../styles/ProductDetail.module.css";
import { MSG_SUCCESS } from "../../utils/constants";
import { CommentProduct, Product, ResponseItems } from "../../utils/types";

type CommentProductData = ResponseItems<CommentProduct> & {
  userComment: CommentProduct | null;
};

type Props = {
  product: Product;
};

const ProductDetailContext = createContext<any>({});

export function useProductDetailContext() {
  return useContext(ProductDetailContext);
}

const LIMIT = 3;

const ProductDetail = ({ product }: Props) => {
  const { profile } = useAuthContext();
  const [commentProductData, setCommentProductData] =
    useState<CommentProductData>({ items: [], count: 0, userComment: null });
  const [page, setPage] = useState<number>(1);

  const handleEditComment = (data: CommentProduct) => {
    setCommentProductData({
      ...commentProductData,
      items: commentProductData.items.map((i) => (i.id === data.id ? data : i)),
      userComment: data,
    });
  };

  const handleAddComment = (data: CommentProduct) => {
    const _items = [...commentProductData.items];
    setCommentProductData({
      ...commentProductData,
      userComment: { ...data, user: profile },
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const { message, data } = await getAllCommentProductsClient({
          productId: product.id,
          limit: LIMIT,
          p: page,
        });
        if (message === MSG_SUCCESS) {
          setCommentProductData(data);
        }
      } catch (error) {
        console.log("FETCH COMMENT PRODUCT ERROR", error);
      }
    })();
  }, [product, page]);

  return (
    <DefaultLayout>
      <>
        <Head>
          <title>{product ? product.name : "Chi tiết sản phẩm"}</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ProductDetailContext.Provider
          value={{
            product,
            commentProductData,
            setCommentProductData,
            page,
            setPage,
            totalPage: Math.ceil(commentProductData.count / LIMIT),
            onEditCommentProduct: handleEditComment,
            onAddCommentProduct: handleAddComment,
          }}
        >
          <Container maxWidth="lg">
            <div className={styles.body}>
              <ProductInfo />
            </div>
          </Container>
        </ProductDetailContext.Provider>
      </>
    </DefaultLayout>
  );
};
export async function getServerSideProps(context: any) {
  const { slug } = context.query;
  let product;
  const { message: msg1, data: data1 } = await getAllProducts({
    slug,
    product_variants: true,
    images: true,
  });
  if (msg1 === MSG_SUCCESS) {
    product = data1.items[0];
  }

  return product
    ? {
        props: { product },
      }
    : {
        notFound: true,
      };
}

export default ProductDetail;