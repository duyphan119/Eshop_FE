import { Button } from "@mui/material";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { deleteUserAddress } from "../../apis/useraddress";
import {
  ButtonControl,
  ConfirmDialog,
  ModalUserAddress,
} from "../../components";
import { AccountLayout } from "../../layouts";
import { MSG_SUCCESS } from "../../utils/constants";
import { UserAddress } from "../../utils/types";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch } from "../../redux/store";
import {
  userAddressActions,
  userAddressSelector,
} from "../../redux/slice/userAddressSlice";
import { useSelector } from "react-redux";
import { UserAddressModel } from "../../models";
import { confirmDialogActions } from "../../redux/slice/confirmDialogSlice";

type Props = {};

const LIMIT = 10;
const Page = (props: Props) => {
  const appDispatch = useAppDispatch();
  const { userAddressData, current, openModal } =
    useSelector(userAddressSelector);

  const handleDelete = (id: number) => {
    appDispatch(
      confirmDialogActions.show({
        onConfirm: () => {
          appDispatch(userAddressActions.fetchDelete(id));
        },
      })
    );
  };

  useEffect(() => {
    appDispatch(userAddressActions.fetchGetAll({ limit: LIMIT }));
  }, []);

  return (
    <AccountLayout titleHeading="Sổ địa chỉ">
      <>
        <Head>
          <title>Sổ địa chỉ</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </>
      <main>
        <ButtonControl
          onClick={() =>
            appDispatch(userAddressActions.showModal(new UserAddressModel()))
          }
          sx={{ mb: 2 }}
          startIcon={<AddIcon />}
        >
          Thêm địa chỉ mới
        </ButtonControl>
        {userAddressData.count > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th style={{ textAlign: "left" }}>Địa chỉ</th>
                <th style={{ width: "100px" }}></th>
              </tr>
            </thead>
            <tbody>
              {userAddressData.items.map((userAddress, index) => {
                return (
                  <tr key={userAddress.id}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td>{userAddress.getFullAddress()}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <ButtonControl
                          color="secondary"
                          onClick={() =>
                            appDispatch(
                              userAddressActions.showModal(userAddress)
                            )
                          }
                        >
                          Sửa
                        </ButtonControl>
                        <ButtonControl
                          color="error"
                          sx={{ ml: 1 }}
                          onClick={() => handleDelete(userAddress.id)}
                        >
                          Xóa
                        </ButtonControl>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
        {openModal ? (
          <ModalUserAddress
            open={openModal}
            onClose={() => appDispatch(userAddressActions.closeModal())}
            row={current}
          />
        ) : null}
      </main>
    </AccountLayout>
  );
};

export default Page;
