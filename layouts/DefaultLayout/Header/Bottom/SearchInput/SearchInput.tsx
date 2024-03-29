import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { ClickAwayListener } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/router";
import { ProductApi } from "@/api";
import { ProductModel, ResponseGetAllModel } from "@/models";
import { publicRoutes } from "@/utils/routes";
import styles from "./_style.module.scss";

type Props = {};

const SearchInput = (props: Props) => {
  const [productData, setProductData] = useState<
    ResponseGetAllModel<ProductModel>
  >(new ResponseGetAllModel());
  const [q, setQ] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  const search = async () => {
    try {
      if (q === "") {
        setProductData(new ResponseGetAllModel());
      } else {
        const pApi = new ProductApi();
        const data = await pApi.search({
          q,
          limit: 3,
        });
        setProductData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlur = () => {
    setVisible(false);
  };

  const handleFocus = () => {
    setVisible(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleBlur();
    router.push(publicRoutes.search(q));
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      search();
    }, 555);

    return () => clearTimeout(timerId);
  }, [q]);

  return (
    <ClickAwayListener onClickAway={handleBlur}>
      <form className={styles.search} onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Nhập từ khóa cần tìm"
          value={q}
          onChange={handleChange}
          onFocus={handleFocus}
        />
        <button type="submit">
          <SearchOutlinedIcon />
        </button>
        {visible && productData.count > 0 && (
          <div className={styles["search-result-wrapper"]}>
            <ul>
              {productData.items.map((product) => {
                return (
                  <li key={product.id}>
                    <Link
                      href={publicRoutes.productDetail(product.slug)}
                      className={styles.link}
                    >
                      <Image
                        src={product.thumbnail}
                        alt=""
                        width={64}
                        height={64}
                        priority={true}
                      />
                      <div className={styles.product}>
                        <div className={styles.name}>{product.name}</div>
                        <div className={styles.price}>
                          {product.rangePrice("", "đ")}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link href={publicRoutes.search(q)} className={styles["view-all"]}>
              Xem tất cả
            </Link>
          </div>
        )}
      </form>
    </ClickAwayListener>
  );
};

export default SearchInput;
