import { Box, Container, Grid } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { getAllAdvertisements } from "../apis/advertisement";
import { getAllBlogsPublic } from "../apis/blog";
import { getAllProducts } from "../apis/product";
import { ProductCard } from "../components";
import { DefaultLayout } from "../layouts";
import styles from "../styles/_Home.module.scss";
import { formatDateTime } from "../utils/helpers";
import { protectedRoutes, publicRoutes } from "../utils/routes";
import { Advertisement, Blog, Product, ResponseItems } from "../utils/types";
type ProductsProps = {
  products: Product[];
};
const Products = ({ products }: ProductsProps) => {
  return (
    <Container maxWidth="lg">
      <Grid container columnSpacing={3} rowSpacing={3}>
        {products.map((product) => {
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={Math.random() + ""}>
              <ProductCard product={product} />
            </Grid>
          );
        })}
        {products.length > 0 ? (
          <Grid item xs={12} className={styles.viewAllWrapper}>
            <Link href={publicRoutes.products()} className={styles.viewAll}>
              Xem tất cả sản phẩm
            </Link>
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
    </Container>
  );
};

type BannersProps = Partial<{
  banners: Advertisement[];
}>;

const Banners = ({ banners }: BannersProps) => {
  return banners ? (
    <Swiper slidesPerView={1}>
      {banners.map((adv: Advertisement) => {
        return (
          <SwiperSlide key={adv.id}>
            <Link href={adv.href} rel="preloaded">
              <Box
                sx={{ width: "100vw", position: "relative", height: "560px" }}
              >
                <Image
                  src={adv.path}
                  alt="banner"
                  priority={true}
                  // height={560}
                  // width={1952}
                  fill={true}
                  sizes="(min-width: 0) 100vw"
                />
              </Box>
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  ) : (
    <></>
  );
};

type BlogProps = {
  blogs: Blog[];
};

const Blogs = ({ blogs }: BlogProps) => {
  return (
    <Container maxWidth="lg">
      <Grid container columnSpacing={2} rowSpacing={2}>
        {blogs.map((blog: Blog) => {
          return (
            <Grid item xs={12} md={4} key={blog.id}>
              <Link
                href={`/blog/${blog.slug}`}
                className={styles.blogThumbnail}
              >
                <Image
                  fill={true}
                  sizes="(max-width: 768px) 1vw"
                  src={blog.thumbnail}
                  alt=""
                  priority={true}
                />
              </Link>
              <Link href={`/blog/${blog.slug}`} className={styles.blogTitle}>
                {blog.title}
              </Link>
              <div className={styles.blogCreatedAt}>
                {formatDateTime(blog.createdAt)}
              </div>
            </Grid>
          );
        })}
        {blogs.length > 0 ? (
          <Grid item xs={12} className={styles.viewAllWrapper}>
            <Link href={publicRoutes.blogs} className={styles.viewAll}>
              Xem tất cả bài viết
            </Link>
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
    </Container>
  );
};

type Props = {
  productData: ResponseItems<Product>;
  blogData: ResponseItems<Blog>;
  advertisements: Advertisement[];
};
export default function Home({ productData, blogData, advertisements }: Props) {
  return (
    <DefaultLayout>
      <>
        <Head>
          <title>Trang chủ</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <Banners banners={advertisements} />

          <h1 className={styles.h1}>Sản phẩm mới</h1>
          <Products products={productData.items} />
          <h1 className={styles.h1}>Bài viết</h1>
          <Blogs blogs={blogData.items} />
        </main>
      </>
    </DefaultLayout>
  );
}
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  let productData = { items: [], count: 0, totalPages: 0 };
  let blogData = { items: [], count: 0, totalPages: 0 };
  let advData = { items: [] };
  try {
    const [res1, res2, res3] = await Promise.allSettled([
      getAllProducts({
        limit: 24,
        product_variants: true,
        images: true,
      }),
      getAllBlogsPublic({
        limit: 3,
      }),
      getAllAdvertisements({ page: "Trang chủ", sortType: "asc" }),
    ]);

    if (res1.status === "fulfilled") {
      productData = res1.value.data;
    }
    if (res2.status === "fulfilled") {
      blogData = res2.value.data;
    }
    if (res3.status === "fulfilled") {
      advData = res3.value.data;
    }
  } catch (error) {
    console.log(error);
  }

  return {
    props: {
      productData,
      blogData,
      advertisements: advData.items,
    },
  };
};
