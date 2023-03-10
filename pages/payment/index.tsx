import { Container, Grid } from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useReducer, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { OrderDiscountApi } from "../../api";
import { CheckoutDTO } from "../../apis/order";
import { InputControl, RadioControl, SelectControl } from "../../components";
import { OrderDiscountModel, UserAddressModel } from "../../models";
import provinces from "../../province.json";
import { authSelector } from "../../redux/slice/authSlice";
import {
  cartActions,
  cartReducer,
  cartSelector,
} from "../../redux/slice/cartSlice";
import { fetchSelector } from "../../redux/slice/fetchSlice";
import { orderActions, orderSelector } from "../../redux/slice/orderSlice";
import { snackbarActions } from "../../redux/slice/snackbarSlice";
import {
  userAddressActions,
  userAddressSelector,
} from "../../redux/slice/userAddressSlice";
import { useAppDispatch } from "../../redux/store";
import styles from "../../styles/_Payment.module.scss";
import { publicRoutes } from "../../utils/routes";
import { District, Province, Ward } from "../../utils/types";

type Props = {};

type Action = {
  payload: any;
  type?: string;
};

type State = {
  districts: District[];
  wards: Ward[];
  paymentMethod: "COD" | "MOMO";
  userAddresses: UserAddressModel[];
  userAddress: UserAddressModel;
  visible: boolean;
  code: string;
  orderDiscount: OrderDiscountModel;
  usePoint: boolean;
};

const reducers = (state: State, action: Action) => {
  const { type, payload } = action;

  switch (type) {
    default: {
      return { ...state, ...payload };
    }
  }
};

const initialState: State = {
  districts: [],
  wards: [],
  paymentMethod: "COD",
  userAddresses: [],
  userAddress: new UserAddressModel(),
  visible: false,
  code: "",
  orderDiscount: new OrderDiscountModel(),
  usePoint: false,
};

const Payment = (props: Props) => {
  const appDispatch = useAppDispatch();
  const router = useRouter();
  const { cart } = useSelector(cartSelector);
  const { isCheckoutSuccess } = useSelector(orderSelector);
  const { userAddressData } = useSelector(userAddressSelector);
  const { profile } = useSelector(authSelector);
  const { reducers: stateReducers } = useSelector(fetchSelector);

  const total = cart.getTotalPrice();

  const [state, dispatch] = useReducer(reducers, initialState);
  const { districts, orderDiscount, userAddress, visible, wards, usePoint } =
    state as State;

  const discountRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CheckoutDTO>();
  useEffect(() => {
    setValue("phone", cart.phone || "");
    setValue("fullName", cart.fullName || "");
    setValue("point", 0);
  }, [cart]);
  const onSubmit: SubmitHandler<CheckoutDTO> = async (data) => {
    try {
      const reqData = {
        ...data,
        shippingPrice: 0,
        ...(visible && userAddress.id > 0
          ? {
              province: userAddress.province,
              district: userAddress.district,
              ward: userAddress.ward,
              address: userAddress.address,
            }
          : {}),
        ...(orderDiscount.id > 0 ? { discountId: orderDiscount.id } : {}),
        point: usePoint ? +data.point : 0,
      };
      console.log(reqData);
      appDispatch(orderActions.fetchCheckout(reqData));
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = +e.target.value;
    const result = userAddressData.items.find((_) => _.id === id);

    if (result) {
      dispatch({ payload: { userAddress: result } });
    }
  };

  const handleUse = async () => {
    try {
      const odApi = new OrderDiscountApi();
      if (discountRef.current) {
        const code = discountRef.current.value;
        if (code !== "") {
          const data: OrderDiscountModel = await odApi.check({ code, total });
          if (data.id > 0) {
            dispatch({ payload: { orderDiscount: data, code: "" } });
          } else {
            appDispatch(
              snackbarActions.show({
                msg: "M?? gi???m gi?? kh??ng h???p l???",
                type: "error",
              })
            );
          }
        }
      }
    } catch (error) {
      console.log("CHECK ORDER DISCOUNT CODE ERROR", error);
    }
  };

  const handleUsePoint = () => {
    dispatch({ payload: { usePoint: true } });
  };

  useEffect(() => {
    appDispatch(userAddressActions.fetchGetAll({}));
  }, []);

  useEffect(() => {
    if (!stateReducers.includes(cartReducer.fetchCart)) {
      appDispatch(cartActions.fetchCart());
    }
  }, [stateReducers]);

  useEffect(() => {
    if (isCheckoutSuccess) router.push(publicRoutes.paymentSuccess);
  }, [isCheckoutSuccess]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === "change") {
        if (name === "province") {
          const { province } = value;
          if (province !== "") {
            const findProvince = provinces.find(
              (p: Province) => p.name === province
            );
            const districts = findProvince ? findProvince.districts : [];
            dispatch({ payload: { districts } });

            value.district = "";
            value.ward = "";
          }
        }
        if (name === "district") {
          const { district, province } = value;
          if (province !== "" && district !== "") {
            const findDistrict = provinces
              .find((p: Province) => p.name === province)
              ?.districts.find((d: District) => d.name === district);
            const wards = findDistrict ? findDistrict.wards : [];
            dispatch({ payload: { wards } });
            value.ward = "";
          } else {
            console.log("Error");
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div>
      <>
        <Head>
          <title>Thanh to??n ????n h??ng</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </>
      <Container maxWidth="lg" sx={{ marginBlock: "24px" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container columnSpacing={2} rowSpacing={2}>
            <Grid item xs={12} md={8}>
              <h1>Th??ng tin ?????t h??ng</h1>
              <Grid container columnSpacing={2} rowSpacing={2}>
                <Grid item xs={12} md={6}>
                  <InputControl
                    label="H??? t??n"
                    error={errors.fullName}
                    register={register("fullName", {
                      required: {
                        value: true,
                        message: "H??? t??n kh??ng ???????c ????? tr???ng",
                      },
                      minLength: {
                        value: 6,
                        message: "M???t kh???u ??t nh???t 6 k?? t???",
                      },
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputControl
                    label="S??? ??i???n tho???i"
                    error={errors.phone}
                    register={register("phone", {
                      required: {
                        value: true,
                        message: "S??? ??i???n tho???i kh??ng ???????c ????? tr???ng",
                      },
                      pattern: {
                        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
                        message: "S??? ??i???n tho???i kh??ng h???p l???",
                      },
                    })}
                  />
                </Grid>
                {visible && userAddress ? (
                  <Grid item xs={12}>
                    <SelectControl
                      label="?????a ch???"
                      options={userAddressData.items.map(
                        (item: UserAddressModel) => ({
                          value: item.id,
                          display: item.getFullAddress(),
                        })
                      )}
                      value={userAddress.id}
                      onChange={handleChange}
                    />
                  </Grid>
                ) : null}
                <Grid item xs={12}>
                  <div
                    style={{ cursor: "pointer", color: "var(--blue)" }}
                    onClick={() => dispatch({ payload: { visible: !visible } })}
                  >
                    {visible ? "+ Th??m ?????a ch??? kh??c" : "S??? ?????a ch???"}
                  </div>
                </Grid>
                {!visible ? (
                  <>
                    <Grid item xs={12}>
                      <SelectControl
                        label="T???nh / Th??nh ph???"
                        options={provinces.map((pro: any) => ({
                          value: pro.name,
                        }))}
                        register={register("province", {
                          required: {
                            value: true,
                            message: "T???nh / Th??nh ph??? kh??ng ???????c ????? tr???ng",
                          },
                        })}
                        required={true}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <SelectControl
                        label="Qu???n / Huy???n"
                        options={districts.map((dis: any) => ({
                          value: dis.name,
                        }))}
                        register={register("district", {
                          required: {
                            value: true,
                            message: "Qu???n / Huy???n kh??ng ???????c ????? tr???ng",
                          },
                        })}
                        required={true}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <SelectControl
                        label="Ph?????ng / X??"
                        options={wards.map((w: any) => ({
                          value: w.name,
                        }))}
                        register={register("ward", {
                          required: {
                            value: true,
                            message: "Ph?????ng / X?? kh??ng ???????c ????? tr???ng",
                          },
                        })}
                        required={true}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InputControl
                        label="?????a ch???"
                        error={errors.address}
                        register={register("address", {
                          required: {
                            value: true,
                            message: "?????a ch??? kh??ng ???????c ????? tr???ng",
                          },
                        })}
                      />
                    </Grid>
                  </>
                ) : null}
              </Grid>
              <h1>Ph????ng th???c thanh to??n</h1>
              <Grid container columnSpacing={2} rowSpacing={2}>
                <Grid item xs={12}>
                  <RadioControl
                    defaultChecked={true}
                    register={register("paymentMethod")}
                    label="Thanh to??n khi nh???n h??ng (COD)"
                    value="COD"
                  />
                </Grid>
                <Grid item xs={12}>
                  <RadioControl
                    register={register("paymentMethod")}
                    label="Thanh to??n qua MOMO"
                    value="MOMO"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <h1>????n h??ng</h1>
              <ul className={styles.items}>
                {cart.items.map((item) => {
                  return (
                    <li key={item.id} className={styles.item}>
                      <div className={styles.start}>
                        <Image
                          width={64}
                          height={64}
                          priority={true}
                          alt=""
                          src={item.getThumbnail()}
                        />
                      </div>
                      <div className={styles.center}>
                        <div className={styles.name}>
                          {item.productVariant?.product?.name}
                        </div>
                        <div className={styles.variants}>
                          {item.productVariant?.variantValues.map(
                            (variantValue) => {
                              return (
                                <div key={variantValue.id}>
                                  {variantValue?.variant?.name}:{" "}
                                  {variantValue.value}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                      <div className={styles.right}>
                        <div>{item.price}</div>
                        <div>x{item.quantity}</div>
                        <div className={styles.total}>
                          {item.getTotalPrice()}
                        </div>
                      </div>
                    </li>
                  );
                })}
                <li>
                  <div className={styles.discountTitle}>
                    S??? d???ng m?? gi???m gi??
                  </div>
                  <div className={styles.discount}>
                    <input placeholder="Nh???p m?? gi???m gi??" ref={discountRef} />
                    <button type="button" onClick={handleUse}>
                      S??? d???ng
                    </button>
                  </div>
                  {orderDiscount.id > 0 ? (
                    <div className={styles.usingDiscount}>
                      ???? ??p d???ng m?? gi???m gi?? {orderDiscount.code}.
                      <span
                        className={styles.cancelDiscount}
                        onClick={() =>
                          dispatch({ payload: { orderDiscount: null } })
                        }
                      >
                        H???y
                      </span>
                    </div>
                  ) : null}
                </li>
                <li>
                  <div className={styles.dPointTitle}>
                    S??? d???ng D-point <span>(1 D-point = 1000??)</span>
                  </div>
                  <div className={styles.dPoint}>
                    <input
                      type="number"
                      step={1}
                      max={profile ? profile.point : 0}
                      defaultValue={0}
                      placeholder="Nh???p s??? l?????ng D-point"
                      min={0}
                      {...register("point")}
                    />
                    <button type="button" onClick={handleUsePoint}>
                      S??? d???ng
                    </button>
                  </div>
                </li>
                <li className={styles["first-row"]}>
                  <span>Gi?? g???c</span>
                  <span>{total}??</span>
                </li>
                {orderDiscount ? (
                  <li className={styles.row}>
                    <span>Gi???m gi??</span>
                    <span style={{ color: "red" }}>
                      -{orderDiscount.value}??
                    </span>
                  </li>
                ) : null}
                <li className={styles["last-row"]}>
                  <span>T???ng c???ng</span>
                  <span>
                    {total - (orderDiscount ? orderDiscount.value : 0)}??
                  </span>
                </li>
                <li className={styles.actions}>
                  <Link href={publicRoutes.cart}>Quay l???i gi??? h??ng</Link>
                  <button type="submit">Thanh to??n</button>
                </li>
              </ul>
            </Grid>
          </Grid>
        </form>
      </Container>
    </div>
  );
};

export default Payment;
